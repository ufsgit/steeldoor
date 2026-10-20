import { authService } from './auth.service.js';

export class AuthController {
  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
      }

      const result = await authService.authenticate(username, password);
      if (!result) {
        return res.status(401).json({ error: 'Invalid username or password.' });
      }

      // Set cookie for browser session persistence
      res.cookie('auth_session', encodeURIComponent(result.sessionToken), {
        httpOnly: false,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax',
        path: '/'
      });

      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res) {
    res.clearCookie('auth_session', { path: '/' });
    return res.json({ success: true, message: 'Logged out successfully.' });
  }

  async getCurrentUser(req, res) {
    const authHeader = req.headers.authorization;
    const cookieHeader = req.cookies?.auth_session;

    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (cookieHeader) {
      token = decodeURIComponent(cookieHeader);
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    try {
      const user = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
      return res.json({ user });
    } catch (err) {
      return res.status(401).json({ error: 'Invalid session token.' });
    }
  }
}

export const authController = new AuthController();
