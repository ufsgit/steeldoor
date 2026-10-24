import { pool } from '../../../db.js';

export class BookingsService {
  /**
   * Create a new booking using save_booking SP (p_id = NULL)
   */
  async createBooking(data) {
    const name = data.name;
    const mobile = data.mobile;
    const address = data.address;
    const notes = data.notes ?? null;
    const status = data.status || 'NEW';
    const loginRoleId = data.loginRoleId ?? data.login_role_id ?? null;
    const loginId = data.loginId ?? data.login_id ?? null;
    const loginName = data.loginName ?? data.login_name ?? null;
    const stateId = data.stateId ?? data.state_id ?? null;
    const stateName = data.stateName ?? data.state_name ?? null;
    const districtId = data.districtId ?? data.district_id ?? null;
    const districtName = data.districtName ?? data.district_name ?? null;
    const areaId = data.areaId ?? data.area_id ?? null;
    const areaName = data.areaName ?? data.area_name ?? null;
    const branchHeadId = data.branchHeadId ?? data.branch_head_id ?? null;
    const branchHeadName = data.branchHeadName ?? data.branch_head_name ?? null;
    const documents = data.documents ?? [];

    const docsJson = typeof documents === 'string' ? documents : JSON.stringify(documents);

    const [results] = await pool.query(
      `CALL save_booking(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        null, // p_id: NULL for CREATE
        name,
        mobile,
        address,
        notes,
        status || 'NEW',
        loginRoleId,
        loginId,
        loginName,
        stateId,
        stateName,
        districtId,
        districtName,
        areaId,
        areaName,
        branchHeadId,
        branchHeadName,
        docsJson
      ]
    );

    const rows = results?.[0] || [];
    return rows.length > 0 ? this.formatBookingRecord(rows[0]) : null;
  }

  /**
   * Update an existing booking using save_booking SP (p_id = bookingId)
   */
  async updateBooking(id, data = {}) {
    const bookingId = parseInt(id, 10);
    if (isNaN(bookingId)) {
      return null;
    }

    const name = data.name ?? null;
    const mobile = data.mobile ?? null;
    const address = data.address ?? null;
    const notes = data.notes ?? null;
    const status = data.status ?? null;
    const loginRoleId = data.loginRoleId ?? data.login_role_id ?? null;
    const loginId = data.loginId ?? data.login_id ?? null;
    const loginName = data.loginName ?? data.login_name ?? null;
    const stateId = data.stateId ?? data.state_id ?? null;
    const stateName = data.stateName ?? data.state_name ?? null;
    const districtId = data.districtId ?? data.district_id ?? null;
    const districtName = data.districtName ?? data.district_name ?? null;
    const areaId = data.areaId ?? data.area_id ?? null;
    const areaName = data.areaName ?? data.area_name ?? null;
    const branchHeadId = data.branchHeadId ?? data.branch_head_id ?? null;
    const branchHeadName = data.branchHeadName ?? data.branch_head_name ?? null;
    const documents = data.documents;

    let docsJson = null;
    if (documents !== null && documents !== undefined) {
      docsJson = typeof documents === 'string' ? documents : JSON.stringify(documents);
    }

    const [results] = await pool.query(
      `CALL save_booking(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingId, // p_id: valid ID for UPDATE
        name,
        mobile,
        address,
        notes,
        status,
        loginRoleId,
        loginId,
        loginName,
        stateId,
        stateName,
        districtId,
        districtName,
        areaId,
        areaName,
        branchHeadId,
        branchHeadName,
        docsJson
      ]
    );

    const rows = results?.[0] || [];
    return rows.length > 0 ? this.formatBookingRecord(rows[0]) : null;
  }

  /**
   * Unified save handler (calls create if id is null/0, else update)
   */
  async saveBooking(data = {}) {
    const id = data.id ? parseInt(data.id, 10) : null;
    if (id) {
      return this.updateBooking(id, data);
    }
    return this.createBooking(data);
  }

  /**
   * Delete (soft-delete) a booking using delete_booking SP
   */
  async deleteBooking(id) {
    const bookingId = parseInt(id, 10);
    if (isNaN(bookingId)) {
      return false;
    }

    const [results] = await pool.query('CALL delete_booking(?)', [bookingId]);
    const row = results?.[0]?.[0];
    return Boolean(row && (row.affected_rows > 0 || row.success == 1));
  }

  /**
   * Get paginated bookings directly using get_bookings_paginated SP
   * Supports role-based filtering, district, status, client name/phone search, date range, and role filter:
   * - Role 1 (Company) & Role 2 (Coordinator): List all clients
   * - Role 3 (Branch Head): Filter by branch_head_id / district_id
   * - Role 4 (Dealer) & Role 5 (Customer): Filter by login_id
   */
  async getBookings({
    page = 1,
    limit = 15,
    roleId = null,
    loginId = null,
    districtId = null,
    status = null,
    search = null,
    dateFrom = null,
    dateTo = null,
    filterRole = null
  } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 15);
    const roleIdNum = roleId != null && roleId !== '' ? parseInt(roleId, 10) : null;
    const loginIdNum = loginId != null && loginId !== '' ? parseInt(loginId, 10) : null;
    const districtIdNum = districtId != null && districtId !== '' ? parseInt(districtId, 10) : null;
    const cleanStatus = status ? String(status).trim() : null;
    const cleanSearch = search ? String(search).trim() : null;
    const cleanDateFrom = dateFrom ? String(dateFrom).trim() : null;
    const cleanDateTo = dateTo ? String(dateTo).trim() : null;
    const filterRoleNum = filterRole != null && filterRole !== '' ? parseInt(filterRole, 10) : null;

    const [results] = await pool.query(
      'CALL get_bookings_paginated(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        pageNum,
        limitNum,
        roleIdNum,
        loginIdNum,
        districtIdNum,
        cleanStatus,
        cleanSearch,
        cleanDateFrom,
        cleanDateTo,
        filterRoleNum
      ]
    );

    const rows = results?.[0] || [];
    const meta = results?.[1]?.[0] || {};

    const formattedRows = rows.map(b => this.formatBookingRecord(b));
    const total = Number(meta.total_records ?? formattedRows.length);

    return {
      data: formattedRows,
      pagination: {
        total,
        page: Number(meta.current_page ?? pageNum),
        limit: Number(meta.page_size ?? limitNum),
        totalPages: Number(meta.total_pages ?? Math.ceil(total / limitNum) ?? 1)
      }
    };
  }

  /**
   * Get Coordinator bookings with status tabs (ALL, UNREAD, PENDING), district filter, and search
   * Uses stored procedure sp_get_coordinator_bookings
   */
  async getCoordinatorBookings({ status = null, districtId = null, search = null, page = 1, limit = 15 } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 15);
    const districtIdNum = districtId != null && districtId !== '' ? parseInt(districtId, 10) : null;
    const cleanStatus = status ? String(status).trim() : null;
    const cleanSearch = search ? String(search).trim() : null;

    const [results] = await pool.query(
      'CALL sp_get_coordinator_bookings(?, ?, ?, ?, ?)',
      [cleanStatus, districtIdNum, cleanSearch, pageNum, limitNum]
    );

    const rows = results?.[0] || [];
    const meta = results?.[1]?.[0] || {};

    const formattedRows = rows.map(b => this.formatBookingRecord(b));
    const total = Number(meta.total_records ?? formattedRows.length);

    return {
      data: formattedRows,
      pagination: {
        total,
        page: Number(meta.current_page ?? pageNum),
        limit: Number(meta.page_size ?? limitNum),
        totalPages: Number(meta.total_pages ?? Math.ceil(total / limitNum) ?? 1)
      }
    };
  }

  /**
   * Helper to normalize booking documents and field names
   */
  formatBookingRecord(b) {
    let docs = [];
    if (b.documents) {
      if (Array.isArray(b.documents)) {
        docs = b.documents;
      } else if (typeof b.documents === 'string') {
        try {
          docs = JSON.parse(b.documents);
        } catch {
          docs = [b.documents];
        }
      } else {
        docs = [b.documents];
      }
    }

    return {
      id: b.id,
      name: b.name,
      clientName: b.name,
      mobile: b.mobile,
      contactPhone: b.mobile,
      contactEmail: `${(b.name || 'client').toLowerCase().replace(/\s+/g, '')}@example.com`,
      clientType: 'customer',
      address: b.address,
      notes: b.notes || null,
      status: b.status || 'Pending',
      loginRoleId: b.loginRoleId ?? b.login_role_id ?? null,
      loginId: b.loginId ?? b.login_id ?? null,
      loginName: b.loginName ?? b.login_name ?? null,
      stateId: b.stateId ?? b.state_id ?? null,
      stateName: b.stateName ?? b.state_name ?? null,
      districtId: b.districtId ?? b.district_id ?? null,
      districtName: b.districtName ?? b.district_name ?? null,
      area: b.areaName ?? b.area_name ?? '',
      areaId: b.areaId ?? b.area_id ?? null,
      areaName: b.areaName ?? b.area_name ?? null,
      branchHeadId: b.branchHeadId ?? b.branch_head_id ?? null,
      branchHeadName: b.branchHeadName ?? b.branch_head_name ?? null,
      documents: docs,
      createdAt: b.createdAt || b.created_at,
      updatedAt: b.updatedAt || b.updated_at
    };
  }
}

export const bookingsService = new BookingsService();
