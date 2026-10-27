import { Router } from 'express';
import { mobileDashboardController } from './mobile-dashboard.controller.js';
import { optionalAuth } from '../auth/jwt.util.js';

const router = Router();

// GET /api/mobile-dashboard - Fitmate mobile dashboard metric cards (All, This Month, Last 30 Days)
router.get('/', optionalAuth, (req, res, next) => mobileDashboardController.getMetrics(req, res, next));

// GET /api/mobile-dashboard/metrics - Alias
router.get('/metrics', optionalAuth, (req, res, next) => mobileDashboardController.getMetrics(req, res, next));

export default router;
