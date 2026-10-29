import { pool } from '../../../db.js';

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
      scheduleDate: this.formatDateOnly(row.schedule_date),
      notes: row.notes || '',
      staffNotes: row.staff_notes ?? row.staffNotes ?? '',
      assignedHeadDistrictId: row.assigned_head_district_id ?? null,
      assignedHeadDistrictName: row.assigned_head_district_name ?? null,
      branchHeadId: row.branch_head_id ?? null,
      branchHeadName: row.branch_head_name ?? null,
      createdBy: row.created_by,
      createdByName: row.created_by_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * Save client status update using sp_save_client_status
   */
  async saveStatus(data) {
    const clientId = parseInt(data.clientId ?? data.client_id ?? data.id, 10);
    if (!clientId || isNaN(clientId)) {
      throw new Error('client_id is required and must be a valid number.');
    }

    const clientName = data.clientName ?? data.client_name ?? null;
    let status = String(data.status || '').trim();
    if (!status) {
      throw new Error('status is required (e.g. Scheduled, Completed, Cancelled).');
    }

    // Normalize status value
    const lower = status.toLowerCase();
    if (lower === 'scheduled') {
      status = 'Scheduled';
    } else if (lower === 'completed' || lower === 'finished') {
      status = 'Completed';
    } else if (lower === 'cancelled' || lower === 'rejected') {
      status = 'Cancelled';
    } else if (lower === 'new') {
      status = 'New';
    }

    const rawScheduleDate = data.scheduleDate ?? data.schedule_date ?? data.scheduledDate ?? null;
    const scheduleDate = this.normalizeDate(rawScheduleDate);
    const staffNotes = data.staffNotes ?? data.staff_notes ?? data.notes ?? null;
    const createdBy = data.createdBy ?? data.created_by ?? data.userId ?? null;
    const createdByName = data.createdByName ?? data.created_by_name ?? data.userName ?? null;
    const branchHeadId = data.branchHeadId ?? data.branch_head_id ?? data.branchManagerId ?? null;

    const [results] = await pool.query(
      `CALL update_booking_status_or_branch_head(?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        clientId,
        clientName,
        status,
        scheduleDate,
        staffNotes,
        createdBy,
        createdByName,
        branchHeadId ? parseInt(branchHeadId, 10) : null
      ]
    );

    const rows = results?.[0] || [];
    return rows.length > 0 ? this.formatStatusRecord(rows[0]) : null;
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
      isActive: r.isActive ?? r.is_active ?? 1
    }));
  }
}

export const statusService = new StatusService();
