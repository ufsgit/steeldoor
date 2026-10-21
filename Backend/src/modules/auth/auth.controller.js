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
}

export const authController = new AuthController();
