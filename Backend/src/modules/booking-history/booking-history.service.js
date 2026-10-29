import { pool } from '../../../db.js';

export class BookingHistoryService {
  /**
   * Fetch booking history records using get_booking_history stored procedure
   */
  async getBookingHistory({
    search = null,
    actionFilter = null,
    fromDate = null,
    toDate = null,
    page = 1,
    limit = 20,
    userId = null,
    roleId = null
  } = {}) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;

    const [results] = await pool.query(
      `CALL get_booking_history(?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        search ? search.trim() : null,
        actionFilter ? actionFilter.trim() : null,
        fromDate || null,
        toDate || null,
        pageNum,
        limitNum,
        userId ? parseInt(userId, 10) : null,
        roleId ? parseInt(roleId, 10) : null
      ]
    );

    const rows = results?.[0] || [];

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
