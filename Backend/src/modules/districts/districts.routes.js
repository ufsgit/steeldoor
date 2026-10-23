import express from 'express';
import { pool } from '../../../db.js';
import { optionalAuth } from '../auth/jwt.util.js';

const router = express.Router();

/**
 * GET /api/districts
 * Return list of all districts with their associated areas accessed through sp_get_dropdown_data
 * Role and login ID are extracted directly from the verified JWT token (no query params needed)
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const user = req.user || {};
    const roleId = user.roleId ?? user.dbRoleId ?? user.role_id ?? (
      user.role === 'admin' || user.role === 'company' ? 1 :
      user.role === 'coordinator' ? 2 :
      user.role === 'branch_head' ? 3 :
      user.role === 'dealer' || user.role === 'client' ? 4 :
      user.role === 'customer' || user.role === 'user' ? 5 : null
    );
    const loginId = user.id ?? user.userId ?? user.login_id ?? null;

    const parentId = req.query.stateId || req.query.parentId || null;
    const search = req.query.search || null;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 100;

    // 1. Fetch districts via sp_get_dropdown_data
    const [results] = await pool.query(
      'CALL sp_get_dropdown_data(?, ?, ?, ?, ?, ?, ?)',
      [
        'district',
        parentId ? Number(parentId) : null,
        search,
        roleId ? Number(roleId) : null,
        loginId ? Number(loginId) : null,
        page,
        limit
      ]
    );

    const rows = results?.[0] || [];

    // 2. Fetch areas for each returned district via sp_get_dropdown_data
    const areaPromises = rows.map(async (dist) => {
      try {
        const [areaResults] = await pool.query(
          'CALL sp_get_dropdown_data(?, ?, ?, ?, ?, ?, ?)',
          [
            'area',
            Number(dist.id),
            null,
            roleId ? Number(roleId) : null,
            loginId ? Number(loginId) : null,
            1,
            1000
          ]
        );
        const areaRows = areaResults?.[0] || [];
        return {
          districtId: dist.id,
          areas: areaRows.map(a => a.name)
        };
      } catch {
        return { districtId: dist.id, areas: [] };
      }
    });

    const districtAreas = await Promise.all(areaPromises);
    const areaMap = {};
    for (const da of districtAreas) {
      areaMap[da.districtId] = da.areas;
    }

    const response = rows.map(r => ({
      id: r.id,
      name: r.name,
      code: r.code || undefined,
      stateId: r.stateId || undefined,
      areas: areaMap[r.id] || []
    }));

    res.json(response);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/districts/:districtId/areas
 * Add a new area to a district
 */
router.post('/:districtId/areas', async (req, res, next) => {
  try {
    const districtId = Number(req.params.districtId);
    const { area } = req.body;

    if (!area || !area.trim()) {
      return res.status(400).json({ error: 'Area name is required.' });
    }

    await pool.query(
      'INSERT INTO areas (district_id, name) VALUES (?, ?)',
      [districtId, area.trim()]
    );

    // Return the updated district
    const [distRows] = await pool.query(
      'SELECT id, state_id AS stateId, name, code FROM districts WHERE id = ?',
      [districtId]
    );
    const [areaRows] = await pool.query(
      'SELECT name FROM areas WHERE district_id = ? ORDER BY name ASC',
      [districtId]
    );

    const dist = distRows[0] || { id: districtId, name: '' };
    res.status(201).json({
      id: dist.id,
      name: dist.name,
      stateId: dist.stateId,
      code: dist.code,
      areas: areaRows.map(a => a.name)
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/districts/:districtId/areas
 * Update an existing area name
 */
router.put('/:districtId/areas', async (req, res, next) => {
  try {
    const districtId = Number(req.params.districtId);
    const { oldName, newName } = req.body;

    if (!oldName || !newName || !newName.trim()) {
      return res.status(400).json({ error: 'Both oldName and newName are required.' });
    }

    await pool.query(
      'UPDATE areas SET name = ? WHERE district_id = ? AND name = ? LIMIT 1',
      [newName.trim(), districtId, oldName.trim()]
    );

    const [distRows] = await pool.query(
      'SELECT id, state_id AS stateId, name, code FROM districts WHERE id = ?',
      [districtId]
    );
    const [areaRows] = await pool.query(
      'SELECT name FROM areas WHERE district_id = ? ORDER BY name ASC',
      [districtId]
    );

    const dist = distRows[0] || { id: districtId, name: '' };
    res.json({
      id: dist.id,
      name: dist.name,
      stateId: dist.stateId,
      code: dist.code,
      areas: areaRows.map(a => a.name)
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/districts/:districtId/areas/:areaName
 * Delete an area from a district
 */
router.delete('/:districtId/areas/:areaName', async (req, res, next) => {
  try {
    const districtId = Number(req.params.districtId);
    const areaName = decodeURIComponent(req.params.areaName);

    await pool.query(
      'DELETE FROM areas WHERE district_id = ? AND name = ? LIMIT 1',
      [districtId, areaName]
    );

    const [distRows] = await pool.query(
      'SELECT id, state_id AS stateId, name, code FROM districts WHERE id = ?',
      [districtId]
    );
    const [areaRows] = await pool.query(
      'SELECT name FROM areas WHERE district_id = ? ORDER BY name ASC',
      [districtId]
    );

    const dist = distRows[0] || { id: districtId, name: '' };
    res.json({
      id: dist.id,
      name: dist.name,
      stateId: dist.stateId,
      code: dist.code,
      areas: areaRows.map(a => a.name)
    });
  } catch (err) {
    next(err);
  }
});

export default router;
