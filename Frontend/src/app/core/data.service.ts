import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { REQUEST } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { filterBookingsForUser, matchesDistrict } from './role-utils';
import {
  Booking,
  BookingFilters,
  BookingHistoryEntry,
  BranchHead,
  Client,
  CreateBookingPayload,
  District,
  ReassignBookingPayload,
  ServiceItem,
  SiteContent,
  StatusUpdatePayload,
  TestimonialItem
} from './models';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  private request = inject(REQUEST, { optional: true });

  private getBaseUrl(): string {
    if (isPlatformServer(this.platformId)) {
      if (this.request) {
        if ('url' in this.request && typeof this.request.url === 'string' && this.request.url.startsWith('http')) {
          try {
            return new URL(this.request.url).origin;
          } catch {}
        }
        const reqAny = this.request as any;
        const host = reqAny.headers?.get?.('host') || reqAny.headers?.host || 'localhost:4000';
        const protocol = reqAny.protocol || 'http';
        return `${protocol}://${host}`;
      }
      return 'http://localhost:4000';
    }
    return '';
  }

  private url(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    if (isPlatformBrowser(this.platformId) && environment.apiUrl) {
      const baseApi = environment.apiUrl.replace(/\/$/, '');
      if (cleanEndpoint.startsWith('/api')) {
        return `${baseApi}${cleanEndpoint.slice(4)}`;
      }
      return `${baseApi}${cleanEndpoint}`;
    }
    const base = this.getBaseUrl();
    return `${base}${cleanEndpoint}`;
  }

  // ---------------- Districts & Areas ----------------

  getDistricts(): Observable<District[]> {
    if (isPlatformServer(this.platformId)) {
      return of([]);
    }
    return this.http.get<District[]>(this.url('/api/districts')).pipe(
      catchError(() => of([]))
    );
  }

  addArea(districtId: string, area: string): Observable<District> {
    return this.http.post<District>(this.url(`/api/districts/${districtId}/areas`), { area });
  }

  updateArea(districtId: string, oldName: string, newName: string): Observable<District> {
    return this.http.put<District>(this.url(`/api/districts/${districtId}/areas`), { oldName, newName });
  }

  deleteArea(districtId: string, areaName: string): Observable<District> {
    return this.http.delete<District>(this.url(`/api/districts/${districtId}/areas/${encodeURIComponent(areaName)}`));
  }

  // ---------------- Uploads ----------------

  uploadSingle(file: File): Observable<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string; filename: string }>(this.url('/api/uploads/single'), formData);
  }

  uploadMultiple(files: File[]): Observable<{ count: number; files: Array<{ url: string; filename: string }>; urls: string[] }> {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    return this.http.post<{ count: number; files: Array<{ url: string; filename: string }>; urls: string[] }>(
      this.url('/api/uploads/multiple'),
      formData
    );
  }

  uploadDocuments(files: File[]): Observable<{ count: number; files: Array<{ url: string; filename: string }>; urls: string[] }> {
    return this.uploadMultiple(files);
  }

  // ---------------- Branch Heads ----------------

  getBranchHeads(): Observable<BranchHead[]> {
    if (isPlatformServer(this.platformId)) {
      return of([]);
    }
    return this.http.get<BranchHead[]>(this.url('/api/branch-heads')).pipe(
      catchError(() => of([]))
    );
  }

  getBranchHeadById(id: string): Observable<BranchHead> {
    if (isPlatformServer(this.platformId)) {
      return of({} as BranchHead);
    }
    return this.http.get<BranchHead>(this.url(`/api/branch-heads/${id}`));
  }

  createBranchHead(data: Partial<BranchHead>): Observable<BranchHead> {
    return this.http.post<BranchHead>(this.url('/api/branch-heads'), data);
  }

  updateBranchHead(id: string, data: Partial<BranchHead>): Observable<BranchHead> {
    return this.http.put<BranchHead>(this.url(`/api/branch-heads/${id}`), data);
  }

  toggleBranchHead(id: string, active: boolean): Observable<BranchHead> {
    return this.toggleBranchHeadActive(id, active);
  }

  toggleBranchHeadActive(id: string, active: boolean): Observable<BranchHead> {
    return this.http.patch<BranchHead>(this.url(`/api/branch-heads/${id}/toggle`), { active });
  }

  // ---------------- Clients ----------------

  getClients(): Observable<Client[]> {
    const currentUser = this.auth.currentUser();
    const roleId = Number(currentUser?.roleId ?? currentUser?.dbRoleId);
    const isRole1or2 = roleId === 1 || roleId === 2 || currentUser?.role === 'admin' || currentUser?.role === 'coordinator';
    const isRole3 = roleId === 3 || currentUser?.role === 'branch_head';

    const filterClients = (clients: Client[]): Client[] => {
      if (isRole1or2) return clients;
      if (isRole3) {
        return clients.filter(c => matchesDistrict(c.districtId, undefined, currentUser?.districtId, currentUser?.districtName));
      }
      const targetId = String(currentUser?.clientId || currentUser?.id);
      return clients.filter(c => String(c.id) === targetId);
    };

    if (isPlatformServer(this.platformId)) {
      return of([]);
    }
    return this.http.get<Client[]>(this.url('/api/clients')).pipe(
      map(clients => filterClients(Array.isArray(clients) ? clients : [])),
      catchError(() => of([]))
    );
  }

  getClientById(id: string): Observable<Client> {
    if (isPlatformServer(this.platformId)) {
      return of({} as Client);
    }
    return this.http.get<Client>(this.url(`/api/clients/${id}`));
  }

  createClient(data: Partial<Client>, credentials?: { username: string; password: string }): Observable<Client> {
    return this.http.post<Client>(this.url('/api/clients'), { ...data, credentials });
  }

  updateClient(id: string, data: Partial<Client>): Observable<Client> {
    return this.http.put<Client>(this.url(`/api/clients/${id}`), data);
  }

  setClientCredentials(id: string, credentials: { username: string; password: string }): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(this.url(`/api/clients/${id}/credentials`), credentials);
  }

  // ---------------- Bookings ----------------

  getBookings(filter?: BookingFilters): Observable<Booking[]> {
    const currentUser = this.auth.currentUser();
    const roleId = Number(currentUser?.roleId ?? currentUser?.dbRoleId ?? (
      currentUser?.role === 'admin' ? 1 :
      currentUser?.role === 'coordinator' ? 2 :
      currentUser?.role === 'branch_head' ? 3 :
      currentUser?.role === 'user' ? 5 : 4
    ));
    const loginId = currentUser?.id ?? '';
    const districtId = currentUser?.districtId ?? '';

    if (isPlatformServer(this.platformId)) {
      return of([]);
    }

    let params = new HttpParams()
      .set('page', '1')
      .set('limit', '100');

    if (roleId) params = params.set('roleId', String(roleId));
    if (loginId) params = params.set('loginId', String(loginId));
    if (districtId) params = params.set('districtId', String(districtId));

    if (filter) {
      if (filter.status) params = params.set('status', filter.status);
      if (filter.districtId) params = params.set('districtId', filter.districtId);
      if (filter.branchHeadId) params = params.set('branchHeadId', filter.branchHeadId);
      if (filter.clientId) params = params.set('clientId', filter.clientId);
      if (filter.clientType) params = params.set('clientType', filter.clientType);
      if (filter.search) params = params.set('search', filter.search);
    }

    return this.http.get<any>(this.url('/api/bookings'), { params }).pipe(
      map(res => {
        const rawList: any[] = Array.isArray(res) ? res : (res?.data || []);
        const normalized = rawList.map(b => this.normalizeBooking(b));
        return filterBookingsForUser(normalized, currentUser);
      }),
      catchError(() => of([]))
    );
  }

  private normalizeBooking(b: any): Booking {
    let docs: string[] = [];
    if (b.documents) {
      if (Array.isArray(b.documents)) docs = b.documents;
      else if (typeof b.documents === 'string') {
        try { docs = JSON.parse(b.documents); } catch { docs = [b.documents]; }
      } else { docs = [b.documents]; }
    }

    const clientName = b.clientName || b.name || 'Client';
    const contactPhone = b.contactPhone || b.mobile || '';
    const districtName = b.districtName || 'Ernakulam';
    const areaName = b.areaName || b.area || '';

    return {
      id: String(b.id || `BK-${Date.now()}`),
      clientId: b.clientId ? String(b.clientId) : (b.loginId ? String(b.loginId) : String(b.id)),
      clientName,
      name: b.name || clientName,
      clientType: b.clientType || 'customer',
      contactPhone,
      mobile: b.mobile || contactPhone,
      contactEmail: b.contactEmail || `${clientName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      districtId: b.districtId != null ? String(b.districtId) : '1',
      districtName,
      area: areaName,
      areaName,
      address: b.address || '',
      notes: b.notes || '',
      pincode: b.pincode || '',
      documents: docs,
      status: (b.status as any) || 'Pending',
      branchHeadName: b.branchHeadName || (districtName === 'Trivandrum' ? 'Suresh Kumar' : 'Rajesh Menon'),
      loginRoleId: b.loginRoleId != null ? Number(b.loginRoleId) : undefined,
      loginId: b.loginId != null ? b.loginId : undefined,
      loginName: b.loginName || undefined,
      doorDetails: b.doorDetails || {
        doorType: 'Standard Steel Door Installation',
        quantity: 1,
        notes: b.notes || '',
        documents: docs,
        images: docs
      },
      createdAt: b.createdAt || new Date().toISOString(),
      updatedAt: b.updatedAt || new Date().toISOString(),
      history: b.history || []
    };
  }

  getBookingById(id: string): Observable<Booking> {
    if (isPlatformServer(this.platformId)) {
      return of({} as Booking);
    }
    return this.http.get<Booking>(this.url(`/api/bookings/${id}`)).pipe(
      catchError(() => of({} as Booking))
    );
  }

  createBooking(payload: CreateBookingPayload): Observable<Booking> {
    return this.http.post<Booking>(this.url('/api/bookings'), payload);
  }

  updateBookingStatus(id: string, payload: StatusUpdatePayload): Observable<Booking> {
    return this.http.patch<Booking>(this.url(`/api/bookings/${id}/status`), payload);
  }

  reassignBooking(id: string, payload: ReassignBookingPayload): Observable<Booking> {
    return this.http.post<Booking>(this.url(`/api/bookings/${id}/reassign`), payload);
  }

  // ---------------- History / Audit Trail ----------------

  getHistory(filter?: { bookingId?: string; role?: string; action?: string }): Observable<BookingHistoryEntry[]> {
    if (isPlatformServer(this.platformId)) {
      return of([]);
    }
    let params = new HttpParams();
    if (filter) {
      if (filter.bookingId) params = params.set('bookingId', filter.bookingId);
      if (filter.role) params = params.set('role', filter.role);
      if (filter.action) params = params.set('action', filter.action);
    }
    return this.http.get<BookingHistoryEntry[]>(this.url('/api/history'), { params }).pipe(
      catchError(() => of([]))
    );
  }

  // ---------------- Marketing & Site Content ----------------

  getServices(): Observable<ServiceItem[]> {
    return this.http.get<ServiceItem[]>(this.url('/api/services')).pipe(
      catchError(() => of([]))
    );
  }

  getTestimonials(): Observable<TestimonialItem[]> {
    return this.http.get<TestimonialItem[]>(this.url('/api/testimonials')).pipe(
      catchError(() => of([]))
    );
  }

  getSiteContent(): Observable<SiteContent> {
    return this.http.get<SiteContent>(this.url('/api/site-content')).pipe(
      catchError(() => of({
        companyName: 'SteelGuard Systems & Fitting',
        tagline: 'Precision Steel Door Installation & District Fitting Services',
        banners: [],
        stats: [],
        howItWorks: []
      }))
    );
  }

  // ---------------- Users Management ----------------

  getUsers(): Observable<any[]> {
    if (isPlatformServer(this.platformId)) {
      return of([]);
    }
    return this.http.get<{ success: boolean; data: any[] }>(this.url('/api/users')).pipe(
      map(res => res?.data || []),
      catchError(() => of([]))
    );
  }

  createUser(userData: any): Observable<any> {
    return this.http.post<{ success: boolean; data: any }>(this.url('/api/users'), userData).pipe(
      map(res => res?.data || res)
    );
  }

  updateUser(id: number | string, userData: any): Observable<any> {
    return this.http.put<{ success: boolean; data: any }>(this.url(`/api/users/${id}`), userData).pipe(
      map(res => res?.data || res)
    );
  }

  toggleUserStatus(id: number | string): Observable<any> {
    return this.http.patch<{ success: boolean; data: any }>(this.url(`/api/users/${id}/status`), {}).pipe(
      map(res => res?.data || res)
    );
  }

  deleteUser(id: number | string): Observable<any> {
    return this.http.delete(this.url(`/api/users/${id}`));
  }
}
