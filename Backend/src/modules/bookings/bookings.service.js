import { pool } from '../../../db.js';

export class BookingsService {
  /**
   * Create a new booking using create_booking SP
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
    const documents = data.documents ?? [];


    const docsJson = typeof documents === 'string' ? documents : JSON.stringify(documents);

    const [results] = await pool.query(
      `CALL create_booking(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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
        docsJson
      ]
    );

    const rows = results?.[0] || [];
    return rows.length > 0 ? this.formatBookingRecord(rows[0]) : null;
  }

  /**
   * Update an existing booking using update_booking SP
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
    const stateId = data.stateId ?? data.state_id ?? null;
    const stateName = data.stateName ?? data.state_name ?? null;
    const districtId = data.districtId ?? data.district_id ?? null;
    const districtName = data.districtName ?? data.district_name ?? null;
    const areaId = data.areaId ?? data.area_id ?? null;
    const areaName = data.areaName ?? data.area_name ?? null;
    const documents = data.documents;

    let docsJson = null;
    if (documents !== null && documents !== undefined) {
      docsJson = typeof documents === 'string' ? documents : JSON.stringify(documents);
    }

    const [results] = await pool.query(
      `CALL update_booking(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingId,
        name,
        mobile,
        address,
        notes,
        status,
        stateId,
        stateName,
        districtId,
        districtName,
        areaId,
        areaName,
        docsJson
      ]
    );

    const rows = results?.[0] || [];
    return rows.length > 0 ? this.formatBookingRecord(rows[0]) : null;
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
   * Supports role-based filtering:
   * - Role 1 (Company) & Role 2 (Coordinator): List all clients
   * - Role 3 (Branch Head): Filter by district_id
   * - Role 4 (Dealer) & Role 5 (Customer): Filter by login_id
   */
  async getBookings({ page = 1, limit = 15, roleId = null, loginId = null, districtId = null } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 15);
    const roleIdNum = roleId != null && roleId !== '' ? parseInt(roleId, 10) : null;
    const loginIdNum = loginId != null && loginId !== '' ? parseInt(loginId, 10) : null;
    const districtIdNum = districtId != null && districtId !== '' ? parseInt(districtId, 10) : null;

    const [results] = await pool.query(
      'CALL get_bookings_paginated(?, ?, ?, ?, ?)',
      [pageNum, limitNum, roleIdNum, loginIdNum, districtIdNum]
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
<<<<<<< Updated upstream
      branchHeadId: b.branchHeadId ?? b.branch_head_id ?? null,
      branchHeadName: b.branchHeadName ?? b.branch_head_name ?? null,
=======
      branchHeadName: b.districtName === 'Trivandrum' ? 'Suresh Kumar' : 'Rajesh Menon',
>>>>>>> Stashed changes
      documents: docs,
      createdAt: b.createdAt || b.created_at,
      updatedAt: b.updatedAt || b.updated_at
    };
  }
}

export const bookingsService = new BookingsService();
