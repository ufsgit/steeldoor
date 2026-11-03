import { reportsService } from './reports.service.js';

export class ReportsController {
  async getBookingReports(req, res, next) {
    try {
      const user = req.user || {};

      // Determine roleId from authenticated token or query override (for company/coordinator)
      const roleId = Number(
        user.roleId ??
          user.dbRoleId ??
          user.role_id ??
          (user.role === 'admin' || user.role === 'company'
            ? 1
            : user.role === 'coordinator'
            ? 2
            : user.role === 'branch_head'
            ? 3
            : null)
      );

      const loginId = Number(user.id ?? user.userId ?? user.login_id ?? null) || null;

      // For Role 3 (Branch Head), district comes from JWT token; Company/Coordinator can pass it in query
      const assignedHeadDistrictId =
        roleId === 3
          ? user.districtId ?? user.district_id ?? user.assigned_head_district_id ?? null
          : req.query.assignedHeadDistrictId ??
            req.query.assigned_head_district_id ??
            req.query.districtId ??
            req.query.district_id ??
            null;

      const dateFrom = req.query.dateFrom || req.query.date_from || req.query.fromDate || req.query.from_date || null;
      const dateTo = req.query.dateTo || req.query.date_to || req.query.toDate || req.query.to_date || null;

      const data = await reportsService.getBookingReports({
        roleId,
        loginId,
        assignedHeadDistrictId,
        dateFrom,
        dateTo
      });

      return res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }
}

export const reportsController = new ReportsController();
