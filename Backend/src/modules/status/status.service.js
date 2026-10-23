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
      clientId: row.client_id,
      clientName: row.client_name,
      status: row.status,
      scheduleDate: this.formatDateOnly(row.schedule_date),
      notes: row.notes || '',
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
    const status = data.status;
    if (!status || !String(status).trim()) {
      throw new Error('status is required (e.g. Scheduled, Completed, Cancelled).');
    }

    const rawScheduleDate = data.scheduleDate ?? data.schedule_date ?? data.scheduledDate ?? null;
    const scheduleDate = this.normalizeDate(rawScheduleDate);
    const notes = data.notes ?? null;
    const createdBy = data.createdBy ?? data.created_by ?? data.userId ?? null;
    const createdByName = data.createdByName ?? data.created_by_name ?? data.userName ?? null;
    const branchHeadId = data.branchHeadId ?? data.branch_head_id ?? data.branchManagerId ?? null;

    const [results] = await pool.query(
      `CALL sp_save_client_status(?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        clientId,
        clientName,
        status,
        scheduleDate,
        notes,
        createdBy,
        createdByName,
        branchHeadId ? parseInt(branchHeadId, 10) : null
      ]
    );

    const rows = results?.[0] || [];
    return rows.length > 0 ? this.formatStatusRecord(rows[0]) : null;
  }

  /**
   * Fetch all status history records for a client using sp_get_client_status_history
   */
  async getStatusHistory(clientId) {
    const cid = parseInt(clientId, 10);
    if (!cid || isNaN(cid)) {
      throw new Error('Invalid client ID.');
    }

    const [results] = await pool.query(`CALL sp_get_client_status_history(?)`, [cid]);
    const rows = results?.[0] || [];
    return rows.map(r => this.formatStatusRecord(r));
  }
}

export const statusService = new StatusService();
