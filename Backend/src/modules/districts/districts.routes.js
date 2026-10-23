import express from 'express';
import { pool } from '../../../db.js';

const router = express.Router();

/**
 * GET /api/districts
 * Return list of all districts with their associated areas using sp_get_dropdown_data
 */
router.get('/', async (req, res, next) => {
  try {
    const parentId = req.query.stateId || req.query.parentId || null;
    const search = req.query.search || null;
    const roleId = req.query.roleId || null;
    const loginId = req.query.loginId || null;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 100;

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

    const [areas] = await pool.query(
      'SELECT district_id, name FROM areas WHERE is_deleted = 0 ORDER BY name ASC'
    );

    const areaMap = {};
    for (const a of areas) {
      if (!areaMap[a.district_id]) {
        areaMap[a.district_id] = [];
      }
      areaMap[a.district_id].push(a.name);
    }

    const response = rows.map(r => ({
      id: r.id,
      name: r.name,
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
