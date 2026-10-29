import { Router } from 'express';
import { bookingHistoryController } from './booking-history.controller.js';
import { optionalAuth } from '../auth/jwt.util.js';

const router = Router();

// GET /api/booking-history - All booking activity logs with filters, date range, pagination
router.get('/', optionalAuth, (req, res, next) => bookingHistoryController.getBookingHistory(req, res, next));

// GET /api/booking-history/:bookingId - Specific booking timeline history
router.get('/:bookingId', optionalAuth, (req, res, next) => bookingHistoryController.getHistoryByBookingId(req, res, next));

export default router;
