import { pool } from '../../../db.js';

export class DropdownsService {
  /**
   * Fetch dropdown items using stored procedure sp_get_dropdown_data
   * @param {string} type - 'district' | 'area'
   * @param {number|null} parentId - state_id for districts, district_id for areas
   * @param {string|null} search - search query string
   * @param {number|null} roleId - user role_id (3 = branch_head)
   * @param {number|null} loginId - user id
   * @param {number} page - page number (default 1)
   * @param {number} limit - items per page (default 20)
   * @returns {Promise<Array<{id: number, name: string}>>}
   */
  async getDropdownData(type, parentId = null, search = null, roleId = null, loginId = null, page = 1, limit = 20) {
    const cleanType = String(type || '').trim().toLowerCase();
    const cleanParentId = parentId ? Number(parentId) : null;
    const cleanSearch = search ? String(search).trim() : null;
    const cleanRoleId = roleId ? Number(roleId) : null;
    const cleanLoginId = loginId ? Number(loginId) : null;
    const cleanPage = page ? Math.max(1, Number(page)) : 1;
    const cleanLimit = limit ? Math.max(1, Number(limit)) : 20;

    if (!['district', 'area'].includes(cleanType)) {
      throw new Error('Invalid type parameter. Expected "district" or "area".');
    }

    const [results] = await pool.query(
      'CALL sp_get_dropdown_data(?, ?, ?, ?, ?, ?, ?)',
      [cleanType, cleanParentId, cleanSearch, cleanRoleId, cleanLoginId, cleanPage, cleanLimit]
    );

    // Stored procedure returns array of row arrays
    const rows = results?.[0] || [];
    return rows.map(r => ({
      id: r.id,
      name: r.name
    }));
  }
}

export const dropdownsService = new DropdownsService();
