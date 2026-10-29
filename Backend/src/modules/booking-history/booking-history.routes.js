import { Router } from 'express';
import { bookingHistoryController } from './booking-history.controller.js';
import { optionalAuth } from '../auth/jwt.util.js';

const router = Router();

// GET /api/booking-history
router.get('/', optionalAuth, (req, res, next) => bookingHistoryController.getBookingHistory(req, res, next));

export default router;

