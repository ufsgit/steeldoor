import { Router } from 'express';
import { dropdownsController } from './dropdowns.controller.js';
import { optionalAuth } from '../auth/jwt.util.js';

const router = Router();

// Apply optionalAuth to extract JWT user if present
router.use(optionalAuth);

// GET /api/dropdowns?type=district|area&parentId=1&search=xyz
router.get('/', (req, res, next) => dropdownsController.getDropdown(req, res, next));

// GET /api/dropdowns/districts?stateId=1&search=xyz
router.get('/districts', (req, res, next) => dropdownsController.getDistricts(req, res, next));

// GET /api/dropdowns/areas?districtId=1&search=xyz
router.get('/areas', (req, res, next) => dropdownsController.getAreas(req, res, next));

export default router;
