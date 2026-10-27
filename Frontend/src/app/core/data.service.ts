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
  AreaHierarchyResponse,
  AreaItem,
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
  State,
  StatusOption,
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

  // ---------------- Areas & Location Hierarchy ----------------

  getAreaHierarchy(districtId?: number | string): Observable<AreaHierarchyResponse | null> {
    if (isPlatformServer(this.platformId)) {
      return of(null);
    }
    const params = districtId ? new HttpParams().set('districtId', String(districtId)) : undefined;
    return this.http.get<{ success: boolean; data: AreaHierarchyResponse }>(this.url('/api/areas/hierarchy'), { params }).pipe(
      map(res => res?.data || null),
      catchError(() => of(null))
    );
  }

  getStates(): Observable<State[]> {
    if (isPlatformServer(this.platformId)) {
      return of([]);
    }
    return this.http.get<{ success: boolean; data: State[] }>(this.url('/api/areas/states')).pipe(
      map(res => res?.data || []),
      catchError(() => of([]))
    );
  }

  getDistrictsByState(stateId?: number | string): Observable<District[]> {
    if (isPlatformServer(this.platformId)) {
      return of([]);
    }
    const params = stateId ? new HttpParams().set('stateId', String(stateId)) : undefined;
    return this.http.get<{ success: boolean; data: any[] }>(this.url('/api/areas/districts'), { params }).pipe(
      map(res => (res?.data || []).map(d => ({
        id: String(d.id),
        name: d.name,
        code: d.code,
        stateId: d.state_id,
        areas: []
      }))),
      catchError(() => of([]))
    );
  }

  getAreasByDistrict(districtId: number | string, search?: string): Observable<AreaItem[]> {
    if (isPlatformServer(this.platformId)) {
      return of([]);
    }
    let params = new HttpParams().set('districtId', String(districtId));
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<{ success: boolean; data: AreaItem[] }>(this.url('/api/areas'), { params }).pipe(
      map(res => res?.data || []),
      catchError(() => of([]))
    );
  }

  createAreaItem(data: { districtId: number | string; name: string; pincode?: string }): Observable<AreaItem> {
    return this.http.post<{ success: boolean; data: AreaItem }>(this.url('/api/areas'), data).pipe(
      map(res => res.data)
    );
  }

  updateAreaItem(id: number | string, data: { name: string; pincode?: string; districtId?: number | string }): Observable<AreaItem> {
    return this.http.put<{ success: boolean; data: AreaItem }>(this.url(`/api/areas/${id}`), data).pipe(
      map(res => res.data)
    );
  }

  deleteAreaItem(id: number | string): Observable<any> {
    return this.http.delete(this.url(`/api/areas/${id}`));
  }

  // ---------------- Districts & Areas (sp_get_dropdown_data) ----------------

  getDistricts(): Observable<District[]> {
    if (isPlatformServer(this.platformId)) {
      return of([]);
    }
    return this.http.get<District[]>(this.url('/api/districts')).pipe(
      catchError(() => of([]))
    );
  }

  getDropdownData(type: 'district' | 'area', parentId?: number | string, search?: string): Observable<Array<{ id: number; name: string }>> {
    if (isPlatformServer(this.platformId)) {
      return of([]);
    }
    let params = new HttpParams().set('type', type);
    if (parentId) params = params.set('parentId', String(parentId));
    if (search && search.trim()) params = params.set('search', search.trim());

    return this.http.get<{ data: Array<{ id: number; name: string }> }>(this.url('/api/dropdowns'), { params }).pipe(
      map(res => res?.data || []),
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

  uploadMultiple(files: File[], bookingId?: string | number): Observable<{ count: number; files: Array<{ url: string; filename: string }>; urls: string[]; documents?: string[] }> {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    if (bookingId) {
      formData.append('bookingId', String(bookingId));
    }
    return this.http.post<{ count: number; files: Array<{ url: string; filename: string }>; urls: string[]; documents?: string[] }>(
      this.url('/api/uploads/multiple'),
      formData
    );
  }

  uploadDocuments(files: File[], bookingId?: string | number): Observable<{ count: number; files: Array<{ url: string; filename: string }>; urls: string[]; documents?: string[] }> {
    return this.uploadMultiple(files, bookingId);
  }

  // ---------------- Branch Heads ----------------

  getBranchHeads(): Observable<BranchHead[]> {
    if (isPlatformServer(this.platformId)) {
      return of([]);
    }
    return this.http.get<{ success?: boolean; data?: any[] }>(this.url('/api/users?role=branch_head&limit=100')).pipe(
      map(res => {
        const users = Array.isArray(res) ? res : (res?.data || []);
        return users.map((u: any) => ({
          id: String(u.id),
          name: u.name,
          email: u.email || '',
          phone: u.phone || '',
          districtId: u.districtId != null ? String(u.districtId) : (u.district_id != null ? String(u.district_id) : ''),
          districtName: u.districtName || u.district_name || '',
          active: u.isActive !== undefined ? !!u.isActive : (u.is_active !== undefined ? !!u.is_active : true)
        } as BranchHead));
      }),
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

    if (isPlatformServer(this.platformId)) {
      return of([]);
    }

    let params = new HttpParams()
      .set('page', '1')
      .set('limit', '100');

    if (filter) {
      if (filter.statusId != null && filter.statusId !== '') {
        params = params.set('statusId', String(filter.statusId));
      }
      if (filter.districtId) params = params.set('districtId', filter.districtId);
      if (filter.branchHeadId) params = params.set('branchHeadId', filter.branchHeadId);
      if (filter.clientId) params = params.set('clientId', filter.clientId);
      if (filter.clientType) params = params.set('clientType', filter.clientType);
      if (filter.search) params = params.set('search', filter.search);
      if ((filter as any).dateFrom) params = params.set('dateFrom', (filter as any).dateFrom);
      if ((filter as any).dateTo) params = params.set('dateTo', (filter as any).dateTo);
      if ((filter as any).filterRole) params = params.set('filterRole', String((filter as any).filterRole));
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
    const statusCode = b.statusCode || b.status_code || b.status || 'New';
    const statusLabel = b.statusLabel || b.status_label || statusCode;

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
      statusId: b.statusId != null ? Number(b.statusId) : (b.status_id != null ? Number(b.status_id) : 1),
      statusCode,
      statusLabel,
      statusColorCode: b.statusColorCode || b.status_color_code || '#3b82f6',
      status: (statusCode as any) || 'New',
      branchHeadName: b.branchHeadName || (districtName === 'Trivandrum' ? 'Suresh Kumar' : 'Rajesh Menon'),
      branchHeadId: b.branchHeadId != null ? String(b.branchHeadId) : undefined,
      scheduledDate: b.scheduledDate || b.scheduleDate || b.scheduled_date || b.schedule_date || undefined,
      loginRoleId: b.loginRoleId != null ? Number(b.loginRoleId) : undefined,
      loginId: b.loginId != null ? b.loginId : undefined,
      loginName: b.loginName || undefined,
      createdBy: b.createdBy != null ? b.createdBy : b.created_by,
      createdByName: b.createdByName || b.created_by_name,
      doorDetails: b.doorDetails || {
        doorType: 'Standard Steel Door Installation',
        quantity: 1,
        notes: b.notes || '',
        documents: docs,
        images: docs
      },
      createdAt: b.createdAt || b.created_at || new Date().toISOString(),
      updatedAt: b.updatedAt || b.updated_at || new Date().toISOString(),
      history: b.history || []
    };
  }

  // ---------------- Status Options (GET /api/status) ----------------

  getStatusOptions(): Observable<StatusOption[]> {
    if (isPlatformServer(this.platformId)) {
      return of([]);
    }
    return this.http.get<{ success: boolean; count: number; data: StatusOption[] }>(this.url('/api/status')).pipe(
      map(res => res?.data || []),
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

  createPublicBooking(payload: CreateBookingPayload): Observable<Booking> {
    return this.http.post<Booking>(this.url('/api/bookings'), payload, {
      headers: { 'X-Skip-Auth': 'true' }
    });
  }

  updateBooking(id: string | number, data: Partial<Booking>): Observable<Booking> {
    return this.http.put<Booking>(this.url(`/api/bookings/${id}`), data);
  }

  updateBookingStatus(id: string, payload: StatusUpdatePayload): Observable<Booking> {
    return this.http.patch<Booking>(this.url(`/api/bookings/${id}/status`), payload);
  }

  saveStatus(payload: {
    clientId: number | string;
    clientName?: string;
    status: string;
    scheduleDate?: string | null;
    notes?: string | null;
    createdBy?: number | string | null;
    createdByName?: string | null;
    branchHeadId?: number | string | null;
    branchHeadName?: string | null;
    districtId?: number | string | null;
    districtName?: string | null;
  }): Observable<{ success: boolean; message: string; data: any }> {
    return this.http.post<{ success: boolean; message: string; data: any }>(this.url('/api/status'), payload);
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

  getUsers(params?: { page?: number; limit?: number; search?: string; role?: string }): Observable<{ data: any[]; pagination: { total: number; page: number; limit: number; totalPages: number; roleCounts?: Record<string, number> } }> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.role) httpParams = httpParams.set('role', params.role);
    }

    if (isPlatformServer(this.platformId)) {
      return of({
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 1 }
      });
    }

    return this.http.get<{ success: boolean; data: any[]; pagination: any }>(this.url('/api/users'), { params: httpParams }).pipe(
      map(res => ({
        data: res?.data || [],
        pagination: res?.pagination || { total: res?.data?.length || 0, page: 1, limit: 10, totalPages: 1 }
      })),
      catchError(() => of({
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 1 }
      }))
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
