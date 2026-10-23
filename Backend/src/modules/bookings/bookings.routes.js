import { Router } from 'express';
import { bookingsController } from './bookings.controller.js';
import { statusController } from '../status/status.controller.js';
import { optionalAuth } from '../auth/jwt.util.js';

const router = Router();

// GET /api/bookings - List paginated bookings (Default 15 records per page, role-based filtering)
router.get('/', optionalAuth, (req, res, next) => bookingsController.getAll(req, res, next));

// POST /api/bookings - Create new booking (Extracts authenticated user if token present)
router.post('/', optionalAuth, (req, res, next) => bookingsController.create(req, res, next));

// PUT /api/bookings/:id - Update existing booking
router.put('/:id', (req, res, next) => bookingsController.update(req, res, next));

// PATCH & POST /api/bookings/:id/status - Update booking/client status
router.patch('/:id/status', optionalAuth, (req, res, next) => statusController.save(req, res, next));
router.post('/:id/status', optionalAuth, (req, res, next) => statusController.save(req, res, next));

// DELETE /api/bookings/:id - Soft-delete booking
router.delete('/:id', (req, res, next) => bookingsController.delete(req, res, next));

export default router;


