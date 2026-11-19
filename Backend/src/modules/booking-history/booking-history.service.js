import { pool } from '../../../db.js';

export class BookingHistoryService {
  /**
   * Fetch booking history records using get_booking_history stored procedure
   */
  async getBookingHistory({
    search = null,
    actionTypeId = null,
    actionFilter = null,
    statusFilter = null,
    statusId = null,
    fromDate = null,
    toDate = null,
    page = 1,
    limit = 20,
    userId = null,
    roleId = null
  } = {}) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;

    let parsedActionTypeId = null;
    if (actionTypeId != null && !isNaN(parseInt(actionTypeId, 10)) && parseInt(actionTypeId, 10) > 0) {
      parsedActionTypeId = parseInt(actionTypeId, 10);
    } else if (actionFilter && !isNaN(parseInt(actionFilter, 10)) && parseInt(actionFilter, 10) > 0) {
      parsedActionTypeId = parseInt(actionFilter, 10);
    } else if (actionFilter && actionFilter !== 'ALL') {
      try {
        const [atRows] = await pool.query(
          'SELECT id FROM action_types WHERE LOWER(name) = LOWER(?) OR LOWER(code) = LOWER(?) LIMIT 1',
          [String(actionFilter).trim(), String(actionFilter).trim()]
        );
        if (atRows && atRows.length > 0) {
          parsedActionTypeId = atRows[0].id;
        }
      } catch (err) {
        console.warn('Could not resolve action_types id:', err.message);
      }
    }

    let parsedStatusId = null;
    const cleanStatusFilter = String(statusFilter || '').toUpperCase().trim();
    const isCompletedFilter = cleanStatusFilter === 'COMPLETED' || parseInt(statusId, 10) === 3;
    const isNotCompletedFilter = cleanStatusFilter === 'NOT_COMPLETED' || parseInt(statusId, 10) === -1;

    if (isCompletedFilter) {
      parsedStatusId = 3; // Status ID 3 is 'Completed'
    } else if (isNotCompletedFilter) {
      parsedStatusId = -1; // -1 indicates Not Completed (new_status_id != 3)
    } else if (statusId != null && !isNaN(parseInt(statusId, 10)) && parseInt(statusId, 10) > 0) {
      parsedStatusId = parseInt(statusId, 10);
    }

    const [results] = await pool.query(
      `CALL get_booking_history(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        search ? search.trim() : null,
        parsedActionTypeId || null,
        parsedStatusId || null,
        fromDate || null,
        toDate || null,
        pageNum,
        limitNum,
        userId ? parseInt(userId, 10) : null,
        roleId ? parseInt(roleId, 10) : null
      ]
    );

    let rows = results?.[0] || [];

    // Filter Not Completed in memory if requested
    if (isNotCompletedFilter) {
      rows = rows.filter(r => r.new_status_id !== 3 && String(r.new_status_code || r.new_status_label).toLowerCase() !== 'completed');
    }

    return {
      history: rows,
      page: pageNum,
      limit: limitNum,
      count: rows.length
    };
  }

  /**
   * Fetch complete history timeline for a specific booking using get_history_by_bookingid
   * with pagination support (default limit: 10)
   * @param {number|string} bookingId
   * @param {number} [page=1]
   * @param {number} [limit=10]
   */
  async getHistoryByBookingId(bookingId, page = 1, limit = 10) {
    const bId = parseInt(bookingId, 10);
    if (!bId || isNaN(bId)) {
      const err = new Error('Invalid booking ID');
      err.status = 400;
      throw err;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    const [results] = await pool.query(
      `CALL get_history_by_bookingid(?, ?, ?)`,
      [bId, pageNum, limitNum]
    );

    const rows = results?.[0] || [];
    return {
      booking_id: bId,
      page: pageNum,
      limit: limitNum,
      count: rows.length,
      history: rows
    };
  }
}

export const bookingHistoryService = new BookingHistoryService();
