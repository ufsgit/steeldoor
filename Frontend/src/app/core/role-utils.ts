import { Booking, User } from './models';

/**
 * Helper to determine if a role is Admin / Coordinator
 */
export function isAdminRole(role: string | null | undefined): boolean {
  return role === 'admin' || role === 'coordinator';
}

/**
 * Helper to determine if a role is User / Client / Customer / Dealer / Company
 */
export function isUserRole(role: string | null | undefined): boolean {
  return role === 'user' || role === 'client';
}

/**
 * Helper to match districts across numeric IDs, prefixed codes, and normalized names
 */
export function matchesDistrict(
  bDistrictId: any,
  bDistrictName: string | undefined,
  uDistrictId: any,
  uDistrictName: string | undefined
): boolean {
  if (!uDistrictId && !uDistrictName) return true;
  if (uDistrictId && bDistrictId && String(bDistrictId) === String(uDistrictId)) return true;

  const clean = (s: string) => s.toLowerCase().replace(/\s+hub$/i, '').trim();
  if (uDistrictName && bDistrictName && clean(uDistrictName) === clean(bDistrictName)) return true;

  const map: Record<string, string> = {
    '1': 'dist-ekm', 'dist-ekm': '1',
    '2': 'dist-tvm', 'dist-tvm': '2',
    '3': 'dist-clt', 'dist-clt': '3',
    '4': 'dist-tsr', 'dist-tsr': '4',
    '5': 'dist-knr', 'dist-knr': '5'
  };
  if (uDistrictId && bDistrictId && map[String(uDistrictId)] === String(bDistrictId)) return true;

  return false;
}

/**
 * Central Data Filtering Function:
 * - Role 1 (Company) & Role 2 (Coordinator): List ALL clients/bookings
 * - Role 3 (Branch Head): Display client details by district_id
 * - Role 4 (Dealer) & Role 5 (Customer): Take list by login_id
 */
export function filterBookingsForUser(bookings: Booking[], user: User | null): Booking[] {
  if (!user) return [];
  const roleId = Number(user.roleId ?? user.dbRoleId);

  // 1. Role 1 & 2 (or admin / coordinator): display ALL clients
  if (roleId === 1 || roleId === 2 || isAdminRole(user.role)) {
    return [...bookings];
  }

  // 2. Role 3 (Branch Head): display clients details strictly by assigned branch_head_id
  if (roleId === 3 || user.role === 'branch_head') {
    const headId = String(user.branchHeadId || user.id);
    return bookings.filter(b => {
      if (b.branchHeadId != null && String(b.branchHeadId) === headId) return true;
      if (b.branch_head_id != null && String(b.branch_head_id) === headId) return true;
      return false;
    });
  }

  // 3. Role 4 (Dealer) & Role 5 (Customer) or other: take list by login_id
  const targetId = String(user.clientId || user.id);
  return bookings.filter(b => {
    if (b.loginId != null && String(b.loginId) === String(user.id)) return true;
    if (b.clientId && (String(b.clientId) === targetId || String(b.clientId) === String(user.clientId))) return true;
    return false;
  });
}
