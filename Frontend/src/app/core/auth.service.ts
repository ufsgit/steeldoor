import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { User, UserRole } from './models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);

  // Core reactive signals
  currentUser = signal<User | null>(null);
  token = signal<string | null>(null);
  isAuthenticated = computed(() => this.currentUser() !== null);
  userRole = computed(() => this.currentUser()?.role || 'admin');

  constructor() {
    this.initSessionFromStorage();
  }

  /**
   * Initializes session from localStorage / cookies in the browser,
   * then verifies token authenticity and active status with the backend.
   */
  private initSessionFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      let storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');

      if (!storedToken && this.document.cookie) {
        const match = this.document.cookie.match(/(?:^|;\s*)(?:auth_token|auth_session)=([^;]*)/);
        if (match) {
          storedToken = decodeURIComponent(match[1]);
        }
      }

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Quick local check if user was already marked inactive or deleted
        if (parsedUser.is_active === 0 || parsedUser.isActive === 0 || parsedUser.is_deleted === 1 || parsedUser.isDeleted === 1) {
          this.clearSession();
          return;
        }

        this.token.set(storedToken);
        this.currentUser.set(parsedUser);

        // Verify with backend that token is valid and user is not deactivated/deleted
        this.verifySession().subscribe();
      } else {
        this.clearSession();
      }
    } catch (err) {
      console.error('Failed to load session from localStorage:', err);
      this.clearSession();
    }
  }

  /**
   * Verify session token against the server to ensure user is still active and valid.
   * If invalid or deactivated, clears session.
   */
  verifySession(): Observable<{ status: number; user: User; token: string } | null> {
    const currentToken = this.token();
    if (!currentToken) {
      this.clearSession();
      return of(null);
    }

    const baseApi = environment.apiUrl ? environment.apiUrl.replace(/\/$/, '') : 'http://localhost:5000/api';
    const url = `${baseApi}/auth/me`;

    return this.http.get<{ status: number; user: User; token: string }>(url, {
      headers: { Authorization: `Bearer ${currentToken}` }
    }).pipe(
      tap(res => {
        if (res && res.user) {
          this.currentUser.set(res.user);
          if (res.token) {
            this.token.set(res.token);
            try {
              localStorage.setItem('auth_token', res.token);
            } catch {}
          }
          try {
            localStorage.setItem('auth_user', JSON.stringify(res.user));
          } catch {}
        }
      }),
      catchError(err => {
        // Token expired, signature invalid, user deleted or user deactivated (401/403)
        if (err.status === 401 || err.status === 403 || err.status === 404) {
          this.clearSession();
          if (isPlatformBrowser(this.platformId) && window.location.hash.includes('/admin')) {
            this.router.navigate(['/']);
          }
        }
        return of(null);
      })
    );
  }

  login(username: string, password: string): Observable<{ user: User; token: string }> {
    const baseApi = isPlatformBrowser(this.platformId) && environment.apiUrl
      ? environment.apiUrl.replace(/\/$/, '')
      : 'http://localhost:5000/api';
    const url = `${baseApi}/auth/web-login`;

    return this.http.post<{ status: number; message: string; user: User; token: string }>(url, { username, password }).pipe(
      tap(res => {
        const userObj = res.user;
        const jwtToken = res.token;

        this.currentUser.set(userObj);
        this.token.set(jwtToken);

        if (isPlatformBrowser(this.platformId)) {
          try {
            localStorage.setItem('auth_token', jwtToken);
            localStorage.setItem('auth_user', JSON.stringify(userObj));
            localStorage.removeItem('logged_out');
            this.document.cookie = `auth_token=${encodeURIComponent(jwtToken)}; path=/; max-age=604800; SameSite=Lax`;
          } catch (e) {
            console.error('Error saving to localStorage:', e);
          }
        }
      })
    );
  }

  logout(): void {
    this.clearSession();
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('logged_out', 'true');
      } catch {}
    }
    this.router.navigate(['/']);
  }

  clearSession(): void {
    this.currentUser.set(null);
    this.token.set(null);

    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        this.document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        this.document.cookie = 'auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      } catch {}
    }
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

  getRedirectUrlForRole(_role?: UserRole): string {
    return '/admin';
  }
}
