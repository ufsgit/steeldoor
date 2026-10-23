import { Router } from 'express';
import { statusController } from './status.controller.js';
import { optionalAuth } from '../auth/jwt.util.js';

const router = Router();

// POST /api/status or /api/client-status
router.post('/', optionalAuth, (req, res, next) => statusController.save(req, res, next));
router.post('/save', optionalAuth, (req, res, next) => statusController.save(req, res, next));

// GET /api/status/:clientId or /api/client-status/:clientId
router.get('/:clientId', optionalAuth, (req, res, next) => statusController.getHistory(req, res, next));

export default router;
