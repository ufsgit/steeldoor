import path from 'path';
import fs from 'fs';
import { brochuresService } from './brochures.service.js';
import { toPublicFileUrl } from '../../utils/fileUrl.util.js';

export class BrochuresController {
  /**
   * GET /api/brochures
   * List all active brochure documents with optional search & pagination
   */
  async getAll(req, res, next) {
    try {
      const search = req.query.search || '';
      const page = req.query.page || 1;
      const limit = req.query.limit || 9;

      const { rows, pagination } = await brochuresService.getAll({ search, page, limit });

      // Return complete public file URLs directly from backend
      const formatted = rows.map(item => ({
        ...item,
        file_url: toPublicFileUrl(`/uploads/brochures/${item.file_name}`, req)
      }));

      return res.json({
        success: true,
        count: formatted.length,
        pagination,
        data: formatted
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/brochures
   * Upload a new brochure document with title and description
   */
  async upload(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No document file uploaded. Please select a PDF or document.' });
      }

      const file = req.file;
      const title = (req.body.title || '').trim() || path.parse(file.originalname).name;
      const description = (req.body.description || '').trim();
      const uploadedBy = req.user?.id || null;

      const relativePath = `uploads/brochures/${file.filename}`;

      const created = await brochuresService.create({
        title,
        description,
        fileName: file.filename,
        originalName: file.originalname,
        filePath: relativePath,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedBy
      });

      return res.status(201).json({
        success: true,
        message: 'Brochure document uploaded successfully',
        data: {
          ...created,
          file_url: toPublicFileUrl(`/uploads/brochures/${file.filename}`, req)
        }
      });
    } catch (err) {
      // Remove uploaded file if database insert failed (e.g. duplicate name)
      if (req.file?.path && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkErr) {
          console.warn('[Brochures] Failed to remove orphan upload on error:', unlinkErr.message);
        }
      }
      return res.status(err.statusCode || 400).json({
        error: err.message || 'Failed to upload brochure document.'
      });
    }
  }

  /**
   * DELETE /api/brochures/:id
   * Soft-delete a brochure
   */
  async delete(req, res, next) {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({ error: 'Brochure ID is required' });
      }

      await brochuresService.delete(id);

      return res.json({
        success: true,
        message: 'Brochure deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/brochures/:id/download
   * Direct download stream
   */
  async download(req, res, next) {
    try {
      const id = req.params.id;
      const brochure = await brochuresService.getById(id);

      if (!brochure) {
        return res.status(404).json({ error: 'Brochure not found' });
      }

      // Check both Backend/uploads/brochures and root uploads/brochures
      const candidates = [
        path.join(process.cwd(), 'Backend', 'uploads', 'brochures', brochure.file_name),
        path.join(process.cwd(), 'uploads', 'brochures', brochure.file_name),
        path.join(process.cwd(), brochure.file_path)
      ];

      let targetPath = candidates.find(p => fs.existsSync(p));

      if (!targetPath) {
        return res.status(404).json({ error: 'Brochure file not found on disk' });
      }

      return res.download(targetPath, brochure.original_name);
    } catch (err) {
      next(err);
    }
  }
}

export const brochuresController = new BrochuresController();

