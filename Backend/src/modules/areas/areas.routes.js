import { Router } from 'express';
import { areasController } from './areas.controller.js';

const router = Router();

// GET /api/areas/hierarchy?districtId=1 - Get all states, districts and initial areas
router.get('/hierarchy', (req, res, next) => areasController.getHierarchy(req, res, next));

// GET /api/areas?districtId=1&search=xyz - Get all active areas for a district
router.get('/', (req, res, next) => areasController.getAreas(req, res, next));

// POST /api/areas - Create a new area
router.post('/', (req, res, next) => areasController.createArea(req, res, next));

// PUT /api/areas/:id - Update an area
router.put('/:id', (req, res, next) => areasController.updateArea(req, res, next));

// DELETE /api/areas/:id - Soft-delete an area
router.delete('/:id', (req, res, next) => areasController.deleteArea(req, res, next));

export default router;
