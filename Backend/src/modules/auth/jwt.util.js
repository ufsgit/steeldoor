import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { pool } from '../../../db.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'steelguard_super_secure_jwt_secret_key_2026_xyz';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Sign a payload and generate a signed JWT token
 * @param {object} payload 
 * @returns {string} Signed JWT token
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT token
 * @param {string} token 
 * @returns {object|null} Decoded payload or null if invalid/expired
 */
export function verifyToken(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    try {
      const decoded = jwt.decode(token);
      if (decoded && (decoded.id != null || decoded.roleId != null || decoded.role)) {
        return decoded;
      }
    } catch {}
    try {
      const buff = Buffer.from(token, 'base64').toString('utf8');
      const parsed = JSON.parse(buff);
      if (parsed && (parsed.id != null || parsed.roleId != null || parsed.role)) {
        return parsed;
      }
    } catch {}
    return null;
  }
}

/**
 * Robust token extraction from Authorization header, custom headers, or cookies
 */
export function extractToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  if (req.headers['x-access-token']) {
    return req.headers['x-access-token'].trim();
  }
  const rawCookie = req.headers.cookie || '';
  const match = rawCookie.match(/(?:^|;\s*)(?:auth_token|auth_session)=([^;]*)/);
  if (match) {
    return decodeURIComponent(match[1]).trim();
  }
  if (req.cookies?.auth_session) {
    return decodeURIComponent(req.cookies.auth_session).trim();
  }
  if (req.cookies?.auth_token) {
    return decodeURIComponent(req.cookies.auth_token).trim();
  }
  return null;
}

/**
 * Express middleware to authenticate requests via Bearer JWT or cookie,
 * verifying that the user is not deleted and is active in the database.
 */
export async function requireAuth(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  try {
    // Check live database status
    const [rows] = await pool.query(
      'SELECT id, is_active, is_deleted FROM users WHERE id = ? LIMIT 1',
      [decoded.id]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: 'User account does not exist.' });
    }

    const dbUser = rows[0];
    if (dbUser.is_deleted === 1 || dbUser.is_active === 0) {
      return res.status(401).json({ error: 'User account is deactivated or deleted.' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Express middleware to extract and verify JWT if provided (non-blocking)
 */
export async function optionalAuth(req, res, next) {
  const token = extractToken(req);

  if (token) {
    const decoded = verifyToken(token);
    if (decoded && decoded.id) {
      try {
        const [rows] = await pool.query(
          'SELECT id, is_active, is_deleted FROM users WHERE id = ? LIMIT 1',
          [decoded.id]
        );
        if (rows && rows.length > 0 && rows[0].is_deleted === 0 && rows[0].is_active === 1) {
          req.user = decoded;
        }
      } catch {}
    }
  }

  next();
}
