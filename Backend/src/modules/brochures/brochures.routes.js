import { Router } from 'express';
import { brochuresController } from './brochures.controller.js';
import { brochureUpload } from './brochures.middleware.js';
import { optionalAuth } from '../auth/jwt.util.js';

const router = Router();

// Accept either 'file' or 'document'
const handleBrochureUpload = (req, res, next) => {
  brochureUpload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'document', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds maximum allowed limit (10MB).' });
      }
      return res.status(400).json({ error: err.message || 'File upload failed.' });
    }

    if (req.files) {
      if (req.files.file && req.files.file[0]) {
        req.file = req.files.file[0];
      } else if (req.files.document && req.files.document[0]) {
        req.file = req.files.document[0];
      }
    }
    next();
  });
};

// GET /api/brochures - List all brochures
router.get('/', optionalAuth, (req, res, next) => brochuresController.getAll(req, res, next));

// POST /api/brochures - Upload new brochure
router.post('/', optionalAuth, handleBrochureUpload, (req, res, next) => brochuresController.upload(req, res, next));

// DELETE /api/brochures/:id - Soft-delete brochure
router.delete('/:id', optionalAuth, (req, res, next) => brochuresController.delete(req, res, next));

// GET /api/brochures/:id/download - Direct download
router.get('/:id/download', (req, res, next) => brochuresController.download(req, res, next));

export default router;

