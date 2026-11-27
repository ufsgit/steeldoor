import { pool } from '../../../db.js';

export class AreasService {
  /**
   * 1. CALL get_area_hierarchy(?)
   * Returns states, districts with area_count, selected_district_id, and active areas
   */
  async getHierarchy(selectedDistrictId = null) {
    const districtIdParam = selectedDistrictId ? Number(selectedDistrictId) : null;
    const [results] = await pool.query('CALL get_area_hierarchy(?)', [districtIdParam]);

    const states = results[0] || [];
    const districts = results[1] || [];
    const targetDistrictRow = results[2] || [];
    const areas = results[3] || [];

    const resolvedDistrictId = targetDistrictRow[0]?.selected_district_id || (districts[0]?.id ?? null);

    return {
      states,
      districts,
      selectedDistrictId: resolvedDistrictId,
      areas
    };
  }

  /**
   * 2. CALL get_areas_by_district(?, ?)
   * Returns active areas for a district with optional search filter
   */
  async getAreasByDistrict(districtId, search = null) {
    if (!districtId) return [];
    const cleanSearch = search && search.trim() ? search.trim() : null;
    const [results] = await pool.query('CALL get_areas_by_district(?, ?)', [Number(districtId), cleanSearch]);
    return results[0] || [];
  }

  /**
   * 2b. CALL get_district_areas_assignment_status(?, ?, ?, ?, ?)
   * Returns paginated active areas filtered strictly by selected district IDs (CSV) with assignment status
   */
  async getAreasAssignmentStatus(districtIds = null, search = null, userId = null, page = 1, limit = 20) {
    let districtIdsParam = null;
    if (Array.isArray(districtIds)) {
      const tokens = districtIds
        .flatMap(v => String(v).split(','))
        .map(s => s.trim())
        .filter(s => s !== '' && s !== '0');
      districtIdsParam = tokens.length > 0 ? tokens.join(',') : null;
    } else if (districtIds !== undefined && districtIds !== null) {
      const trimmed = String(districtIds).trim();
      if (trimmed.toUpperCase() === 'ALL') {
        districtIdsParam = 'ALL';
      } else {
        const tokens = trimmed
          .split(',')
          .map(s => s.trim())
          .filter(s => s !== '' && s !== '0');
        districtIdsParam = tokens.length > 0 ? tokens.join(',') : null;
      }
    }

    const cleanSearch = search && String(search).trim() ? String(search).trim() : null;
    const userIdParam = userId !== undefined && userId !== null && userId !== '' ? Number(userId) : null;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 20);

    const [results] = await pool.query(
      'CALL get_district_areas_assignment_status(?, ?, ?, ?, ?)',
      [districtIdsParam, cleanSearch, userIdParam, pageNum, limitNum]
    );
    const rows = results?.[0] || [];
    const meta = results?.[1]?.[0] || {};
    const total = Number(meta.total ?? rows.length);
    const resolvedPage = Number(meta.page ?? pageNum);
    const resolvedLimit = Number(meta.limit ?? limitNum);
    const totalPages = Number(meta.total_pages ?? Math.max(1, Math.ceil(total / resolvedLimit)));

    const mappedRows = rows.map(r => ({
      id: Number(r.id),
      district_id: Number(r.district_id),
      districtId: Number(r.district_id),
      district_name: r.district_name,
      name: r.name,
      pincode: r.pincode || null,
      assignedUserId: r.assigned_user_id ? Number(r.assigned_user_id) : null,
      assignedUserName: r.assigned_user_name || null,
      isAssigned: r.assigned_user_id !== null && r.assigned_user_id !== undefined,
      isAssignedToOther: Boolean(Number(r.is_assigned_to_other) === 1),
      isAvailable: !r.is_assigned_to_other || Number(r.is_assigned_to_other) === 0
    }));

    return {
      rows: mappedRows,
      pagination: {
        total,
        page: resolvedPage,
        limit: resolvedLimit,
        totalPages
      }
    };
  }

  /**
   * 3. CALL create_or_reactivate_area(?, ?, ?)
   * Inserts or reactivates area with duplicate check
   */
  async createArea({ districtId, name, pincode }) {
    if (!districtId) {
      const err = new Error('District ID is required');
      err.status = 400;
      throw err;
    }
    if (!name || !name.trim()) {
      const err = new Error('Area name is required');
      err.status = 400;
      throw err;
    }

    const cleanName = name.trim();
    const cleanPin = pincode && pincode.trim() ? pincode.trim() : null;

    const [results] = await pool.query(
      'CALL create_or_reactivate_area(?, ?, ?)',
      [Number(districtId), cleanName, cleanPin]
    );

    const statusRow = results[0]?.[0];
    const dataRow = results[1]?.[0];

    if (statusRow && statusRow.status >= 400) {
      const err = new Error(statusRow.message || 'Failed to create area.');
      err.status = statusRow.status;
      throw err;
    }

    return dataRow || { id: statusRow?.id, district_id: districtId, name: cleanName, pincode: cleanPin };
  }

  /**
   * 4. CALL update_area(?, ?, ?, ?)
   * Updates area name and pincode
   */
  async updateArea(id, { name, pincode, districtId }) {
    if (!id) {
      const err = new Error('Area ID is required');
      err.status = 400;
      throw err;
    }
    if (!name || !name.trim()) {
      const err = new Error('Area name is required');
      err.status = 400;
      throw err;
    }

    const cleanName = name.trim();
    const cleanPin = pincode && pincode.trim() ? pincode.trim() : null;
    const districtIdParam = districtId ? Number(districtId) : null;

    const [results] = await pool.query(
      'CALL update_area(?, ?, ?, ?)',
      [Number(id), districtIdParam, cleanName, cleanPin]
    );

    const statusRow = results[0]?.[0];
    const dataRow = results[1]?.[0];

    if (statusRow && statusRow.status >= 400) {
      const err = new Error(statusRow.message || 'Failed to update area.');
      err.status = statusRow.status;
      throw err;
    }

    return dataRow || { id: Number(id), district_id: districtIdParam, name: cleanName, pincode: cleanPin };
  }

  /**
   * 5. CALL soft_delete_area(?)
   * Soft deletes area (sets is_deleted = 1)
   */
  async deleteArea(id) {
    if (!id) {
      const err = new Error('Area ID is required');
      err.status = 400;
      throw err;
    }

    const [results] = await pool.query('CALL soft_delete_area(?)', [Number(id)]);
    const statusRow = results[0]?.[0];

    if (statusRow && statusRow.status >= 400) {
      const err = new Error(statusRow.message || 'Failed to delete area.');
      err.status = statusRow.status;
      throw err;
    }

    return { success: true, message: statusRow?.message || 'Area deleted successfully.' };
  }
}

export const areasService = new AreasService();
