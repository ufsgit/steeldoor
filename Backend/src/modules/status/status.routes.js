import { Router } from 'express';
import { statusController } from './status.controller.js';
import { optionalAuth } from '../auth/jwt.util.js';

const router = Router();

// POST /api/status or /api/client-status
router.post('/', optionalAuth, (req, res, next) => statusController.save(req, res, next));
router.post('/save', optionalAuth, (req, res, next) => statusController.save(req, res, next));

// GET /api/status
router.get('/', optionalAuth, (req, res, next) => statusController.getStatusOptions(req, res, next));

export default router;
