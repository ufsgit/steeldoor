import { mobileDashboardService } from './mobile-dashboard.service.js';

export class MobileDashboardController {
  /**
   * GET /api/mobile-dashboard or GET /api/mobile-dashboard/metrics
   * Supported query params:
   *  - period: 'all' | 'this_month' | 'last_30_days'
   *  - districtId: number
   *  - dateFrom: 'YYYY-MM-DD'
   *  - dateTo: 'YYYY-MM-DD'
   */
  async getMetrics(req, res, next) {
    try {
      const { period, districtId, assignedHeadDistrictId, dateFrom, dateTo } = req.query;
      const user = req.user || {};

      const roleId = user.roleId ?? user.dbRoleId ?? user.role_id ?? (
        user.role === 'admin' || user.role === 'company' ? 1 :
        user.role === 'coordinator' ? 2 :
        user.role === 'branch_head' ? 3 :
        user.role === 'dealer' || user.role === 'client' ? 4 :
        user.role === 'customer' || user.role === 'user' ? 5 : null
      );
      const loginId = user.id ?? user.userId ?? user.login_id ?? null;

      const data = await mobileDashboardService.getMetrics({
        period: period || 'this_month',
        roleId,
        loginId,
        districtId: assignedHeadDistrictId || districtId || user.assignedHeadDistrictId || user.districtId || null,
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

export const mobileDashboardController = new MobileDashboardController();
