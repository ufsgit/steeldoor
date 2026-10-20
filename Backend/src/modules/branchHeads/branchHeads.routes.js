import { Router } from 'express';
import { branchHeadsController } from './branchHeads.controller.js';

const router = Router();

router.get('/', (req, res, next) => branchHeadsController.getAll(req, res, next));
router.get('/:id', (req, res, next) => branchHeadsController.getById(req, res, next));
router.post('/', (req, res, next) => branchHeadsController.create(req, res, next));
router.put('/:id', (req, res, next) => branchHeadsController.update(req, res, next));
router.patch('/:id/toggle', (req, res, next) => branchHeadsController.toggle(req, res, next));

export default router;
