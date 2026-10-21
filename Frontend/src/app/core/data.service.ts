import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { REQUEST } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import {
  MOCK_BOOKINGS,
  MOCK_BRANCH_HEADS,
  MOCK_CLIENTS,
  MOCK_DISTRICTS,
  MOCK_SERVICES,
  MOCK_SITE_CONTENT,
  MOCK_TESTIMONIALS,
  MOCK_USERS,
  filterBookingsForUser,
  isAdminRole,
  isUserRole
} from './mock-data';
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
        // Standard Web Request object
        if ('url' in this.request && typeof this.request.url === 'string' && this.request.url.startsWith('http')) {
          try {
            return new URL(this.request.url).origin;
          } catch {
            // fallback
          }
        }
        // Express Request object
        const reqAny = this.request as any;
        const host = reqAny.headers?.get?.('host') || reqAny.headers?.host || 'localhost:4000';
        const protocol = reqAny.protocol || 'http';
        return `${protocol}://${host}`;
      }
      return 'http://localhost:4000';
    }
    return ''; // Relative path on client browser
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
      return of(MOCK_DISTRICTS);
    }
    return this.http.get<District[]>(this.url('/api/districts')).pipe(
      catchError(() => of(MOCK_DISTRICTS))
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

  // ---------------- Branch Heads ----------------

  getBranchHeads(): Observable<BranchHead[]> {
    if (isPlatformServer(this.platformId)) {
      return of(MOCK_BRANCH_HEADS);
    }
    return this.http.get<BranchHead[]>(this.url('/api/branch-heads')).pipe(
      catchError(() => of(MOCK_BRANCH_HEADS))
    );
  }

  getBranchHeadById(id: string): Observable<BranchHead> {
    if (isPlatformServer(this.platformId)) {
      const bh = MOCK_BRANCH_HEADS.find(b => b.id === id);
      return of(bh || {} as BranchHead);
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
    const currentUser = this.auth.currentUser();
    if (isPlatformServer(this.platformId)) {
      if (currentUser && currentUser.clientType === 'company') {
        return of(MOCK_CLIENTS);
      }
      if (currentUser && isUserRole(currentUser.role)) {
        const targetId = currentUser.clientId || currentUser.id;
        return of(MOCK_CLIENTS.filter(c => c.id === targetId));
      }
      return of(MOCK_CLIENTS);
    }
    return this.http.get<Client[]>(this.url('/api/clients')).pipe(
      map(clients => {
        // Company account oversees all dealers
        if (currentUser && currentUser.clientType === 'company') {
          return clients;
        }
        if (currentUser && isUserRole(currentUser.role)) {
          const targetId = currentUser.clientId || currentUser.id;
          return clients.filter(c => c.id === targetId);
        }
        return clients;
      }),
      catchError(() => {
        if (currentUser && currentUser.clientType === 'company') {
          return of(MOCK_CLIENTS);
        }
        if (currentUser && isUserRole(currentUser.role)) {
          const targetId = currentUser.clientId || currentUser.id;
          return of(MOCK_CLIENTS.filter(c => c.id === targetId));
        }
        return of(MOCK_CLIENTS);
      })
    );
  }

  getClientById(id: string): Observable<Client> {
    if (isPlatformServer(this.platformId)) {
      const c = MOCK_CLIENTS.find(cl => cl.id === id);
      return of(c || {} as Client);
    }
    return this.http.get<Client>(this.url(`/api/clients/${id}`));
  }

  createClient(data: Partial<Client>, credentials?: { username: string; password: string }): Observable<Client> {
    return this.http.post<Client>(this.url('/api/clients'), { ...data, credentials }).pipe(
      tap(created => {
        // Keep in-memory mock store synchronized
        MOCK_CLIENTS.unshift(created);
        if (credentials) {
          MOCK_USERS.push({
            id: `usr-${created.id}`,
            username: credentials.username,
            password: credentials.password,
            role: 'client',
            clientId: created.id,
            clientType: 'dealer',
            name: created.name,
            email: created.email,
            phone: created.phone
          });
        }
      }),
      catchError(err => {
        // Safe fallback in-memory client creation if server returns error
        const id = `cli-${Date.now()}`;
        const created: Client = {
          id,
          name: data.name || 'New Dealer',
          clientType: data.clientType || 'dealer',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          districtId: data.districtId || 'dist-ekm',
          area: data.area || '',
          contactPerson: data.contactPerson,
          dealerLicense: data.dealerLicense,
          hasLogin: Boolean(credentials),
          username: credentials?.username,
          createdAt: new Date().toISOString()
        };
        MOCK_CLIENTS.unshift(created);
        if (credentials) {
          MOCK_USERS.push({
            id: `usr-${id}`,
            username: credentials.username,
            password: credentials.password,
            role: 'client',
            clientId: id,
            clientType: 'dealer',
            name: created.name,
            email: created.email,
            phone: created.phone
          });
        }
        return of(created);
      })
    );
  }

  updateClient(id: string, data: Partial<Client>): Observable<Client> {
    return this.http.put<Client>(this.url(`/api/clients/${id}`), data);
  }

  setClientCredentials(id: string, credentials: { username: string; password: string }): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(this.url(`/api/clients/${id}/credentials`), credentials);
  }

  // ---------------- Bookings (Admin sees all, User sees only their data, Company oversees dealers) ----------------

  getBookings(filter?: BookingFilters): Observable<Booking[]> {
    const currentUser = this.auth.currentUser();
    if (isPlatformServer(this.platformId)) {
      let list = filterBookingsForUser(MOCK_BOOKINGS, currentUser);
      if (filter?.status) {
        list = list.filter(b => b.status === filter.status);
      }
      if (filter?.districtId) {
        list = list.filter(b => b.districtId === filter.districtId);
      }
      if (filter?.branchHeadId) {
        list = list.filter(b => b.branchHeadId === filter.branchHeadId);
      }
      if (filter?.clientId) {
        list = list.filter(b => b.clientId === filter.clientId);
      }
      if (filter?.search) {
        const s = filter.search.toLowerCase();
        list = list.filter(b =>
          b.id.toLowerCase().includes(s) ||
          b.clientName.toLowerCase().includes(s) ||
          b.districtName.toLowerCase().includes(s)
        );
      }
      return of(list);
    }

    let effectiveClientId = filter?.clientId;

    // Enforce role-based scoping: regular user/customer/dealer can only view their own records,
    // while company accounts oversee all dealer bookings.
    if (currentUser && isUserRole(currentUser.role)) {
      if (currentUser.clientType !== 'company') {
        effectiveClientId = currentUser.clientId || currentUser.id;
      }
    }

    let params = new HttpParams();
    if (filter) {
      if (filter.status) params = params.set('status', filter.status);
      if (filter.districtId) params = params.set('districtId', filter.districtId);
      if (filter.branchHeadId) params = params.set('branchHeadId', filter.branchHeadId);
      if (effectiveClientId) params = params.set('clientId', effectiveClientId);
      if (filter.clientType) params = params.set('clientType', filter.clientType);
      if (filter.search) params = params.set('search', filter.search);
    } else if (effectiveClientId) {
      params = params.set('clientId', effectiveClientId);
    }

    return this.http.get<Booking[]>(this.url('/api/bookings'), { params }).pipe(
      map(bookings => filterBookingsForUser(bookings, currentUser)),
      catchError(() => {
        let list = filterBookingsForUser(MOCK_BOOKINGS, currentUser);
        if (filter?.status) {
          list = list.filter(b => b.status === filter.status);
        }
        if (filter?.search) {
          const s = filter.search.toLowerCase();
          list = list.filter(b =>
            b.id.toLowerCase().includes(s) ||
            b.clientName.toLowerCase().includes(s) ||
            b.districtName.toLowerCase().includes(s)
          );
        }
        return of(list);
      })
    );
  }

  getBookingById(id: string): Observable<Booking> {
    if (isPlatformServer(this.platformId)) {
      const found = MOCK_BOOKINGS.find(b => b.id === id);
      return found ? of(found) : of({} as Booking);
    }
    return this.http.get<Booking>(this.url(`/api/bookings/${id}`)).pipe(
      catchError(() => {
        const found = MOCK_BOOKINGS.find(b => b.id === id);
        return found ? of(found) : of({} as Booking);
      })
    );
  }

  createBooking(payload: CreateBookingPayload): Observable<Booking> {
    return this.http.post<Booking>(this.url('/api/bookings'), payload).pipe(
      tap(created => {
        MOCK_BOOKINGS.unshift(created);
      }),
      catchError(() => {
        const idSeq = 1000 + MOCK_BOOKINGS.length + 1;
        const bookingId = `BK-${new Date().getFullYear()}-${idSeq}`;
        const branchHead = MOCK_BRANCH_HEADS.find(bh => bh.districtId === payload.districtId && bh.active);
        const district = MOCK_DISTRICTS.find(d => d.id === payload.districtId);
        const created: Booking = {
          id: bookingId,
          clientId: payload.clientId,
          clientName: payload.clientName,
          clientType: payload.clientType,
          contactPhone: payload.contactPhone,
          contactEmail: payload.contactEmail,
          districtId: payload.districtId,
          districtName: district ? district.name : payload.districtId,
          area: payload.area,
          address: payload.address,
          landmark: payload.landmark,
          pincode: payload.pincode,
          doorDetails: payload.doorDetails,
          status: 'Pending',
          branchHeadId: branchHead?.id,
          branchHeadName: branchHead?.name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          history: [
            {
              id: `hist-${Date.now().toString().slice(-4)}`,
              action: 'Created',
              status: 'Pending',
              timestamp: new Date().toISOString(),
              performedBy: `${payload.clientName} (Client)`,
              role: 'client',
              notes: 'Booking registered.'
            }
          ]
        };
        MOCK_BOOKINGS.unshift(created);
        return of(created);
      })
    );
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
    if (isPlatformServer(this.platformId)) {
      return of(MOCK_SERVICES);
    }
    return this.http.get<ServiceItem[]>(this.url('/api/services')).pipe(
      catchError(() => of(MOCK_SERVICES))
    );
  }

  getTestimonials(): Observable<TestimonialItem[]> {
    if (isPlatformServer(this.platformId)) {
      return of(MOCK_TESTIMONIALS);
    }
    return this.http.get<TestimonialItem[]>(this.url('/api/testimonials')).pipe(
      catchError(() => of(MOCK_TESTIMONIALS))
    );
  }

  getSiteContent(): Observable<SiteContent> {
    if (isPlatformServer(this.platformId)) {
      return of(MOCK_SITE_CONTENT);
    }
    return this.http.get<SiteContent>(this.url('/api/site-content')).pipe(
      catchError(() => of(MOCK_SITE_CONTENT))
    );
  }
}
