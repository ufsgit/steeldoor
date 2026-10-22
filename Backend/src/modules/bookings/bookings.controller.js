import { bookingsService } from './bookings.service.js';

export class BookingsController {
  /**
   * GET /api/bookings?page=1&limit=15
   */
  async getAll(req, res, next) {
    try {
      const page = req.query.page;
      const limit = req.query.limit;

      const result = await bookingsService.getBookings({ page, limit });
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/bookings
   */
  async create(req, res, next) {
    try {
      const { name, mobile, address } = req.body;
      if (!name || !mobile || !address) {
        return res.status(400).json({ error: 'name, mobile, and address are required fields.' });
      }

      const user = req.user || {};
      const roleId = Number(user.roleId ?? user.dbRoleId ?? req.body.loginRoleId ?? req.body.login_role_id ?? null);
      const isBranchHead = roleId === 3;

      const bookingData = {
        ...req.body,
        loginRoleId: roleId || null,
        loginId: user.id ?? req.body.loginId ?? req.body.login_id ?? null,
        loginName: user.name ?? req.body.loginName ?? req.body.login_name ?? null,
        // 1. Every authenticated user has state in their token (frontend does not send them)
        stateId: user.stateId ?? req.body.stateId ?? 1,
        stateName: user.stateName ?? req.body.stateName ?? null,

        // 2. Role 3 (Branch Head) has district in token; other roles specify district in booking form
        districtId: isBranchHead ? user.districtId : (req.body.districtId ?? null),
        districtName: isBranchHead ? user.districtName : (req.body.districtName ?? null)
      };

      const newBooking = await bookingsService.createBooking(bookingData);
      return res.status(201).json(newBooking);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/bookings/:id
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updatedBooking = await bookingsService.updateBooking(id, req.body);
      
      if (!updatedBooking) {
        return res.status(404).json({ error: 'Booking not found or has been deleted.' });
      }

      return res.json(updatedBooking);
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/bookings/:id
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const success = await bookingsService.deleteBooking(id);

      if (!success) {
        return res.status(404).json({ error: 'Booking not found or already deleted.' });
      }

      return res.json({
        message: 'Booking deleted successfully.',
        id: parseInt(id, 10)
      });
    } catch (err) {
      next(err);
    }
  }
}

export const bookingsController = new BookingsController();


