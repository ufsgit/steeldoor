import { Router } from 'express';
import { contentController } from './content.controller.js';

const router = Router();

router.get('/services', (req, res, next) => contentController.getServices(req, res, next));
router.get('/testimonials', (req, res, next) => contentController.getTestimonials(req, res, next));
router.get('/site-content', (req, res, next) => contentController.getSiteContent(req, res, next));

export default router;
