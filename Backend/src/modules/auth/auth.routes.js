import { Router } from 'express';
import { authController } from './auth.controller.js';
import { requireAuth } from './jwt.util.js';

const router = Router();

router.post('/mobile-login', (req, res, next) => authController.mobileLogin(req, res, next));
router.post('/web-login', (req, res, next) => authController.webLogin(req, res, next));
router.get('/me', requireAuth, (req, res, next) => authController.me(req, res, next));

export default router;
