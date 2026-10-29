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
   * Web Login for Company (Role 1) and Dealer (Role 4)
   * Invokes the MySQL stored procedure `web_login(username, password)`
   */
  async webLogin(username, password) {
    const [results] = await pool.query('CALL web_login(?, ?)', [username, password]);
    const spRows = results && results.length > 0 ? results[0] : [];

    if (!spRows || spRows.length === 0) {
      return {
        status: 401,
        message: 'Invalid login credentials.',
        data: null
      };
    }

    const row = spRows[0];
    const status = Number(row.status) || 200;
    const message = row.message || (status === 200 ? 'Login successful.' : 'Login failed.');

    if (status !== 200) {
      return {
        status,
        message,
        data: null
      };
    }

    const sessionData = this.formatSessionResponse(row);
    return {
      status: 200,
      message,
      data: sessionData
    };
  }

  /**
   * Validate session token user against current DB state (checks is_active & is_deleted)
   */
  async getActiveUserById(userId) {
    if (!userId) return null;
    const [rows] = await pool.query(
      `SELECT 
        u.id,
        u.username,
        u.role_id AS roleId,
        u.role,
        u.user_type_id AS userTypeId,
        u.user_type AS userType,
        u.name,
        u.email,
        u.phone,
        u.state_id AS stateId,
        s.name AS stateName,
        u.district_id AS districtId,
        d.name AS districtName,
        d.code AS districtCode,
        u.address,
        u.is_active AS isActive,
        u.is_deleted AS isDeleted,
        u.last_login_at AS lastLoginAt,
        u.created_at AS createdAt
      FROM users u
      LEFT JOIN states s ON u.state_id = s.id
      LEFT JOIN districts d ON u.district_id = d.id
      WHERE u.id = ? LIMIT 1`,
      [userId]
    );

    if (!rows || rows.length === 0) {
      return null;
    }

    const user = rows[0];
    if (user.isDeleted === 1 || user.is_deleted === 1 || user.isActive === 0 || user.is_active === 0) {
      return null;
    }

    return this.formatSessionResponse(user);
  }

  /**
   * Helper to normalize user session token and ensure frontend role compatibility
   */
  formatSessionResponse(user) {
    const { password: _, ...userSafe } = user;

    // Map internal DB roles to frontend role conventions
    let frontendRole = 'client';
    const roleId = Number(userSafe.roleId ?? userSafe.role_id);
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
      dbRoleId: userSafe.roleId ?? userSafe.role_id,
      dbUserType: userSafe.userType ?? userSafe.user_type,
      dbUserTypeId: userSafe.userTypeId ?? userSafe.user_type_id,
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
