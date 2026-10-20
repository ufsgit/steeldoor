import { query, callProcedure } from '../../../db.js';

export class ClientsService {
  async getAll() {
    try {
      // 1. Try get_users_by_filter stored procedure for role 'customer'
      try {
        let spRows = await callProcedure('get_users_by_filter', ['customer', null, null]);
        if (!spRows || spRows.length === 0) {
          spRows = await callProcedure('sp_get_users_by_filter', ['customer', null, null]);
        }
        if (spRows && spRows.length > 0) {
          return spRows.map(u => ({
            id: u.userCode || `cli-${u.id}`,
            dbId: u.id,
            name: u.name,
            clientType: u.userType, // 'customer' or 'dealer'
            email: u.email,
            phone: u.phone,
            address: u.address,
            stateId: u.stateId,
            stateName: u.stateName,
            districtId: u.districtId,
            districtName: u.districtName,
            branchId: u.branchId,
            branchName: u.branchName,
            dealerLicense: u.dealerLicense,
            hasLogin: true,
            username: u.username,
            createdAt: u.createdAt
          }));
        }
      } catch (spErr) {
        // Fall through to query if SP not deployed
      }

      // 2. Direct SQL Query to users table
      const rows = await query(`
        SELECT u.id, u.user_code AS userCode, u.name, u.user_type AS clientType, u.email, u.phone, u.address, 
               u.state_id AS stateId, s.name AS stateName, u.district_id AS districtId, d.name AS districtName,
               u.branch_id AS branchId, b.name AS branchName, u.dealer_license AS dealerLicense, 
               u.username, u.created_at AS createdAt
        FROM users u
        LEFT JOIN states s ON u.state_id = s.id
        LEFT JOIN districts d ON u.district_id = d.id
        LEFT JOIN branches b ON u.branch_id = b.id
        WHERE u.role = 'customer' AND u.is_active = 1
        ORDER BY u.created_at DESC
      `);
      if (rows && rows.length > 0) {
        return rows.map(u => ({ ...u, id: u.userCode || `cli-${u.id}`, hasLogin: true }));
      }
    } catch (err) {
      console.warn('[ClientsService] DB query failed, using in-memory client list.');
    }

    return [
      { id: 'CLI-CUST-1001', name: 'John Mathew', clientType: 'customer', email: 'john.mathew@gmail.com', phone: '+91 94470 55443', address: '42 Orchid Residency, Stadium Link Rd, Kaloor', stateId: 1, stateName: 'Kerala', districtId: 1, districtName: 'Ernakulam Hub', branchId: 1, branchName: 'Ernakulam Regional Hub', hasLogin: true, username: 'user', createdAt: '2026-03-10T10:00:00Z' },
      { id: 'CLI-DEAL-2002', name: 'Metro Infra Ltd', clientType: 'dealer', email: 'contact@metroinfra.in', phone: '+91 98471 88990', address: 'Plot 12, SmartCity Campus, Kakkanad', stateId: 1, stateName: 'Kerala', districtId: 1, districtName: 'Ernakulam Hub', branchId: 1, branchName: 'Ernakulam Regional Hub', dealerLicense: 'CO-INFRA-4491', hasLogin: true, username: 'metro_builders', createdAt: '2026-02-15T09:30:00Z' },
      { id: 'CLI-DEAL-2001', name: 'Apex Doors Kochi', clientType: 'dealer', email: 'sales@apexdoors.com', phone: '+91 98952 33441', address: 'Door No 8/120, Bypass Junction, Edapally', stateId: 1, stateName: 'Kerala', districtId: 1, districtName: 'Ernakulam Hub', branchId: 1, branchName: 'Ernakulam Regional Hub', dealerLicense: 'DL-EKM-2024-88', hasLogin: true, username: 'apex_dealer', createdAt: '2026-01-20T11:00:00Z' }
    ];
  }

  async getById(id) {
    const list = await this.getAll();
    return list.find(c => c.id === id || c.userCode === id || String(c.dbId) === String(id)) || null;
  }

  async create(data, credentials) {
    const userCode = `CLI-${Date.now().toString().slice(-4)}`;
    const username = credentials?.username || `user_${Date.now().toString().slice(-4)}`;
    const password = credentials?.password || 'welcome123';
    const role = 'customer';
    const userType = data.clientType === 'dealer' ? 'dealer' : 'customer';
    const stateId = Number(data.stateId) || 1;
    const branchId = Number(data.branchId) || 1;
    const districtId = Number(data.districtId) || 1;
    const areaId = data.areaId ? Number(data.areaId) : null;

    try {
      // 1. Try create_user stored procedure
      try {
        await callProcedure('create_user', [
          userCode, username, password, role, userType, data.name, data.email || null,
          data.phone || null, stateId, districtId, branchId, areaId, data.address || null, data.dealerLicense || null
        ]);
      } catch (spErr) {
        // Fallback direct SQL insert
        await query(
          `INSERT INTO users (user_code, username, password, role, user_type, name, email, phone, state_id, district_id, branch_id, area_id, address, dealer_license)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [userCode, username, password, role, userType, data.name, data.email || null, data.phone || null, stateId, districtId, branchId, areaId, data.address || null, data.dealerLicense || null]
        );
      }
    } catch (err) {
      console.warn('[ClientsService] DB insert skipped:', err.message);
    }

    return {
      id: userCode,
      userCode,
      name: data.name,
      clientType: userType,
      email: data.email,
      phone: data.phone,
      address: data.address,
      stateId,
      branchId,
      districtId,
      dealerLicense: data.dealerLicense,
      hasLogin: true,
      username,
      createdAt: new Date().toISOString()
    };
  }

  async update(id, data) {
    try {
      await query(
        `UPDATE users SET name = ?, email = ?, phone = ?, address = ?, dealer_license = ? WHERE user_code = ? OR id = ?`,
        [data.name, data.email, data.phone, data.address, data.dealerLicense || null, id, id]
      );
    } catch (err) {
      console.warn('[ClientsService] DB update skipped:', err.message);
    }
    return { id, ...data };
  }

  async setCredentials(id, credentials) {
    try {
      await query(
        `UPDATE users SET username = ?, password = ? WHERE user_code = ? OR id = ?`,
        [credentials.username, credentials.password, id, id]
      );
    } catch (err) {
      console.warn('[ClientsService] DB credentials skipped:', err.message);
    }
    return { success: true };
  }
}

export const clientsService = new ClientsService();
