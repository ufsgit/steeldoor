import { pool } from '../../../db.js';

export class MobileDashboardService {
  /**
   * Fetch Fitmate mobile dashboard metric cards (New, Pending, Completed, Scheduled)
   * via get_dashboard_metrics stored procedure
   */
  async getMetrics({
    period = 'this_month',
    roleId = null,
    loginId = null,
    districtId = null,
    dateFrom = null,
    dateTo = null
  } = {}) {
    const [results] = await pool.query(
      `CALL get_dashboard_metrics(?, ?, ?, ?, ?, ?)`,
      [
        period || 'this_month',
        roleId ? parseInt(roleId, 10) : null,
        loginId ? parseInt(loginId, 10) : null,
        districtId ? parseInt(districtId, 10) : null,
        dateFrom || null,
        dateTo || null
      ]
    );

    const row = results?.[0]?.[0] || {};
    return {
      newBookings: Number(row.new_bookings || 0),
      pendingBookings: Number(row.pending_bookings || 0),
      completedBookings: Number(row.completed_bookings || 0),
      scheduledBookings: Number(row.scheduled_bookings || 0),
      totalBookings: Number(row.total_bookings || 0),
      period: row.active_period || period,
      dateFrom: row.date_from || null,
      dateTo: row.date_to || null
    };
  }
}

export const mobileDashboardService = new MobileDashboardService();
