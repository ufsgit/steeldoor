import { Router } from 'express';
import { reportsController } from './reports.controller.js';
import { optionalAuth } from '../auth/jwt.util.js';

const router = Router();

// GET /api/reports/bookings - Summary metrics & status breakdown
router.get('/bookings', optionalAuth, (req, res, next) => reportsController.getBookingReports(req, res, next));

export default router;

