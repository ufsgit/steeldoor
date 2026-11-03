import { pool } from '../../../db.js';

export class ReportsService {
  /**
   * Fetch activity report metrics grouped by day/week/month/year using get_booking_reports SP
   *
   * @param {Object} params
   * @param {number|null} params.roleId - 1 (Company), 2 (Coordinator), 3 (Branch Head)
   * @param {number|null} params.loginId - Current logged-in user id
   * @param {number|null} params.assignedHeadDistrictId - District ID assigned to Branch Head
   * @param {string|null} params.dateFrom - Start date (YYYY-MM-DD)
   * @param {string|null} params.dateTo - End date (YYYY-MM-DD)
   */
  async getBookingReports({
    roleId = null,
    loginId = null,
    assignedHeadDistrictId = null,
    dateFrom = null,
    dateTo = null
  } = {}) {
    const roleIdNum = roleId != null && roleId !== '' ? parseInt(roleId, 10) : null;
    const loginIdNum = loginId != null && loginId !== '' ? parseInt(loginId, 10) : null;
    const districtIdNum =
      assignedHeadDistrictId != null && assignedHeadDistrictId !== ''
        ? parseInt(assignedHeadDistrictId, 10)
        : null;

    const [results] = await pool.query(
      'CALL get_booking_reports(?, ?, ?, ?, ?)',
      [
        roleIdNum,
        loginIdNum,
        districtIdNum,
        dateFrom || null,
        dateTo || null
      ]
    );

    const rows = results?.[0] || [];

    return rows.map((row) => ({
      periodLabel: row.period_label,
      periodDate: row.period_date,
      newCount: Number(row.new_count || 0),
      scheduledCount: Number(row.scheduled_count || 0),
      completedCount: Number(row.completed_count || 0),
      cancelledCount: Number(row.cancelled_count || 0),
      totalActivities: Number(row.total_activities || 0)
    }));
  }
}

export const reportsService = new ReportsService();
