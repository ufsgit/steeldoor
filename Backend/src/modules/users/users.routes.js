import { Router } from 'express';
import { usersController } from './users.controller.js';
import { optionalAuth } from '../auth/jwt.util.js';

const router = Router();

// GET /api/users/available-branch-districts
router.get('/available-branch-districts', optionalAuth, (req, res, next) => usersController.getAvailableBranchDistricts(req, res, next));

// GET /api/users/get_branch_heads_for_status_update
router.get('/get_branch_heads_for_status_update', optionalAuth, (req, res, next) => usersController.getBranchHeadsForStatusUpdate(req, res, next));

// GET /api/users
router.get('/', optionalAuth, (req, res, next) => usersController.getAll(req, res, next));

// POST /api/users
router.post('/', optionalAuth, (req, res, next) => usersController.create(req, res, next));

// PUT /api/users/:id
router.put('/:id', optionalAuth, (req, res, next) => usersController.update(req, res, next));

// PATCH /api/users/:id/status
router.patch('/:id/status', optionalAuth, (req, res, next) => usersController.toggleStatus(req, res, next));

// DELETE /api/users/:id
router.delete('/:id', optionalAuth, (req, res, next) => usersController.delete(req, res, next));

export default router;
