import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';

/**
 * Functional HTTP Interceptor that attaches the JWT token from session/localStorage
 * to all outgoing API requests in the Authorization header: Bearer <token>.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const authService = inject(AuthService);

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

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      },
      withCredentials: true
    });
    return next(authReq);
  }

  // Ensure cookies are transmitted even if bearer token is not yet in storage
  const credReq = req.clone({
    withCredentials: true
  });
  return next(credReq);
};
