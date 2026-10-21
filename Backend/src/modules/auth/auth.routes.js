import { Router } from 'express';
import { authController } from './auth.controller.js';

const router = Router();

router.post('/mobile-login', (req, res, next) => authController.mobileLogin(req, res, next));

export default router;
