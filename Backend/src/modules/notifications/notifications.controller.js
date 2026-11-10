import { notificationsService } from './notifications.service.js';

export class NotificationsController {
  /**
   * POST /api/notifications/device-token
   * Register or update user device FCM token
   */
  async registerDevice(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required to register device token.' });
      }

      const fcmToken = req.body.fcmToken || req.body.fcm_token || req.body.token;
      const deviceType = req.body.deviceType || req.body.device_type || 'android';
      const deviceId = req.body.deviceId || req.body.device_id || null;

      if (!fcmToken) {
        return res.status(400).json({ error: 'fcmToken is required.' });
      }

      const result = await notificationsService.registerOrUpdateDevice({
        userId,
        fcmToken,
        deviceType,
        deviceId
      });

      return res.status(result.status || 200).json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/notifications/unregister or DELETE /api/notifications/device-token
   * Deactivate FCM token when logging out
   */
  async unregisterDevice(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required.' });
      }

      const fcmToken = req.body.fcmToken || req.body.fcm_token || req.body.token;
      if (!fcmToken) {
        return res.status(400).json({ error: 'fcmToken is required to unregister device.' });
      }

      const result = await notificationsService.deactivateDeviceToken({ userId, fcmToken });
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/notifications/test
   * Send a test notification to currently logged in user
   */
  async sendTestNotification(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required.' });
      }

      const title = req.body.title || 'SteelGuard Test Notification';
      const body = req.body.body || 'This is a test notification from the SteelGuard server.';
      const data = req.body.data || { type: 'TEST_NOTIFICATION', timestamp: new Date().toISOString() };

      const result = await notificationsService.sendToUser(userId, { title, body, data });
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const notificationsController = new NotificationsController();

