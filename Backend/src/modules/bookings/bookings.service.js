import { pool } from '../../../db.js';
import { notificationsService } from '../notifications/notifications.service.js';

export class BookingsService {
  /**
   * Create a new booking using save_booking SP (p_id = NULL)
   */
  async createBooking(data) {
    const name = data.name;
    const mobile = data.mobile;
    const address = data.address;
    const notes = data.notes ?? null;
    const mapLink = data.mapLink ?? data.map_link ?? data.locationUrl ?? data.location_url ?? null;
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
        mapLink,
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
    const formatted = rows.length > 0 ? this.formatBookingRecord(rows[0]) : null;

    // Send push notification to Branch Head if assigned
    if (formatted && formatted.branchHeadId) {
      notificationsService.sendToUser(formatted.branchHeadId, {
        title: 'New Booking Assigned',
        body: `Booking for ${formatted.name || 'Client'} has been assigned to you.`,
        data: {
          type: 'BOOKING_ASSIGNED',
          bookingId: formatted.id,
          clientName: formatted.name || '',
          district: formatted.districtName || ''
        }
      }).catch(err => console.error('[Notifications] Error notifying branch head:', err.message));
    }

    return formatted;
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
    const mapLink = data.mapLink !== undefined ? data.mapLink : (data.map_link !== undefined ? data.map_link : (data.locationUrl !== undefined ? data.locationUrl : (data.location_url !== undefined ? data.location_url : null)));
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
        mapLink,
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
    const formatted = rows.length > 0 ? this.formatBookingRecord(rows[0]) : null;

    // Send push notification to Branch Head if assigned
    if (formatted && formatted.branchHeadId) {
      notificationsService.sendToUser(formatted.branchHeadId, {
        title: 'New Booking Assigned',
        body: `Booking for ${formatted.name || 'Client'} has been assigned to you.`,
        data: {
          type: 'BOOKING_ASSIGNED',
          bookingId: formatted.id,
          clientName: formatted.name || '',
          district: formatted.districtName || ''
        }
      }).catch(err => console.error('[Notifications] Error notifying branch head:', err.message));
    }

    return formatted;
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
  async deleteBooking(id, actionUser = {}) {
    const bookingId = parseInt(id, 10);
    if (isNaN(bookingId)) {
      return false;
    }

    const actionById = actionUser.actionById ?? actionUser.action_by_id ?? null;
    const actionByName = actionUser.actionByName ?? actionUser.action_by_name ?? 'Admin';
    const actionByRoleId = actionUser.actionByRoleId ?? actionUser.action_by_role_id ?? 1;

    const [results] = await pool.query(
      'CALL delete_booking(?, ?, ?, ?)',
      [
        bookingId,
        actionById ? parseInt(actionById, 10) : null,
        actionByName ? String(actionByName).trim() : null,
        actionByRoleId ? parseInt(actionByRoleId, 10) : null
      ]
    );
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
    statusId = null,
    search = null,
    dateFrom = null,
    dateTo = null,
    filterRole = null,
    isFollowUp = null
  } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 15);
    const roleIdNum = roleId != null && roleId !== '' ? parseInt(roleId, 10) : null;
    const loginIdNum = loginId != null && loginId !== '' ? parseInt(loginId, 10) : null;
    const districtIdNum = districtId != null && districtId !== '' ? parseInt(districtId, 10) : null;
    const statusIdNum = statusId != null && statusId !== '' && !isNaN(parseInt(statusId, 10))
      ? parseInt(statusId, 10)
      : null;
    const cleanSearch = search ? String(search).trim() : null;
    const cleanDateFrom = dateFrom ? String(dateFrom).trim() : null;
    const cleanDateTo = dateTo ? String(dateTo).trim() : null;
    const filterRoleNum = filterRole != null && filterRole !== '' ? parseInt(filterRole, 10) : null;

    const [results] = await pool.query(
      'CALL get_bookings_paginated(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        pageNum,
        limitNum,
        roleIdNum,
        loginIdNum,
        districtIdNum,
        statusIdNum,
        cleanSearch,
        cleanDateFrom,
        cleanDateTo,
        filterRoleNum,
        isFollowUp != null && isFollowUp !== '' ? parseInt(isFollowUp, 10) : null
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

    const statusCode = b.statusCode || b.status_code || b.status || 'New';
    const statusLabel = b.statusLabel || b.status_label || statusCode;

    const mapRegex = /(?:Map(?: Link)?:\s*)?(https?:\/\/(?:www\.)?(?:google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|maps\.app\.goo\.gl|goo\.gl\/maps)[^\s\n]*)/i;
    const mapMatch = (typeof b.notes === 'string') ? b.notes.match(mapRegex) : null;
    const mapLink = b.map_link || b.mapLink || b.location_url || b.locationUrl || (mapMatch ? mapMatch[1] : null);

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
      mapLink: mapLink,
      map_link: mapLink,
      locationUrl: mapLink,
      location_url: mapLink,
      staffNotes: b.staff_notes ?? b.staffNotes ?? null,
      statusId: b.statusId ?? b.status_id ?? 1,
      statusCode: statusCode,
      statusLabel: statusLabel,
      statusColorCode: b.statusColorCode || b.status_color_code || '#3b82f6',
      statusIsFollowup: b.status_is_followup ?? b.statusIsFollowup ?? 0,
      isFollowUp: b.status_is_followup ?? b.statusIsFollowup ?? 0,
      status: statusCode, // Backward compatibility for UI
      loginRoleId: b.loginRoleId ?? b.login_role_id ?? null,
      loginId: b.loginId ?? b.login_id ?? null,
      loginName: b.loginName ?? b.login_name ?? null,
      stateId: b.stateId ?? b.state_id ?? null,
      stateName: b.stateName ?? b.state_name ?? null,
      districtId: b.districtId ?? b.district_id ?? null,
      districtName: b.districtName ?? b.district_name ?? null,
      assignedHeadDistrictId: b.assignedHeadDistrictId ?? b.assigned_head_district_id ?? null,
      assignedHeadDistrictName: b.assignedHeadDistrictName ?? b.assigned_head_district_name ?? null,
      area: b.areaName ?? b.area_name ?? '',
      areaId: b.areaId ?? b.area_id ?? null,
      areaName: b.areaName ?? b.area_name ?? null,
      branchHeadId: b.branchHeadId ?? b.branch_head_id ?? null,
      branchHeadName: b.branchHeadName ?? b.branch_head_name ?? null,
      scheduledDate: b.scheduledDate ?? b.scheduled_date ?? b.scheduleDate ?? b.schedule_date ?? null,
      documents: docs,
      createdBy: b.createdBy ?? b.created_by ?? null,
      createdByName: b.createdByName ?? b.created_by_name ?? null,
      createdAt: b.createdAt || b.created_at,
      updatedAt: b.updatedAt || b.updated_at
    };
  }
}

export const bookingsService = new BookingsService();
