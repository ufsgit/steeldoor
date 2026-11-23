import { Router } from 'express';
import fs from 'fs';
import { bookingsController } from './bookings.controller.js';
import { statusController } from '../status/status.controller.js';
import { optionalAuth } from '../auth/jwt.util.js';
import { upload, validateUploadedFiles, MAX_FILE_SIZE_ERROR } from '../uploads/uploads.middleware.js';

const router = Router();

// Middleware to accept multipart file uploads under common field names (documents, files, images, file, document)
const handleBookingUploads = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    return next();
  }

  upload.fields([
    { name: 'documents', maxCount: 10 },
    { name: 'files', maxCount: 10 },
    { name: 'images', maxCount: 10 },
    { name: 'file', maxCount: 1 },
    { name: 'document', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: MAX_FILE_SIZE_ERROR });
      }
      return res.status(400).json({ error: err.message || 'File upload failed' });
    }

    const collected = [];
    if (req.files) {
      for (const key of Object.keys(req.files)) {
        if (Array.isArray(req.files[key])) {
          collected.push(...req.files[key]);
        }
      }
    }
    req.files = collected;

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

// GET /api/bookings - List paginated bookings (Default 15 records per page, role-based filtering)
router.get('/', optionalAuth, (req, res, next) => bookingsController.getAll(req, res, next));

// POST /api/bookings - Create new booking with optional file upload
router.post('/', optionalAuth, handleBookingUploads, (req, res, next) => bookingsController.create(req, res, next));

// PUT /api/bookings/:id - Update existing booking with optional file upload
router.put('/:id', optionalAuth, handleBookingUploads, (req, res, next) => bookingsController.update(req, res, next));

// PATCH & POST /api/bookings/:id/status - Update booking/client status
router.patch('/:id/status', optionalAuth, (req, res, next) => statusController.save(req, res, next));
router.post('/:id/status', optionalAuth, (req, res, next) => statusController.save(req, res, next));


// DELETE /api/bookings/:id - Soft-delete booking
router.delete('/:id', optionalAuth, (req, res, next) => bookingsController.delete(req, res, next));

export default router;


