import { pool } from '../../../db.js';

export class UsersService {
  /**
   * Fetch users with pagination support (default limit: 10)
   */
  async getAllUsers({ page = 1, limit = 10, search, role } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (pageNum - 1) * limitNum;

    let whereClause = 'WHERE u.is_deleted = 0';
    const params = [];

    if (role && role !== 'all') {
      if (role === 'company' || role === 'admin') {
        whereClause += ' AND (u.role_id = 1 OR u.role = ?)';
        params.push('company');
      } else if (role === 'coordinator') {
        whereClause += ' AND (u.role_id = 2 OR u.role = ?)';
        params.push('coordinator');
      } else if (role === 'branch_head') {
        whereClause += ' AND (u.role_id = 3 OR u.role = ?)';
        params.push('branch_head');
      } else if (role === 'dealer') {
        whereClause += ' AND (u.role_id = 4 OR u.role = ?)';
        params.push('dealer');
      } else {
        whereClause += ' AND u.role = ?';
        params.push(role);
      }
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      whereClause += ' AND (u.name LIKE ? OR u.username LIKE ? OR u.email LIKE ? OR u.phone LIKE ? OR u.district_name LIKE ?)';
      params.push(q, q, q, q, q);
    }

    // Total active records count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM users u ${whereClause}`,
      params
    );
    const total = Number(countResult?.[0]?.total || 0);

    // Paginated users query
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
        u.state_name AS stateName,
        u.district_id AS districtId,
        u.district_name AS districtName,
        u.address,
        u.is_active AS isActive,
        u.is_deleted AS isDeleted,
        u.created_at AS createdAt
      FROM users u
      ${whereClause}
      ORDER BY u.id ASC
      LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    // Role counts across all non-deleted users
    const [roleCountRows] = await pool.query(
      'SELECT role, role_id, COUNT(*) AS count FROM users WHERE is_deleted = 0 GROUP BY role, role_id'
    );
    const roleCounts = {
      all: 0,
      company: 0,
      coordinator: 0,
      branch_head: 0,
      dealer: 0,
      customer: 0
    };
    for (const r of roleCountRows) {
      const cnt = Number(r.count || 0);
      const rId = Number(r.role_id);
      roleCounts.all += cnt;
      if (rId === 1 || r.role === 'company' || r.role === 'admin') {
        roleCounts.company += cnt;
      } else if (rId === 2 || r.role === 'coordinator') {
        roleCounts.coordinator += cnt;
      } else if (rId === 3 || r.role === 'branch_head') {
        roleCounts.branch_head += cnt;
      } else if (rId === 4 || r.role === 'dealer') {
        roleCounts.dealer += cnt;
      } else if (rId === 5 || r.role === 'customer') {
        roleCounts.customer += cnt;
      }
    }

    return {
      rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        roleCounts
      }
    };
  }

  /**
   * Create a new user
   */
  async createUser(data) {
    const {
      username,
      password,
      role = 'customer',
      userType,
      name,
      email,
      phone,
      districtId,
      address
    } = data;

    if (!username || !password || !name) {
      throw new Error('Username, password, and name are required.');
    }

    // Check if username already exists
    const [existing] = await pool.query(
      'SELECT id, is_deleted FROM users WHERE username = ? LIMIT 1',
      [username.trim()]
    );
    if (existing && existing.length > 0 && existing[0].is_deleted === 0) {
      throw new Error('User already exists');
    }

    // Role mapping
    const roleMap = {
      company: { roleId: 1, role: 'company', userTypeId: 1, userType: 'admin' },
      admin: { roleId: 1, role: 'company', userTypeId: 1, userType: 'admin' },
      coordinator: { roleId: 2, role: 'coordinator', userTypeId: 2, userType: 'staff' },
      branch_head: { roleId: 3, role: 'branch_head', userTypeId: 2, userType: 'staff' },
      dealer: { roleId: 4, role: 'dealer', userTypeId: null, userType: null },
      customer: { roleId: 5, role: 'customer', userTypeId: null, userType: null }
    };

    const mapped = roleMap[role.toLowerCase()] || {
      roleId: 5,
      role: 'customer',
      userTypeId: null,
      userType: null
    };

    let resolvedDistrictName = null;
    let resolvedDistrictId = districtId ? Number(districtId) : null;

    if (resolvedDistrictId) {
      const [distRows] = await pool.query('SELECT name FROM districts WHERE id = ?', [resolvedDistrictId]);
      if (distRows && distRows.length > 0) {
        resolvedDistrictName = distRows[0].name ? distRows[0].name.replace(' Hub', '').trim() : null;
      }
    }

    // If role is branch_head, ensure no other active (non-deleted) branch head is already assigned to this district
    if ((mapped.roleId === 3 || mapped.role === 'branch_head') && resolvedDistrictId) {
      const [duplicateBranchHeads] = await pool.query(
        `SELECT id, name FROM users 
         WHERE (role_id = 3 OR role = 'branch_head') 
           AND district_id = ? 
           AND is_deleted = 0 
           AND id != ?
         LIMIT 1`,
        [resolvedDistrictId, existing && existing.length > 0 ? existing[0].id : 0]
      );
      if (duplicateBranchHeads && duplicateBranchHeads.length > 0) {
        throw new Error(`District already has an assigned Branch Head (${duplicateBranchHeads[0].name}).`);
      }
    }

    let targetUserId;
    if (existing && existing.length > 0 && existing[0].is_deleted === 1) {
      targetUserId = existing[0].id;
      await pool.query(
        `UPDATE users SET 
          password = ?,
          role_id = ?,
          role = ?,
          user_type_id = ?,
          user_type = ?,
          name = ?,
          email = ?,
          phone = ?,
          state_id = 1,
          state_name = 'Kerala',
          district_id = ?,
          district_name = ?,
          address = ?,
          is_active = 1,
          is_deleted = 0,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          password,
          mapped.roleId,
          mapped.role,
          userType === 'admin' ? 1 : (mapped.userTypeId || null),
          userType || mapped.userType || null,
          name.trim(),
          email ? email.trim() : null,
          phone ? phone.trim() : null,
          resolvedDistrictId,
          resolvedDistrictName,
          address ? address.trim() : null,
          targetUserId
        ]
      );
    } else {
      const [result] = await pool.query(
        `INSERT INTO users (
          username,
          password,
          role_id,
          role,
          user_type_id,
          user_type,
          name,
          email,
          phone,
          state_id,
          state_name,
          district_id,
          district_name,
          address,
          is_active,
          is_deleted
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'Kerala', ?, ?, ?, 1, 0)`,
        [
          username.trim(),
          password,
          mapped.roleId,
          mapped.role,
          userType === 'admin' ? 1 : (mapped.userTypeId || null),
          userType || mapped.userType || null,
          name.trim(),
          email ? email.trim() : null,
          phone ? phone.trim() : null,
          resolvedDistrictId,
          resolvedDistrictName,
          address ? address.trim() : null
        ]
      );
      targetUserId = result.insertId;
    }

    const [createdRows] = await pool.query(
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
        u.state_name AS stateName,
        u.district_id AS districtId,
        u.district_name AS districtName,
        u.address,
        u.is_active AS isActive,
        u.created_at AS createdAt
      FROM users u
      WHERE u.id = ?`,
      [targetUserId]
    );

    return createdRows[0];
  }

  /**
   * Update an existing user
   */
  async updateUser(id, data) {
    const {
      name,
      email,
      phone,
      districtId,
      address,
      role,
      userType,
      password
    } = data;

    let resolvedDistrictName = null;
    let resolvedDistrictId = districtId !== undefined ? (districtId ? Number(districtId) : null) : undefined;

    if (resolvedDistrictId) {
      const [distRows] = await pool.query('SELECT name FROM districts WHERE id = ?', [resolvedDistrictId]);
      if (distRows && distRows.length > 0) {
        resolvedDistrictName = distRows[0].name ? distRows[0].name.replace(' Hub', '').trim() : null;
      }

      // Check current or updated role of user
      let isBranchHead = role ? (role.toLowerCase() === 'branch_head') : false;
      if (!role) {
        const [currentUser] = await pool.query('SELECT role, role_id FROM users WHERE id = ?', [id]);
        if (currentUser && currentUser.length > 0) {
          isBranchHead = currentUser[0].role_id === 3 || currentUser[0].role === 'branch_head';
        }
      }

      if (isBranchHead) {
        const [duplicateBranchHeads] = await pool.query(
          `SELECT id, name FROM users 
           WHERE (role_id = 3 OR role = 'branch_head') 
             AND district_id = ? 
             AND is_deleted = 0 
             AND id != ?
           LIMIT 1`,
          [resolvedDistrictId, id]
        );
        if (duplicateBranchHeads && duplicateBranchHeads.length > 0) {
          throw new Error(`District already has an assigned Branch Head (${duplicateBranchHeads[0].name}).`);
        }
      }
    }

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name.trim());
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email ? email.trim() : null);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone ? phone.trim() : null);
    }
    if (resolvedDistrictId !== undefined) {
      updates.push('district_id = ?, district_name = ?');
      values.push(resolvedDistrictId, resolvedDistrictName);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      values.push(address ? address.trim() : null);
    }
    if (role !== undefined) {
      const roleMap = {
        company: { roleId: 1, role: 'company' },
        admin: { roleId: 1, role: 'company' },
        coordinator: { roleId: 2, role: 'coordinator' },
        branch_head: { roleId: 3, role: 'branch_head' },
        dealer: { roleId: 4, role: 'dealer' },
        customer: { roleId: 5, role: 'customer' }
      };
      const mapped = roleMap[role.toLowerCase()];
      if (mapped) {
        updates.push('role_id = ?, role = ?');
        values.push(mapped.roleId, mapped.role);
      }
    }
    if (userType !== undefined) {
      updates.push('user_type = ?');
      values.push(userType || null);
    }
    if (password) {
      updates.push('password = ?');
      values.push(password);
    }

    if (updates.length > 0) {
      values.push(id);
      await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    }

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
        u.state_name AS stateName,
        u.district_id AS districtId,
        u.district_name AS districtName,
        u.address,
        u.is_active AS isActive,
        u.created_at AS createdAt
      FROM users u
      WHERE u.id = ?`,
      [id]
    );

    return rows[0];
  }

  /**
   * Toggle user active/inactive status
   */
  async toggleStatus(id) {
    await pool.query(
      'UPDATE users SET is_active = IF(is_active = 1, 0, 1) WHERE id = ?',
      [id]
    );

    const [rows] = await pool.query(
      'SELECT id, username, name, is_active AS isActive FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  /**
   * Soft delete a user (set is_deleted = 1)
   */
  async deleteUser(id) {
    await pool.query(
      'UPDATE users SET is_deleted = 1 WHERE id = ?',
      [id]
    );
    return { success: true, id };
  }
}

export const usersService = new UsersService();
