import { pool } from '../../../db.js';
import { getMessaging, isFirebaseConfigured } from '../../config/firebase.js';

export class NotificationsService {
  /**
   * Register or update an FCM token for a user
   */
  async registerOrUpdateDevice({ userId, fcmToken, deviceType = 'android', deviceId = null }) {
    if (!userId) throw new Error('userId is required');
    if (!fcmToken) throw new Error('fcmToken is required');

    try {
      const [results] = await pool.query(
        'CALL register_or_update_device(?, ?, ?, ?)',
        [userId, fcmToken, deviceType, deviceId]
      );
      const row = results?.[0]?.[0] || {};
      return {
        success: true,
        status: row.status || 200,
        message: row.message || 'Device registered successfully',
        deviceId: row.id || null
      };
    } catch (err) {
      // Fallback in case SP is not created in DB yet
      console.warn('[Notifications] register_or_update_device SP call failed, using fallback query:', err.message);
      
      // Deactivate token if used by other user
      await pool.query(
        'UPDATE user_devices SET is_active = 0 WHERE fcm_token = ? AND user_id != ?',
        [fcmToken, userId]
      ).catch(() => {});

      // Upsert into user_devices
      const [existing] = await pool.query(
        'SELECT id FROM user_devices WHERE user_id = ? AND (fcm_token = ? OR (device_id IS NOT NULL AND device_id = ?)) LIMIT 1',
        [userId, fcmToken, deviceId]
      );

      if (existing.length > 0) {
        await pool.query(
          'UPDATE user_devices SET fcm_token = ?, device_type = ?, device_id = ?, is_active = 1 WHERE id = ?',
          [fcmToken, deviceType, deviceId, existing[0].id]
        );
        return { success: true, status: 200, message: 'Device token updated.', deviceId: existing[0].id };
      } else {
        const [insertResult] = await pool.query(
          'INSERT INTO user_devices (user_id, fcm_token, device_type, device_id, is_active) VALUES (?, ?, ?, ?, 1)',
          [userId, fcmToken, deviceType, deviceId]
        );
        return { success: true, status: 201, message: 'Device registered.', deviceId: insertResult.insertId };
      }
    }
  }

  /**
   * Deactivate a device token upon logout
   */
  async deactivateDeviceToken({ userId, fcmToken }) {
    if (!userId || !fcmToken) return { success: false, message: 'Missing userId or fcmToken' };

    try {
      await pool.query('CALL deactivate_device_token(?, ?)', [userId, fcmToken]);
      return { success: true, message: 'Device token deactivated' };
    } catch (err) {
      // Direct query fallback
      await pool.query(
        'UPDATE user_devices SET is_active = 0 WHERE user_id = ? AND fcm_token = ?',
        [userId, fcmToken]
      ).catch(() => {});
      return { success: true, message: 'Device token deactivated' };
    }
  }

  /**
   * Retrieve active device tokens for a given user
   */
  async getUserActiveTokens(userId) {
    if (!userId) return [];

    try {
      const [results] = await pool.query('CALL get_user_active_tokens(?)', [userId]);
      const rows = results?.[0] || [];
      return rows;
    } catch (err) {
      // Direct query fallback
      const [rows] = await pool.query(
        'SELECT id, user_id AS userId, fcm_token AS fcmToken, device_type AS deviceType, device_id AS deviceId FROM user_devices WHERE user_id = ? AND is_active = 1',
        [userId]
      );
      return rows || [];
    }
  }

  /**
   * Send push notification to a user's active devices
   * @param {number} userId - The target user's ID
   * @param {object} payload - { title, body, data }
   */
  async sendToUser(userId, { title, body, data = {} }) {
    if (!userId) return { success: false, error: 'User ID is required' };

    const devices = await this.getUserActiveTokens(userId);
    if (!devices || devices.length === 0) {
      console.log(`[Notifications] No active devices found for user ${userId}`);
      return { success: false, reason: 'NO_ACTIVE_DEVICES' };
    }

    const tokenList = devices.map(d => d.fcmToken || d.fcm_token).filter(Boolean);
    if (tokenList.length === 0) {
      return { success: false, reason: 'NO_VALID_TOKENS' };
    }

    // Ensure all data values are strings for FCM payload compatibility
    const safeData = {};
    for (const [key, value] of Object.entries(data)) {
      safeData[key] = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');
    }

    // If Firebase Admin is not configured, log simulation
    if (!isFirebaseConfigured()) {
      console.log(`[Notifications] [SIMULATED] Sent to user ${userId} (${tokenList.length} devices):`, {
        title,
        body,
        data: safeData
      });
      return {
        success: true,
        simulated: true,
        deviceCount: tokenList.length,
        message: 'Notification logged (Firebase credentials not yet configured)'
      };
    }

    try {
      const messaging = getMessaging();
      const message = {
        tokens: tokenList,
        notification: {
          title: String(title),
          body: String(body)
        },
        data: safeData
      };

      const response = await messaging.sendEachForMulticast(message);
      console.log(`[Notifications] Sent to user ${userId}: ${response.successCount} succeeded, ${response.failureCount} failed.`);

      // Clean up invalid or stale tokens if any failed
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const error = resp.error;
            const failedToken = tokenList[idx];
            if (
              error?.code === 'messaging/invalid-registration-token' ||
              error?.code === 'messaging/registration-token-not-registered'
            ) {
              console.log(`[Notifications] Deactivating expired/invalid token for user ${userId}`);
              this.deactivateDeviceToken({ userId, fcmToken: failedToken }).catch(() => {});
            }
          }
        });
      }

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount
      };
    } catch (err) {
      console.error(`[Notifications] Error sending notification to user ${userId}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Send push notification to multiple users
   */
  async sendToUsers(userIds = [], { title, body, data = {} }) {
    const results = [];
    for (const uid of userIds) {
      const res = await this.sendToUser(uid, { title, body, data });
      results.push({ userId: uid, ...res });
    }
    return results;
  }
}

export const notificationsService = new NotificationsService();

