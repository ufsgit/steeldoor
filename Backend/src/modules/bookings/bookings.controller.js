import { bookingsService } from './bookings.service.js';

export class BookingsController {
  async getAll(req, res, next) {
    try {
      const { status, districtId, branchHeadId, clientId, clientType, search } = req.query;
      const bookings = await bookingsService.getBookings({ status, districtId, branchHeadId, clientId, clientType, search });
      return res.json(bookings);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const booking = await bookingsService.getBookingById(id);
      if (!booking) return res.status(404).json({ error: 'Booking not found.' });
      return res.json(booking);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const created = await bookingsService.createBooking(req.body);
      return res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await bookingsService.updateStatus(id, req.body);
      return res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  async reassign(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await bookingsService.reassignBooking(id, req.body);
      return res.json(updated);
    } catch (err) {
      next(err);
    }
  }
}

export const bookingsController = new BookingsController();
