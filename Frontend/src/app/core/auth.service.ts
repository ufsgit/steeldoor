import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer, DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { REQUEST } from '@angular/core';
import { Observable, tap } from 'rxjs';
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
  private request = inject(REQUEST, { optional: true });

  // Core reactive signals
  currentUser = signal<User | null>(null);
  token = signal<string | null>(null);
  isAuthenticated = computed(() => this.currentUser() !== null);
  userRole = computed(() => this.currentUser()?.role || 'admin');

  constructor() {
    this.initSessionFromStorage();
  }

  /**
   * Initializes session from localStorage in the browser.
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
        this.token.set(storedToken);
        this.currentUser.set(JSON.parse(storedUser));
      } else if (storedUser) {
        this.currentUser.set(JSON.parse(storedUser));
      } else {
        this.currentUser.set(null);
        this.token.set(null);
      }
    } catch (err) {
      console.error('Failed to load session from localStorage:', err);
      this.currentUser.set(null);
      this.token.set(null);
    }
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
    this.currentUser.set(null);
    this.token.set(null);

    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.setItem('logged_out', 'true');
        // Clear any old auth_session cookies if they were left over
        this.document.cookie = 'auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      } catch {}
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

  getRedirectUrlForRole(_role?: UserRole): string {
    return '/admin';
  }
}
