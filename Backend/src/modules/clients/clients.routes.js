import { Router } from 'express';
import { clientsController } from './clients.controller.js';

const router = Router();

router.get('/', (req, res, next) => clientsController.getAll(req, res, next));
router.get('/:id', (req, res, next) => clientsController.getById(req, res, next));
router.post('/', (req, res, next) => clientsController.create(req, res, next));
router.put('/:id', (req, res, next) => clientsController.update(req, res, next));
router.post('/:id/credentials', (req, res, next) => clientsController.setCredentials(req, res, next));

export default router;
