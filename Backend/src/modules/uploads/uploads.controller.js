import { pool } from '../../../db.js';

export class UploadsController {
  /**
   * POST /api/uploads/single
   * Upload a single document or photo
   */
  async uploadSingle(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded. Use field name "file" or "document".' });
      }

      const file = req.file;
      const relativeUrl = `/uploads/${file.filename}`;

      // Optional: If bookingId is provided, append directly to bookings table in the database
      const bookingId = req.body?.bookingId || req.query?.bookingId || req.body?.id;
      let updatedDocuments = null;
      if (bookingId) {
        const [rows] = await pool.query('SELECT documents FROM bookings WHERE id = ? AND is_deleted = 0 LIMIT 1', [bookingId]);
        if (rows.length > 0) {
          let docs = [];
          if (rows[0].documents) {
            try {
              docs = typeof rows[0].documents === 'string' ? JSON.parse(rows[0].documents) : rows[0].documents;
            } catch {
              docs = [rows[0].documents];
            }
          }
          if (!docs.includes(relativeUrl)) {
            docs.push(relativeUrl);
          }
          await pool.query('UPDATE bookings SET documents = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [JSON.stringify(docs), bookingId]);
          updatedDocuments = docs;
        }
      }

      return res.status(201).json({
        success: true,
        message: 'File uploaded successfully.',
        url: relativeUrl,
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        ...(updatedDocuments ? { documents: updatedDocuments } : {})
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/uploads/multiple
   * Upload multiple documents or photos (up to 10 files)
   * If bookingId is provided, automatically appends to the booking's `documents` in DB in 1 single API call
   */
  async uploadMultiple(req, res, next) {
    try {
      const files = req.files || [];
      if (!files.length) {
        return res.status(400).json({ error: 'No files uploaded. Use field name "files" or "documents".' });
      }

      const uploadedList = files.map(f => ({
        url: `/uploads/${f.filename}`,
        filename: f.filename,
        originalname: f.originalname,
        mimetype: f.mimetype,
        size: f.size
      }));
      const newUrls = uploadedList.map(f => f.url);

      // If bookingId is passed, update the bookings table directly
      const bookingId = req.body?.bookingId || req.query?.bookingId || req.body?.id;
      let updatedDocuments = null;
      if (bookingId) {
        const [rows] = await pool.query('SELECT documents FROM bookings WHERE id = ? AND is_deleted = 0 LIMIT 1', [bookingId]);
        if (rows.length > 0) {
          let docs = [];
          if (rows[0].documents) {
            try {
              docs = typeof rows[0].documents === 'string' ? JSON.parse(rows[0].documents) : rows[0].documents;
            } catch {
              docs = [rows[0].documents];
            }
          }
          for (const u of newUrls) {
            if (!docs.includes(u)) {
              docs.push(u);
            }
          }
          await pool.query('UPDATE bookings SET documents = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [JSON.stringify(docs), bookingId]);
          updatedDocuments = docs;
        }
      }

      return res.status(201).json({
        success: true,
        message: `${files.length} file(s) uploaded successfully.`,
        count: files.length,
        files: uploadedList,
        urls: newUrls,
        ...(updatedDocuments ? { documents: updatedDocuments } : {})
      });
    } catch (err) {
      next(err);
    }
  }
}

export const uploadsController = new UploadsController();
