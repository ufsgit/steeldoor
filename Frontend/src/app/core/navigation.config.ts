import { UserRole } from './models';

export interface NavMenuItem {
  id: string;
  label: string;
  route: string;
  icon?: string;
  allowedRoles: ('admin' | 'user' | 'coordinator' | 'client' | 'branch_head')[];
  exact?: boolean;
  category?: string;
  badge?: string;
}

/**
 * Admin / Coordinator Menu Definition
 * Only users with role 'admin' or 'coordinator' are authorized.
 */
export const ADMIN_SIDEBAR_MENUS: NavMenuItem[] = [
  {
    id: 'admin-dashboard',
    label: 'Overview Dashboard',
    route: '/admin',
    category: 'Operations',
    allowedRoles: ['admin', 'coordinator'],
    exact: true
  },
  {
    id: 'admin-bookings',
    label: 'Bookings Master',
    route: '/admin/bookings',
    category: 'Operations',
    allowedRoles: ['admin', 'coordinator']
  },
  {
    id: 'admin-create-booking',
    label: 'Create Booking',
    route: '/bookings/new',
    category: 'Operations',
    allowedRoles: ['admin', 'coordinator']
  },
  {
    id: 'admin-branch-heads',
    label: 'Branch Heads',
    route: '/admin/branch-heads',
    category: 'Network & Partners',
    allowedRoles: ['admin', 'coordinator']
  },
  {
    id: 'admin-areas',
    label: 'District Areas',
    route: '/admin/areas',
    category: 'Network & Partners',
    allowedRoles: ['admin', 'coordinator']
  }
];

/**
 * Regular User (Customer / Dealer / Company) Menu Definition
 * Only regular users with role 'user' or 'client' are authorized.
 */
export const USER_NAV_MENUS: NavMenuItem[] = [
  {
    id: 'user-bookings',
    label: 'My Bookings',
    route: '/client',
    allowedRoles: ['user', 'client'],
    exact: true
  },
  {
    id: 'user-new-fitting',
    label: 'Book Installation',
    route: '/bookings/new',
    allowedRoles: ['user', 'client']
  },
  {
    id: 'user-profile',
    label: 'Account Profile',
    route: '/client/profile',
    allowedRoles: ['user', 'client']
  }
];

/**
 * Filter navigation items based on current active role.
 */
export function filterMenuItemsByRole(
  items: NavMenuItem[],
  role: UserRole | string | null | undefined
): NavMenuItem[] {
  if (!role) return [];
  const normalizedRole = role.toLowerCase();
  return items.filter(item => {
    return item.allowedRoles.some(r => {
      if (r === 'admin' || r === 'coordinator') {
        return normalizedRole === 'admin' || normalizedRole === 'coordinator';
      }
      if (r === 'user' || r === 'client') {
        return normalizedRole === 'user' || normalizedRole === 'client';
      }
      return normalizedRole === r;
    });
  });
}
