import { Router } from 'express';
import { authController } from './auth.controller.js';

const router = Router();

router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/logout', (req, res, next) => authController.logout(req, res, next));
router.get('/me', (req, res, next) => authController.getCurrentUser(req, res, next));

export default router;
