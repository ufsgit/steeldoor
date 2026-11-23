import { pool } from '../../../db.js';
import { notificationsService } from '../notifications/notifications.service.js';

export class StatusService {
  /**
   * Helper to normalize input dates (MM/DD/YYYY, YYYY-MM-DD, ISO string) into YYYY-MM-DD
   */
  normalizeDate(val) {
    if (!val) return null;
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (!trimmed) return null;
      // Handle MM/DD/YYYY or M/D/YYYY
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
        const [m, d, y] = trimmed.split('/');
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }
      // Handle YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed;
      }
      const parsed = new Date(trimmed);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().slice(0, 10);
      }
    }
    if (val instanceof Date && !isNaN(val.getTime())) {
      return val.toISOString().slice(0, 10);
    }
    return null;
  }

  /**
   * Helper to format a Date object into YYYY-MM-DD using local calendar date
   */
  formatDateOnly(date) {
    if (!date) return null;
    if (typeof date === 'string') {
      return date.slice(0, 10);
    }
    if (date instanceof Date && !isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return String(date).slice(0, 10);
  }

  /**
   * Formats the raw DB record into clean API output
   */
  formatStatusRecord(row) {
    if (!row) return null;
    return {
      id: row.id,
      clientId: row.client_id ?? row.clientId ?? row.id,
      clientName: row.client_name ?? row.clientName,
      status: row.status ?? row.status_label ?? 'New',
      statusId: row.status_id ?? row.statusId ?? 1,
      statusCode: row.status_code ?? row.statusCode ?? 'New',
      statusLabel: row.status_label ?? row.statusLabel ?? row.status ?? 'New',
      statusColorCode: row.status_color_code ?? row.statusColorCode ?? '#3b82f6',
      statusIsFollowup: row.status_is_followup ?? 0,
      scheduleDate: this.formatDateOnly(row.schedule_date),
      notes: row.notes || '',
      staffNotes: row.staff_notes ?? row.staffNotes ?? '',
      assignedHeadDistrictId: row.assigned_head_district_id ?? null,
      assignedHeadDistrictName: row.assigned_head_district_name ?? null,
      assignedHeadAreaId: row.assigned_head_area_id ?? null,
      assignedHeadAreaName: row.assigned_head_area_name ?? null,
      branchHeadId: row.branch_head_id ?? null,
      branchHeadName: row.branch_head_name ?? null,
      createdBy: row.created_by,
      createdByName: row.created_by_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * Save client status update using update_booking_status_or_branch_head
   */
  async saveStatus(data) {
    const bookingId = parseInt(data.clientId ?? data.client_id ?? data.bookingId ?? data.booking_id ?? data.id, 10);
    if (!bookingId || isNaN(bookingId)) {
      throw new Error('booking_id / client_id is required and must be a valid number.');
    }

    // Resolve status_id if passed as number or lookup if passed by name/code
    let statusId = data.statusId ?? data.status_id ?? null;
    if (statusId !== null && statusId !== undefined) {
      statusId = parseInt(statusId, 10);
      if (isNaN(statusId) || statusId <= 0) statusId = null;
    }

    if (!statusId && data.status) {
      const statusStr = String(data.status).trim().toLowerCase();
      const options = await this.getStatusOptions();
      const matched = options.find(o => 
        (o.code && o.code.toLowerCase() === statusStr) || 
        (o.label && o.label.toLowerCase() === statusStr)
      );
      if (matched) {
        statusId = matched.id;
      }
    }

    const rawScheduleDate = data.scheduleDate ?? data.schedule_date ?? data.scheduledDate ?? null;
    const scheduleDate = this.normalizeDate(rawScheduleDate);
    const staffNotes = data.staffNotes ?? data.staff_notes ?? data.notes ?? null;
    const actionById = data.createdBy ?? data.created_by ?? data.userId ?? data.actionById ?? data.action_by_id ?? null;
    const actionByName = data.createdByName ?? data.created_by_name ?? data.userName ?? data.actionByName ?? data.action_by_name ?? null;
    const actionByRoleId = data.actionByRoleId ?? data.action_by_role_id ?? data.roleId ?? data.role_id ?? null;

    const branchHeadId = data.branchHeadId ?? data.branch_head_id ?? data.branchManagerId ?? null;
    const branchHeadName = data.branchHeadName ?? data.branch_head_name ?? null;
    const assignedHeadDistrictId = data.assignedHeadDistrictId ?? data.assigned_head_district_id ?? data.districtId ?? data.district_id ?? null;
    const assignedHeadDistrictName = data.assignedHeadDistrictName ?? data.assigned_head_district_name ?? data.districtName ?? data.district_name ?? null;
    const assignedHeadAreaId = data.assignedHeadAreaId ?? data.assigned_head_area_id ?? data.areaId ?? data.area_id ?? null;
    const assignedHeadAreaName = data.assignedHeadAreaName ?? data.assigned_head_area_name ?? data.areaName ?? data.area_name ?? null;

    const [results] = await pool.query(
      `CALL update_booking_status_or_branch_head(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingId,                                                    // 1. p_booking_id
        statusId ? parseInt(statusId, 10) : null,                     // 2. p_status_id
        scheduleDate,                                                 // 3. p_schedule_date
        staffNotes ? String(staffNotes).trim() : null,                // 4. p_staff_notes
        actionById ? parseInt(actionById, 10) : null,                 // 5. p_action_by_id
        actionByName ? String(actionByName).trim() : null,            // 6. p_action_by_name
        actionByRoleId ? parseInt(actionByRoleId, 10) : null,         // 7. p_action_by_role_id
        branchHeadId ? parseInt(branchHeadId, 10) : null,             // 8. p_branch_head_id
        branchHeadName ? String(branchHeadName).trim() : null,        // 9. p_branch_head_name
        assignedHeadDistrictId ? parseInt(assignedHeadDistrictId, 10) : null, // 10. p_assigned_head_district_id
        assignedHeadDistrictName ? String(assignedHeadDistrictName).trim() : null, // 11. p_assigned_head_district_name
        assignedHeadAreaId ? parseInt(assignedHeadAreaId, 10) : null, // 12. p_assigned_head_area_id
        assignedHeadAreaName ? String(assignedHeadAreaName).trim() : null // 13. p_assigned_head_area_name
      ]
    );

    const rows = results?.[0] || [];
    const formatted = rows.length > 0 ? this.formatStatusRecord(rows[0]) : null;

    // Send push notification to Branch Head when status changes
    if (formatted && formatted.branchHeadId) {
      notificationsService.sendToUser(formatted.branchHeadId, {
        title: `Status: ${formatted.status}`,
        body: `Booking for ${formatted.clientName || 'Client'} status changed to ${formatted.status}.`,
        data: {
          type: 'STATUS_UPDATED',
          bookingId: formatted.clientId,
          status: formatted.status,
          statusCode: formatted.statusCode,
          clientName: formatted.clientName || '',
          scheduleDate: formatted.scheduleDate || ''
        }
      }).catch(err => console.error('[Notifications] Error notifying status update:', err.message));
    }

    return formatted;
  }

  /**
   * Fetch status options ordered by sort_order using get_status_options
   */
  async getStatusOptions() {
    const [results] = await pool.query(`CALL get_status_options()`);
    const rows = results?.[0] || [];
    return rows.map(r => ({
      id: r.id,
      code: r.code,
      label: r.label,
      colorCode: r.colorCode ?? r.color_code ?? null,
      sortOrder: r.sortOrder ?? r.sort_order ?? 0,
      isActive: r.isActive ?? r.is_active ?? 1,
      isFollowUp: r.isFollowUp ?? r.is_followup ?? 0,
      isDate: r.isDate ?? r.is_date ?? 0
    }));
  }
}

export const statusService = new StatusService();
