import { pool } from '../../../db.js';
import { signToken } from './jwt.util.js';

export class AuthService {
  /**
   * Mobile Login for Coordinator (Role 2) and Branch Head (Role 3)
   * Invokes the MySQL stored procedure `mobile_login(username, password)`
   */
  async mobileLogin(username, password) {
    const [results] = await pool.query('CALL mobile_login(?, ?)', [username, password]);
    const spRows = results && results.length > 0 ? results[0] : [];

    if (spRows && spRows.length > 0) {
      const userRecord = spRows[0];
      return this.formatSessionResponse(userRecord);
    }

    return null;
  }

  /**
   * Helper to normalize user session token and ensure frontend role compatibility
   */
  formatSessionResponse(user) {
    const { password: _, ...userSafe } = user;

    // Map internal DB roles to frontend role conventions
    let frontendRole = 'client';
    const roleId = Number(userSafe.roleId);
    const roleStr = String(userSafe.role || '').toLowerCase();

    if (roleId === 1 || roleStr === 'company' || roleStr === 'superadmin' || roleStr === 'admin') {
      frontendRole = 'admin';
    } else if (roleId === 2 || roleStr === 'coordinator') {
      frontendRole = 'coordinator';
    } else if (roleId === 3 || roleStr === 'branch_head' || roleStr === 'subadmin') {
      frontendRole = 'branch_head';
    } else if (roleId === 5 || roleStr === 'customer') {
      frontendRole = 'user';
    } else if (roleId === 4 || roleStr === 'dealer') {
      frontendRole = 'client';
    }

    const payload = {
      ...userSafe,
      dbRole: userSafe.role,
      dbRoleId: userSafe.roleId,
      dbUserType: userSafe.userType,
      dbUserTypeId: userSafe.userTypeId,
      role: frontendRole,
      clientType: userSafe.userType || userSafe.role
    };

    const token = signToken(payload);
    return {
      user: payload,
      token,
      sessionToken: token
    };
  }
}

export const authService = new AuthService();
