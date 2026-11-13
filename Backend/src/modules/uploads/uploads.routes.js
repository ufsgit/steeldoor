import { Router } from 'express';
import fs from 'fs';
import { upload, validateUploadedFiles, MAX_FILE_SIZE_ERROR } from './uploads.middleware.js';
import { uploadsController } from './uploads.controller.js';

const router = Router();

// Flexible middleware to accept single or multiple files under ANY field name
// (e.g. 'file', 'files', 'document', 'documents', 'images', 'image', etc.)
const handleUploads = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: MAX_FILE_SIZE_ERROR });
      }
      return res.status(400).json({ error: err.message || 'File upload failed' });
    }
    req.files = req.files || [];
    req.file = req.files[0] || null;

    // Validate each file against its category limit from .env
    const limitError = validateUploadedFiles(req.files);
    if (limitError) {
      req.files.forEach(f => {
        if (f.path) {
          try { fs.unlinkSync(f.path); } catch {}
        }
      });
      return res.status(400).json({ error: limitError });
    }

    next();
  });
};


// POST /api/uploads/multiple
router.post('/multiple', handleUploads, (req, res, next) => uploadsController.uploadMultiple(req, res, next));

export default router;
