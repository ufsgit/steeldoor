import { Router } from 'express';
import { bookingsController } from './bookings.controller.js';

const router = Router();

router.get('/', (req, res, next) => bookingsController.getAll(req, res, next));
router.get('/:id', (req, res, next) => bookingsController.getById(req, res, next));
router.post('/', (req, res, next) => bookingsController.create(req, res, next));
router.patch('/:id/status', (req, res, next) => bookingsController.updateStatus(req, res, next));
router.post('/:id/reassign', (req, res, next) => bookingsController.reassign(req, res, next));

export default router;
