import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Functional HTTP Interceptor that attaches the JWT token from session/localStorage
 * to all outgoing API requests in the Authorization header: Bearer <token>.
 * Also intercepts 401 Unauthorized responses to immediately clear invalid/deactivated sessions.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const authService = inject(AuthService);
  const router = inject(Router);

  let token = authService.token();

  if (!token && isPlatformBrowser(platformId)) {
    try {
      token = localStorage.getItem('auth_token');
    } catch {}
  }

  // If no raw token in storage, check cookie auth_session
  if (!token && isPlatformBrowser(platformId)) {
    try {
      const match = document.cookie.match(/(?:^|;\s*)(?:auth_token|auth_session)=([^;]*)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    } catch {}
  }

  if (req.headers.has('X-Skip-Auth')) {
    const cleanReq = req.clone({
      headers: req.headers.delete('X-Skip-Auth')
    });
    return next(cleanReq);
  }

  let finalReq = req;
  if (token) {
    finalReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      },
      withCredentials: true
    });
  } else {
    finalReq = req.clone({
      withCredentials: true
    });
  }

  return next(finalReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // If server reports unauthorized (e.g. account deleted/deactivated) and not during web-login
      if ((err.status === 401 || err.status === 403) && !req.url.includes('/auth/web-login') && !req.url.includes('/auth/mobile-login')) {
        authService.clearSession();
        if (isPlatformBrowser(platformId)) {
          router.navigate(['/']);
        }
      }
      return throwError(() => err);
    })
  );
};
