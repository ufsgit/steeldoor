import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer, DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { REQUEST } from '@angular/core';
import { Observable, tap, catchError, of, throwError } from 'rxjs';
import { User, UserRole } from './models';
import { MOCK_USERS } from './mock-data';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private request = inject(REQUEST, { optional: true });

  // Core reactive signals (defaults to Elena Vance as shown in SteelGuard Orders Sheet)
  currentUser = signal<User | null>({
    id: 'usr-admin',
    username: 'admin',
    role: 'admin',
    name: 'Elena Vance',
    email: 'admin@steeldoor.com',
    phone: '+91 98000 11223'
  });
  isAuthenticated = computed(() => this.currentUser() !== null);
  userRole = computed(() => this.currentUser()?.role || 'admin');

  constructor() {
    this.initSessionFromCookie();
  }

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

  /**
   * Initializes session from cookie across both SSR server and browser client.
   */
  private initSessionFromCookie(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        if (localStorage.getItem('logged_out') === 'true') {
          this.currentUser.set(null);
          return;
        }
      } catch {}
    }

    let cookieString = '';

    if (isPlatformBrowser(this.platformId)) {
      cookieString = this.document.cookie || '';
    } else if (isPlatformServer(this.platformId) && this.request) {
      if (typeof (this.request as any).headers?.get === 'function') {
        cookieString = (this.request as any).headers.get('cookie') || '';
      } else if ((this.request as any).headers?.cookie) {
        cookieString = (this.request as any).headers.cookie || '';
      }
    }

    const sessionToken = this.parseCookieValue(cookieString, 'auth_session');
    if (sessionToken) {
      try {
        const decoded = this.decodeBase64(sessionToken);
        const userData = JSON.parse(decoded);
        if (userData && userData.id && userData.role) {
          this.currentUser.set(userData as User);
        }
      } catch (err) {
        console.error('Failed to parse auth_session cookie:', err);
      }
    }
  }

  private parseCookieValue(cookies: string, name: string): string | null {
    if (!cookies) return null;
    const match = cookies.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return match ? decodeURIComponent(match[3]) : null;
  }

  private decodeBase64(str: string): string {
    if (typeof atob === 'function') {
      return atob(str);
    }
    return Buffer.from(str, 'base64').toString('utf-8');
  }

  private encodeBase64(str: string): string {
    if (typeof btoa === 'function') {
      return btoa(str);
    }
    return Buffer.from(str, 'utf-8').toString('base64');
  }

  login(username: string, password: string): Observable<{ user: User; sessionToken: string }> {
    const baseApi = isPlatformBrowser(this.platformId) && environment.apiUrl
      ? environment.apiUrl.replace(/\/$/, '')
      : `${this.getBaseUrl()}/api`;
    const url = `${baseApi}/auth/login`;
    return this.http.post<{ user: User; sessionToken: string }>(url, { username, password }).pipe(
      tap(res => {
        this.currentUser.set(res.user);

        // Set cookie on browser as well for immediate persistence
        if (isPlatformBrowser(this.platformId)) {
          const cookieVal = encodeURIComponent(res.sessionToken);
          this.document.cookie = `auth_session=${cookieVal}; path=/; max-age=604800; SameSite=Lax`;
          try { localStorage.removeItem('logged_out'); } catch {}
        }
      }),
      catchError(err => {
        // Fallback for development when standalone backend is offline
        const matched = MOCK_USERS.find(
          u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
        );
        if (matched) {
          const { password: _, ...userWithoutPass } = matched;
          const sessionToken = this.encodeBase64(JSON.stringify(userWithoutPass));
          this.currentUser.set(userWithoutPass as User);

          if (isPlatformBrowser(this.platformId)) {
            const cookieVal = encodeURIComponent(sessionToken);
            this.document.cookie = `auth_session=${cookieVal}; path=/; max-age=604800; SameSite=Lax`;
            try { localStorage.removeItem('logged_out'); } catch {}
          }

          return of({ user: userWithoutPass as User, sessionToken });
        }
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    const baseApi = isPlatformBrowser(this.platformId) && environment.apiUrl
      ? environment.apiUrl.replace(/\/$/, '')
      : `${this.getBaseUrl()}/api`;
    const url = `${baseApi}/auth/logout`;
    this.http.post(url, {}).pipe(
      catchError(() => of(null))
    ).subscribe();

    this.currentUser.set(null);

    if (isPlatformBrowser(this.platformId)) {
      this.document.cookie = 'auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      try { localStorage.setItem('logged_out', 'true'); } catch {}
    }

    this.router.navigate(['/']);
  }

  isAdmin = computed(() => {
    const role = this.currentUser()?.role;
    return role === 'admin' || role === 'coordinator';
  });

  isUser = computed(() => {
    const role = this.currentUser()?.role;
    return role === 'user' || role === 'client';
  });

  hasRole(requiredRole: UserRole): boolean {
    const user = this.currentUser();
    if (!user) return false;
    if (requiredRole === 'admin' || requiredRole === 'coordinator') {
      return user.role === 'admin' || user.role === 'coordinator';
    }
    if (requiredRole === 'user' || requiredRole === 'client') {
      return user.role === 'user' || user.role === 'client';
    }
    return user.role === requiredRole;
  }

  getRedirectUrlForRole(role: UserRole): string {
    switch (role) {
      case 'admin':
      case 'coordinator':
        return '/admin';
      case 'branch_head':
        return '/branch';
      case 'user':
      case 'client':
        return '/client';
      default:
        return '/';
    }
  }
}
