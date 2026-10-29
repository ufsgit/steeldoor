import { bookingHistoryService } from './booking-history.service.js';

export class BookingHistoryController {
  /**
   * GET /api/booking-history
   * Supported query parameters:
   *  - search: prefix search on booking_name
   *  - actionFilter: 'New Booking Created' | 'Customer Notes Updated' | 'Status Updated' | 'Transfered' | 'Customer Name Updated' | 'Scheduled Date Changed'
   *  - fromDate: 'YYYY-MM-DD'
   *  - toDate: 'YYYY-MM-DD'
   *  - page: number
   *  - limit: number
   */
  async getBookingHistory(req, res, next) {
    try {
      const {
        search,
        actionFilter,
        action_filter,
        fromDate,
        from_date,
        toDate,
        to_date,
        page,
        limit
      } = req.query;

      const user = req.user || {};
      const roleId = user.roleId ?? user.dbRoleId ?? user.role_id ?? (
        user.role === 'admin' || user.role === 'company' ? 1 :
        user.role === 'coordinator' ? 2 :
        user.role === 'branch_head' ? 3 :
        user.role === 'dealer' || user.role === 'client' ? 4 :
        user.role === 'customer' || user.role === 'user' ? 5 : null
      );
      const userId = user.id ?? user.userId ?? user.login_id ?? null;

      const data = await bookingHistoryService.getBookingHistory({
        search: search || null,
        actionFilter: actionFilter || action_filter || null,
        fromDate: fromDate || from_date || null,
        toDate: toDate || to_date || null,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
        userId,
        roleId
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

export const bookingHistoryController = new BookingHistoryController();
