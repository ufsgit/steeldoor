import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { REQUEST } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
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
      const path = cleanEndpoint.replace(/^\/api/, '');
      return `${baseApi}${path}`;
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

  // ---------------- Documents & File Uploads ----------------

  uploadDocument(file: File): Observable<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string; filename: string }>(this.url('/api/uploads/single'), formData);
  }

  uploadDocuments(files: File[]): Observable<{ count: number; files: Array<{ url: string; filename: string }>; urls: string[] }> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    return this.http.post<{ count: number; files: Array<{ url: string; filename: string }>; urls: string[] }>(
      this.url('/api/uploads/multiple'),
      formData
    );
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

  createBranchHead(data: Partial<BranchHead> & { password?: string }): Observable<BranchHead> {
    return this.http.post<BranchHead>(this.url('/api/branch-heads'), data);
  }

  updateBranchHead(id: string, data: Partial<BranchHead>): Observable<BranchHead> {
    return this.http.put<BranchHead>(this.url(`/api/branch-heads/${id}`), data);
  }

  toggleBranchHead(id: string, active: boolean): Observable<BranchHead> {
    return this.http.patch<BranchHead>(this.url(`/api/branch-heads/${id}/toggle`), { active });
  }

  // ---------------- Clients ----------------

  getClients(): Observable<Client[]> {
    if (isPlatformServer(this.platformId)) {
      return of([]);
    }
    return this.http.get<Client[]>(this.url('/api/clients')).pipe(
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
    if (isPlatformServer(this.platformId)) {
      return of([]);
    }

    let params = new HttpParams();
    if (filter) {
      if (filter.status) params = params.set('status', filter.status);
      if (filter.districtId) params = params.set('districtId', filter.districtId);
      if (filter.branchHeadId) params = params.set('branchHeadId', filter.branchHeadId);
      if (filter.clientId) params = params.set('clientId', filter.clientId);
      if (filter.clientType) params = params.set('clientType', filter.clientType);
      if (filter.search) params = params.set('search', filter.search);
    }

    return this.http.get<Booking[]>(this.url('/api/bookings'), { params }).pipe(
      catchError(() => of([]))
    );
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
