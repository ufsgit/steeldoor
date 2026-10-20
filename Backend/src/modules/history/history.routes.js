import { Router } from 'express';
import { historyController } from './history.controller.js';

const router = Router();

router.get('/', (req, res, next) => historyController.getHistory(req, res, next));

export default router;
