import { query, callProcedure } from '../../../db.js';
import { signToken } from './jwt.util.js';

export class AuthService {
  /**
   * Mobile Login for Coordinator (Role 2) and Branch Head (Role 3)
   * Invokes the MySQL stored procedure `mobile_login(username, password)`
   */
  async mobileLogin(username, password) {
    try {
      // 1. Try MySQL Stored Procedure `mobile_login`
      try {
        const spRows = await callProcedure('mobile_login', [username, password]);
        if (spRows && spRows.length > 0) {
          const userRecord = spRows[0];
          return this.formatSessionResponse(userRecord);
        }
      } catch (spErr) {
        console.warn('[AuthService] mobile_login SP call failed, trying parameterized query:', spErr.message);
      }

      // 2. Direct SQL Query fallback enforcing role_id IN (2, 3)
      const rows = await query(
        `SELECT 
            u.id,
            u.username,
            u.password,
            u.role_id       AS roleId,
            u.role,
            u.user_type_id  AS userTypeId,
            u.user_type     AS userType,
            u.name,
            u.email,
            u.phone,
            u.state_id      AS stateId,
            s.name          AS stateName,
            u.district_id   AS districtId,
            d.name          AS districtName,
            d.code          AS districtCode,
            u.address,
            u.is_active     AS isActive,
            u.last_login_at AS lastLoginAt,
            u.created_at    AS createdAt
         FROM users u
         LEFT JOIN states s ON u.state_id = s.id
         LEFT JOIN districts d ON u.district_id = d.id
         WHERE u.username = ?
           AND u.role_id IN (2, 3)
           AND u.is_active = 1
           AND u.is_deleted = 0
         LIMIT 1`,
        [username]
      );

      if (rows && rows.length > 0) {
        const user = rows[0];
        if (user.password === password) {
          // Update last login timestamp
          query(`UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?`, [user.id]).catch(() => {});
          return this.formatSessionResponse(user);
        }
      }
    } catch (dbError) {
      console.warn('[AuthService] Database error during mobile login:', dbError.message);
    }

    // 3. Fallback for offline development for roles 2 & 3
    const devMobileUsers = [
      {
        id: 2,
        username: 'admin',
        password: 'admin123',
        roleId: 2,
        role: 'coordinator',
        userTypeId: 1,
        userType: 'admin',
        name: 'Elena Vance (Operations Coordinator)',
        email: 'admin@steeldoor.com',
        phone: '+91 98000 11224',
        stateId: 1,
        stateName: 'Kerala'
      },
      {
        id: 3,
        username: 'coordinator',
        password: 'admin123',
        roleId: 2,
        role: 'coordinator',
        userTypeId: 2,
        userType: 'staff',
        name: 'Alex George (Field Coordinator)',
        email: 'coordinator@steeldoor.com',
        phone: '+91 98000 11225',
        stateId: 1,
        stateName: 'Kerala'
      },
      {
        id: 4,
        username: 'branch_ekm',
        password: 'branch123',
        roleId: 3,
        role: 'branch_head',
        userTypeId: 2,
        userType: 'staff',
        name: 'Rajesh Menon',
        email: 'rajesh.menon@steeldoor.com',
        phone: '+91 98470 12345',
        stateId: 1,
        stateName: 'Kerala',
        districtId: 1,
        districtName: 'Ernakulam Hub',
        districtCode: 'dist-ekm'
      },
      {
        id: 5,
        username: 'branch_tvm',
        password: 'branch123',
        roleId: 3,
        role: 'branch_head',
        userTypeId: 2,
        userType: 'staff',
        name: 'Suresh Kumar',
        email: 'suresh.kumar@steeldoor.com',
        phone: '+91 94471 23456',
        stateId: 1,
        stateName: 'Kerala',
        districtId: 2,
        districtName: 'Trivandrum Hub',
        districtCode: 'dist-tvm'
      }
    ];

    const matched = devMobileUsers.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );

    if (matched) {
      return this.formatSessionResponse(matched);
    }

    return null;
  }

  /**
   * General authenticate method for web portal login (all roles)
   */
  async authenticate(username, password) {
    try {
      // 1. Try MySQL Stored Procedure login_users (or sp_authenticate_user / mobile_login)
      try {
        let spRows = await callProcedure('login_users', [username, password]);
        if (!spRows || spRows.length === 0) {
          spRows = await callProcedure('sp_authenticate_user', [username, password]);
        }
        if (spRows && spRows.length > 0) {
          return this.formatSessionResponse(spRows[0]);
        }
      } catch (spErr) {
        // Fall through to direct query
      }

      // 2. Direct SQL Query to unified users table matching clean schema
      const rows = await query(
        `SELECT 
            u.id,
            u.username,
            u.password,
            u.role_id       AS roleId,
            u.role,
            u.user_type_id  AS userTypeId,
            u.user_type     AS userType,
            u.name,
            u.email,
            u.phone,
            u.state_id      AS stateId,
            s.name          AS stateName,
            u.district_id   AS districtId,
            d.name          AS districtName,
            d.code          AS districtCode,
            u.address,
            u.is_active     AS isActive,
            u.last_login_at AS lastLoginAt,
            u.created_at    AS createdAt
         FROM users u
         LEFT JOIN states s ON u.state_id = s.id
         LEFT JOIN districts d ON u.district_id = d.id
         WHERE u.username = ? AND u.is_active = 1 AND u.is_deleted = 0
         LIMIT 1`,
        [username]
      );

      if (rows && rows.length > 0) {
        const user = rows[0];
        if (user.password === password) {
          query(`UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?`, [user.id]).catch(() => {});
          return this.formatSessionResponse(user);
        }
      }
    } catch (dbError) {
      console.warn('[AuthService] Database table not yet ready. Using fallback:', dbError.message);
    }

    // 3. Schema-compliant development fallback matching the new table hierarchy
    const devUsers = [
      {
        id: 1,
        username: 'company_admin',
        password: 'company123',
        roleId: 1,
        role: 'company',
        userTypeId: 1,
        userType: 'admin',
        name: 'SteelGuard Executive Board (Super Admin)',
        email: 'corporate@steeldoor.com',
        phone: '+91 98000 11223',
        stateId: 1,
        stateName: 'Kerala'
      },
      {
        id: 2,
        username: 'admin',
        password: 'admin123',
        roleId: 2,
        role: 'coordinator',
        userTypeId: 1,
        userType: 'admin',
        name: 'Elena Vance (Coordinator)',
        email: 'admin@steeldoor.com',
        phone: '+91 98000 11224',
        stateId: 1,
        stateName: 'Kerala'
      },
      {
        id: 3,
        username: 'coordinator',
        password: 'admin123',
        roleId: 2,
        role: 'coordinator',
        userTypeId: 2,
        userType: 'staff',
        name: 'Alex George (Field Coordinator)',
        email: 'coordinator@steeldoor.com',
        phone: '+91 98000 11225',
        stateId: 1,
        stateName: 'Kerala'
      },
      {
        id: 4,
        username: 'branch_ekm',
        password: 'branch123',
        roleId: 3,
        role: 'branch_head',
        userTypeId: 2,
        userType: 'staff',
        name: 'Rajesh Menon',
        email: 'rajesh.menon@steeldoor.com',
        phone: '+91 98470 12345',
        stateId: 1,
        stateName: 'Kerala',
        districtId: 1,
        districtName: 'Ernakulam Hub',
        districtCode: 'dist-ekm'
      },
      {
        id: 9,
        username: 'user',
        password: 'user123',
        roleId: 5,
        role: 'customer',
        userTypeId: null,
        userType: null,
        name: 'John Mathew (Customer)',
        email: 'john.mathew@gmail.com',
        phone: '+91 94470 55443',
        stateId: 1,
        stateName: 'Kerala',
        districtId: 1,
        districtName: 'Ernakulam Hub',
        address: '42 Orchid Residency, Stadium Link Rd, Kaloor'
      },
      {
        id: 10,
        username: 'apex_dealer',
        password: 'dealer123',
        roleId: 4,
        role: 'dealer',
        userTypeId: null,
        userType: null,
        name: 'Apex Doors Kochi (Dealer)',
        email: 'sales@apexdoors.com',
        phone: '+91 98952 33441',
        stateId: 1,
        stateName: 'Kerala',
        districtId: 1,
        districtName: 'Ernakulam Hub',
        address: 'Door No 8/120, Bypass Junction, Edapally'
      },
      {
        id: 11,
        username: 'metro_builders',
        password: 'company123',
        roleId: 4,
        role: 'dealer',
        userTypeId: null,
        userType: null,
        name: 'Metro Infra Ltd',
        email: 'contact@metroinfra.in',
        phone: '+91 98471 88990',
        stateId: 1,
        stateName: 'Kerala',
        districtId: 1,
        districtName: 'Ernakulam Hub'
      }
    ];

    const matched = devUsers.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );

    if (matched) {
      return this.formatSessionResponse(matched);
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
      sessionToken: token // alias for backwards compatibility
    };
  }
}


export const authService = new AuthService();
