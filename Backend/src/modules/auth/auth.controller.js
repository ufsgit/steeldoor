import { authService } from './auth.service.js';

export class AuthController {
  /**
   * Mobile Login for Coordinator (Role 2) and Branch Head (Role 3)
   */
  async mobileLogin(req, res, next) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
      }

      const result = await authService.mobileLogin(username, password);
      if (!result) {
        return res.status(401).json({ error: 'Invalid credentials or user is not authorized for mobile login (role 2 or 3).' });
      }

      // Set cookie with the signed JWT token for session persistence
      res.cookie('auth_session', encodeURIComponent(result.token), {
        httpOnly: false,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax',
        path: '/'
      });

      return res.json({
        user: result.user,
        token: result.token,
        tokenType: 'Bearer'
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Web Login for Company (Role 1) and Dealer (Role 4)
   */
  async webLogin(req, res, next) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ 
          status: 400,
          error: 'Username and password are required.' 
        });
      }

      const result = await authService.webLogin(username, password);
      if (result.status !== 200 || !result.data) {
        return res.status(result.status).json({ 
          status: result.status,
          error: result.message 
        });
      }

      // Set cookie with the signed JWT token for session persistence
      res.cookie('auth_session', encodeURIComponent(result.data.token), {
        httpOnly: false,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax',
        path: '/'
      });

      return res.json({
        status: 200,
        message: result.message,
        user: result.data.user,
        token: result.data.token,
        tokenType: 'Bearer'
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Verify session token and retrieve current user status
   */
  async me(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ 
          status: 401, 
          error: 'Invalid or missing authentication credentials.' 
        });
      }

      const result = await authService.getActiveUserById(userId);
      if (!result) {
        return res.status(401).json({ 
          status: 401, 
          error: 'User account is inactive, deleted, or does not exist.' 
        });
      }

      return res.json({
        status: 200,
        user: result.user,
        token: result.token
      });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
