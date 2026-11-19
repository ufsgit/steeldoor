import { Router } from 'express';
import { actionTypesController } from './action-types.controller.js';
import { optionalAuth } from '../auth/jwt.util.js';

const router = Router();

// GET /api/action-types
router.get('/', optionalAuth, (req, res, next) => actionTypesController.getActionTypes(req, res, next));

export default router;
