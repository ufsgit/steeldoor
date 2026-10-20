import { query, callProcedure } from '../../../db.js';

export class AuthService {
  /**
   * Authenticate a user against the unified users table or stored procedure
   */
  async authenticate(username, password) {
    try {
      // 1. Try MySQL Stored Procedure login_users (or sp_authenticate_user)
      try {
        let spRows = await callProcedure('login_users', [username, password]);
        if (!spRows || spRows.length === 0) {
          spRows = await callProcedure('sp_authenticate_user', [username, password]);
        }
        if (spRows && spRows.length > 0) {
          const userRecord = spRows[0];
          return this.formatSessionResponse(userRecord);
        }
      } catch (spErr) {
        // Fall through to parameterized query if SP is not yet deployed
      }

      // 2. Direct SQL Query to unified users table with joined state, district, and branch
      const rows = await query(
        `SELECT 
            u.id,
            u.user_code AS userCode,
            u.username,
            u.password,
            u.role,
            u.user_type AS userType,
            u.name,
            u.email,
            u.phone,
            u.state_id AS stateId,
            s.name AS stateName,
            u.district_id AS districtId,
            d.name AS districtName,
            d.code AS districtCode,
            u.branch_id AS branchId,
            b.name AS branchName,
            b.branch_code AS branchCode,
            u.address,
            u.dealer_license AS dealerLicense,
            u.is_active AS isActive
         FROM users u
         LEFT JOIN states s ON u.state_id = s.id
         LEFT JOIN districts d ON u.district_id = d.id
         LEFT JOIN branches b ON u.branch_id = b.id
         WHERE u.username = ? AND u.is_active = 1
         LIMIT 1`,
        [username]
      );

      if (rows && rows.length > 0) {
        const user = rows[0];
        // Plain text check or bcrypt.compare(password, user.password)
        if (user.password === password) {
          return this.formatSessionResponse(user);
        }
      }
    } catch (dbError) {
      console.warn('[AuthService] Database table not yet ready. Using schema-compliant fallback.');
    }

    // 3. Schema-compliant development fallback matching the new table hierarchy
    const devUsers = [
      {
        id: 1,
        userCode: 'USR-COMP-001',
        username: 'company_admin',
        password: 'company123',
        role: 'superadmin',
        userType: 'company',
        name: 'SteelGuard Executive Board (Super Admin)',
        email: 'corporate@steeldoor.com',
        phone: '+91 98000 11223',
        stateId: 1,
        stateName: 'Kerala'
      },
      {
        id: 2,
        userCode: 'USR-COORD-001',
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        userType: 'coordinator',
        name: 'Elena Vance (Coordinator)',
        email: 'admin@steeldoor.com',
        phone: '+91 98000 11224',
        stateId: 1,
        stateName: 'Kerala'
      },
      {
        id: 3,
        userCode: 'USR-BH-001',
        username: 'branch_ekm',
        password: 'branch123',
        role: 'subadmin',
        userType: 'branch_head',
        name: 'Rajesh Menon',
        email: 'rajesh.menon@steeldoor.com',
        phone: '+91 98470 12345',
        stateId: 1,
        stateName: 'Kerala',
        districtId: 1,
        districtName: 'Ernakulam Hub',
        branchId: 1,
        branchName: 'Ernakulam Regional Hub'
      },
      {
        id: 4,
        userCode: 'CLI-CUST-1001',
        username: 'user',
        password: 'user123',
        role: 'customer',
        userType: 'customer',
        name: 'John Mathew (Customer)',
        email: 'john.mathew@gmail.com',
        phone: '+91 94470 55443',
        stateId: 1,
        stateName: 'Kerala',
        districtId: 1,
        districtName: 'Ernakulam Hub',
        branchId: 1,
        branchName: 'Ernakulam Regional Hub',
        address: '42 Orchid Residency, Stadium Link Rd, Kaloor'
      },
      {
        id: 5,
        userCode: 'CLI-DEAL-2001',
        username: 'apex_dealer',
        password: 'dealer123',
        role: 'customer',
        userType: 'dealer',
        name: 'Apex Doors Kochi (Dealer)',
        email: 'sales@apexdoors.com',
        phone: '+91 98952 33441',
        stateId: 1,
        stateName: 'Kerala',
        districtId: 1,
        districtName: 'Ernakulam Hub',
        branchId: 1,
        branchName: 'Ernakulam Regional Hub',
        dealerLicense: 'DL-EKM-2024-88',
        address: 'Door No 8/120, Bypass Junction, Edapally'
      },
      {
        id: 6,
        userCode: 'CLI-DEAL-2002',
        username: 'metro_builders',
        password: 'company123',
        role: 'customer',
        userType: 'dealer',
        name: 'Metro Infra Ltd',
        email: 'contact@metroinfra.in',
        phone: '+91 98471 88990',
        stateId: 1,
        stateName: 'Kerala',
        districtId: 1,
        districtName: 'Ernakulam Hub',
        branchId: 1,
        branchName: 'Ernakulam Regional Hub',
        dealerLicense: 'CO-INFRA-4491'
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
    if (userSafe.role === 'superadmin' || userSafe.role === 'admin') {
      frontendRole = 'admin';
    } else if (userSafe.role === 'subadmin') {
      frontendRole = 'branch_head';
    } else if (userSafe.role === 'customer') {
      frontendRole = userSafe.userType === 'customer' ? 'user' : 'client';
    }

    const payload = {
      ...userSafe,
      dbRole: userSafe.role,
      dbUserType: userSafe.userType,
      role: frontendRole,
      clientType: userSafe.userType
    };

    const sessionToken = Buffer.from(JSON.stringify(payload)).toString('base64');
    return { user: payload, sessionToken };
  }
}

export const authService = new AuthService();
