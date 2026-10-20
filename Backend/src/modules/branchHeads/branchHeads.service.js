import { query, callProcedure } from '../../../db.js';

export class BranchHeadsService {
  async getAll() {
    try {
      // 1. Try get_users_by_filter stored procedure for role 'subadmin'
      try {
        let spRows = await callProcedure('get_users_by_filter', ['subadmin', 'branch_head', null]);
        if (!spRows || spRows.length === 0) {
          spRows = await callProcedure('sp_get_users_by_filter', ['subadmin', 'branch_head', null]);
        }
        if (spRows && spRows.length > 0) {
          return spRows.map(u => ({
            id: u.userCode || `bh-${u.id}`,
            dbId: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            districtId: u.districtId ? `dist-${u.districtId}` : 'dist-ekm',
            districtName: u.districtName || 'Ernakulam Hub',
            branchId: u.branchId,
            branchName: u.branchName,
            active: Boolean(u.isActive),
            assignedOrdersCount: 15
          }));
        }
      } catch (spErr) {
        // Fall through to query if SP not deployed
      }

      // 2. Direct query fallback
      const rows = await query(`
        SELECT u.id, u.user_code AS userCode, u.name, u.email, u.phone, u.district_id AS districtId, 
               d.name AS districtName, u.branch_id AS branchId, b.name AS branchName, u.is_active AS active
        FROM users u
        LEFT JOIN districts d ON u.district_id = d.id
        LEFT JOIN branches b ON u.branch_id = b.id
        WHERE u.role = 'subadmin' AND u.is_active = 1
        ORDER BY u.name ASC
      `);
      if (rows && rows.length > 0) {
        return rows.map(r => ({
          ...r,
          id: r.userCode || `bh-${r.id}`,
          districtId: r.districtId ? `dist-${r.districtId}` : 'dist-ekm',
          assignedOrdersCount: 15
        }));
      }
    } catch (err) {
      console.warn('[BranchHeadsService] DB query failed, using in-memory branch heads.');
    }

    return [
      { id: 'bh-1', name: 'Rajesh Menon', email: 'rajesh.menon@steeldoor.com', phone: '+91 98470 12345', districtId: 'dist-ekm', districtName: 'Ernakulam Hub', branchId: 1, branchName: 'Ernakulam Regional Hub', active: true, assignedOrdersCount: 24 },
      { id: 'bh-2', name: 'Suresh Kumar', email: 'suresh.kumar@steeldoor.com', phone: '+91 94471 23456', districtId: 'dist-tvm', districtName: 'Trivandrum Hub', branchId: 2, branchName: 'Trivandrum Regional Hub', active: true, assignedOrdersCount: 18 },
      { id: 'bh-3', name: 'Anas Kabeer', email: 'anas.kabeer@steeldoor.com', phone: '+91 97452 34567', districtId: 'dist-clt', districtName: 'Kozhikode Hub', branchId: 3, branchName: 'Kozhikode Regional Hub', active: true, assignedOrdersCount: 15 },
      { id: 'bh-4', name: 'Mohan Das', email: 'mohan.das@steeldoor.com', phone: '+91 98463 45678', districtId: 'dist-tsr', districtName: 'Thrissur Hub', branchId: 4, branchName: 'Thrissur Regional Hub', active: true, assignedOrdersCount: 12 },
      { id: 'bh-5', name: 'K. V. Pavithran', email: 'pavithran.kv@steeldoor.com', phone: '+91 94954 56789', districtId: 'dist-knr', districtName: 'Kannur Hub', branchId: 5, branchName: 'Kannur Regional Hub', active: true, assignedOrdersCount: 9 }
    ];
  }

  async getById(id) {
    const list = await this.getAll();
    return list.find(b => b.id === id || b.userCode === id || String(b.dbId) === String(id)) || null;
  }

  async create(data) {
    const userCode = `BH-${Date.now().toString().slice(-4)}`;
    const username = data.username || `branch_${data.districtId?.replace('dist-', '') || 'new'}`;
    const password = data.password || 'branch123';
    const stateId = 1;
    const districtId = Number(data.districtId?.replace('dist-', '')) || 1;
    const branchId = districtId;

    try {
      await callProcedure('create_user', [
        userCode, username, password, 'subadmin', 'branch_head', data.name, data.email,
        data.phone, stateId, districtId, branchId, null, data.address || null, null
      ]);
    } catch (err) {
      console.warn('[BranchHeadsService] DB insert skipped:', err.message);
    }
    return { id: userCode, userCode, ...data, active: data.active ?? true, assignedOrdersCount: 0 };
  }

  async update(id, data) {
    try {
      await query(
        `UPDATE users SET name = ?, email = ?, phone = ? WHERE user_code = ? OR id = ?`,
        [data.name, data.email, data.phone, id, id]
      );
    } catch (err) {
      console.warn('[BranchHeadsService] DB update skipped:', err.message);
    }
    return { id, ...data };
  }

  async toggleActive(id, active) {
    try {
      await query(`UPDATE users SET is_active = ? WHERE user_code = ? OR id = ?`, [active ? 1 : 0, id, id]);
    } catch (err) {
      console.warn('[BranchHeadsService] DB toggle skipped:', err.message);
    }
    const current = await this.getById(id);
    return current ? { ...current, active } : { id, active };
  }
}

export const branchHeadsService = new BranchHeadsService();
