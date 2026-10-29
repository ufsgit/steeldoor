import { pool } from '../../../db.js';

export class BookingHistoryService {
  /**
   * Fetch booking history records using get_booking_history stored procedure
   * @param {Object} params
   * @param {string} [params.search] - Prefix search on booking_name
   * @param {string} [params.actionFilter] - Filter by action type
   * @param {string} [params.fromDate] - YYYY-MM-DD
   * @param {string} [params.toDate] - YYYY-MM-DD
   * @param {number} [params.page] - Page number (defaults to 1)
   * @param {number} [params.limit] - Limit per page (defaults to 20)
   * @param {number} [params.userId] - Current user id
   * @param {number} [params.roleId] - Current user role id (1, 2 = all, 3 = restricted to action_by_id)
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

    // Stored procedure returns results in first array item
    const rows = results?.[0] || [];

    return {
      history: rows,
      page: pageNum,
      limit: limitNum,
      count: rows.length
    };
  }
}

export const bookingHistoryService = new BookingHistoryService();
