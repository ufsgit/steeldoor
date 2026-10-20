import { query } from '../../../db.js';

export class HistoryService {
  async getAuditHistory(filters = {}) {
    const { bookingId, role, action } = filters;
    try {
      let sql = `
        SELECT h.id, h.booking_id AS bookingId, h.action, h.status, h.timestamp, 
               h.performed_by AS performedBy, h.role, h.notes
        FROM booking_history h
        WHERE 1=1
      `;
      const params = [];

      if (bookingId) {
        sql += ` AND h.booking_id = ?`;
        params.push(bookingId);
      }
      if (role) {
        sql += ` AND h.role = ?`;
        params.push(role);
      }
      if (action) {
        sql += ` AND h.action = ?`;
        params.push(action);
      }

      sql += ` ORDER BY h.timestamp DESC LIMIT 100`;

      const rows = await query(sql, params);
      if (rows && rows.length > 0) return rows;
    } catch (err) {
      console.warn('[HistoryService] DB query failed, using empty history list.');
    }

    return [];
  }
}

export const historyService = new HistoryService();
