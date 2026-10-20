import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { UserRole } from '../models';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/']);
};

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const user = auth.currentUser();
    if (!user) {
      return router.createUrlTree(['/']);
    }

    if (allowedRoles.some(role => auth.hasRole(role))) {
      return true;
    }

    // Redirect to the user's appropriate role dashboard
    const redirectUrl = auth.getRedirectUrlForRole(user.role);
    return router.createUrlTree([redirectUrl]);
  };
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.currentUser();
  if (user) {
    const redirectUrl = auth.getRedirectUrlForRole(user.role);
    return router.createUrlTree([redirectUrl]);
  }

  return true;
};
