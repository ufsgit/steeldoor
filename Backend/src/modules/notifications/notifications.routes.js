import { Router } from 'express';
import { notificationsController } from './notifications.controller.js';
import { requireAuth } from '../auth/jwt.util.js';

const router = Router();

// Register / update device token (Mobile app calls on login & token refresh)
router.post('/device-token', requireAuth, (req, res, next) => notificationsController.registerDevice(req, res, next));

// Deactivate device token (Mobile app calls on logout)
router.delete('/device-token', requireAuth, (req, res, next) => notificationsController.unregisterDevice(req, res, next));
router.post('/unregister', requireAuth, (req, res, next) => notificationsController.unregisterDevice(req, res, next));

// Developer test trigger
router.post('/test', requireAuth, (req, res, next) => notificationsController.sendTestNotification(req, res, next));

export default router;

