import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { UserRole } from '../models';

/**
 * authGuard: Guards protected admin pages.
 * Validates the live user status against backend /api/auth/me before allowing navigation.
 * If user is inactive, deleted, or unauthenticated, redirects to '/'.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // If no token at all, reject immediately
  if (!auth.token()) {
    auth.clearSession();
    return router.createUrlTree(['/']);
  }

  // Live validation with backend
  return auth.verifySession().pipe(
    map(res => {
      if (res && res.user && res.user.is_active !== 0 && res.user.isActive !== 0 && res.user.is_deleted !== 1 && res.user.isDeleted !== 1) {
        return true;
      }
      auth.clearSession();
      return router.createUrlTree(['/']);
    })
  );
};

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.token()) {
      auth.clearSession();
      return router.createUrlTree(['/']);
    }

    return auth.verifySession().pipe(
      map(res => {
        if (!res || !res.user || res.user.is_active === 0 || res.user.isActive === 0 || res.user.is_deleted === 1 || res.user.isDeleted === 1) {
          auth.clearSession();
          return router.createUrlTree(['/']);
        }

        if (allowedRoles.some(role => auth.hasRole(role))) {
          return true;
        }

        const redirectUrl = auth.getRedirectUrlForRole(res.user.role);
        return router.createUrlTree([redirectUrl]);
      })
    );
  };
};

/**
 * Root guard on `/`:
 * When the project root is opened, checks with the backend:
 * - If user is authenticated AND active AND not deleted, redirects to `/admin`.
 * - If inactive, deleted, or invalid token, cleans session and stays on `/` (public landing page).
 */
export const rootGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // If there's no stored token, allow landing page right away
  if (!auth.token()) {
    auth.clearSession();
    return true;
  }

  // Live server validation before deciding navigation
  return auth.verifySession().pipe(
    map(res => {
      if (res && res.user && res.user.is_active !== 0 && res.user.isActive !== 0 && res.user.is_deleted !== 1 && res.user.isDeleted !== 1) {
        return router.createUrlTree(['/admin']);
      }
      // If inactive or deleted, clear local session and stay on public landing page
      auth.clearSession();
      return true;
    })
  );
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.token()) {
    return true;
  }

  return auth.verifySession().pipe(
    map(res => {
      if (res && res.user && res.user.is_active !== 0 && res.user.isActive !== 0 && res.user.is_deleted !== 1 && res.user.isDeleted !== 1) {
        const redirectUrl = auth.getRedirectUrlForRole(res.user.role);
        return router.createUrlTree([redirectUrl]);
      }
      auth.clearSession();
      return true;
    })
  );
};
