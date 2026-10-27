import { Router } from 'express';
import { upload } from './uploads.middleware.js';
import { uploadsController } from './uploads.controller.js';

const router = Router();

// Flexible middleware to accept single or multiple files under ANY field name
// (e.g. 'file', 'files', 'document', 'documents', 'images', 'image', etc.)
const handleUploads = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) return next(err);
    req.files = req.files || [];
    req.file = req.files[0] || null;
    next();
  });
};

// POST /api/uploads/single (or /api/uploads)
router.post('/single', handleUploads, (req, res, next) => uploadsController.uploadSingle(req, res, next));
router.post('/', handleUploads, (req, res, next) => uploadsController.uploadSingle(req, res, next));

// POST /api/uploads/multiple
router.post('/multiple', handleUploads, (req, res, next) => uploadsController.uploadMultiple(req, res, next));

export default router;
