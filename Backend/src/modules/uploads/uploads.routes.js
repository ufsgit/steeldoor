import { Router } from 'express';
import { upload } from './uploads.middleware.js';
import { uploadsController } from './uploads.controller.js';

const router = Router();

// Middleware to accept either 'file' or 'document'
const handleSingle = (req, res, next) => {
  upload.fields([{ name: 'file', maxCount: 1 }, { name: 'document', maxCount: 1 }])(req, res, (err) => {
    if (err) return next(err);
    req.file = req.files?.file?.[0] || req.files?.document?.[0] || null;
    next();
  });
};

// Middleware to accept either 'files' or 'documents'
const handleMultiple = (req, res, next) => {
  upload.fields([{ name: 'files', maxCount: 10 }, { name: 'documents', maxCount: 10 }])(req, res, (err) => {
    if (err) return next(err);
    req.files = req.files?.files || req.files?.documents || [];
    next();
  });
};

// POST /api/uploads/single (or /api/uploads)
router.post('/single', handleSingle, (req, res, next) => uploadsController.uploadSingle(req, res, next));
router.post('/', handleSingle, (req, res, next) => uploadsController.uploadSingle(req, res, next));

// POST /api/uploads/multiple
router.post('/multiple', handleMultiple, (req, res, next) => uploadsController.uploadMultiple(req, res, next));

export default router;
