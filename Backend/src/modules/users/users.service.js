import { pool } from '../../../db.js';

export class UsersService {
  /**
   * Fetch all active users
   */
  async getAllUsers() {
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
      WHERE u.is_deleted = 0
      ORDER BY u.id ASC`
    );
    return rows;
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
        resolvedDistrictName = distRows[0].name;
      }
    }

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
      [result.insertId]
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
        resolvedDistrictName = distRows[0].name;
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
   * Soft delete a user
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
