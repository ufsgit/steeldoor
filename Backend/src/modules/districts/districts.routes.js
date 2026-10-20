import { Router } from 'express';
import { districtsController } from './districts.controller.js';

const router = Router();

router.get('/', (req, res, next) => districtsController.getAll(req, res, next));
router.post('/:id/areas', (req, res, next) => districtsController.addArea(req, res, next));
router.put('/:id/areas', (req, res, next) => districtsController.updateArea(req, res, next));
router.delete('/:id/areas/:areaName', (req, res, next) => districtsController.deleteArea(req, res, next));

export default router;
