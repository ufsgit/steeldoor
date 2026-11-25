import { pool } from '../../../db.js';
import {
  getPublicFileBaseUrl,
  normalizeRelativeUploadPath,
  toPublicFileUrl
} from '../../utils/fileUrl.util.js';

export class UploadsController {
  /**
   * Appends newly uploaded relative paths to bookings.documents in DB and
   * returns full public URLs for the response.
   */
  async _appendBookingDocuments(req, relativeUrls) {
    const rawBookingId = req.body?.bookingId
      || req.body?.booking_id
      || req.body?.clientId
      || req.body?.client_id
      || req.body?.id
      || req.query?.bookingId
      || req.query?.booking_id
      || req.query?.clientId
      || req.query?.id;

    const bookingId = rawBookingId ? parseInt(rawBookingId, 10) : null;
    if (!bookingId || isNaN(bookingId)) {
      return null;
    }

    const [rows] = await pool.query(
      'SELECT documents FROM bookings WHERE id = ? AND is_deleted = 0 LIMIT 1',
      [bookingId]
    );
    if (rows.length === 0) {
      return null;
    }

    let docs = [];
    if (rows[0].documents) {
      try {
        docs = typeof rows[0].documents === 'string' ? JSON.parse(rows[0].documents) : rows[0].documents;
      } catch {
        docs = [rows[0].documents];
      }
    }
    if (!Array.isArray(docs)) {
      docs = docs ? [docs] : [];
    }

    docs = docs.map(d => normalizeRelativeUploadPath(d)).filter(Boolean);
    for (const rel of relativeUrls) {
      if (!docs.includes(rel)) {
        docs.push(rel);
      }
    }

    await pool.query(
      'UPDATE bookings SET documents = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [JSON.stringify(docs), bookingId]
    );

    return docs.map(d => toPublicFileUrl(d, req));
  }

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
      const publicUrl = toPublicFileUrl(relativeUrl, req);
      const updatedDocuments = await this._appendBookingDocuments(req, [relativeUrl]);

      return res.status(201).json({
        success: true,
        message: 'File uploaded successfully.',
        url: publicUrl,
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

      const relativeUrls = files.map(f => `/uploads/${f.filename}`);
      const uploadedList = files.map(f => ({
        url: toPublicFileUrl(`/uploads/${f.filename}`, req),
        filename: f.filename,
        originalname: f.originalname,
        mimetype: f.mimetype,
        size: f.size
      }));
      const newUrls = uploadedList.map(f => f.url);
      const updatedDocuments = await this._appendBookingDocuments(req, relativeUrls);

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

  /**
   * GET /api/uploads/share-config
   * Returns current active share base URL (and resolved shareUrl if ?path= or ?file= is passed)
   */
  getShareConfig(req, res) {
    const shareBaseUrl = getPublicFileBaseUrl(req);
    const targetPath = req.query?.path || req.query?.file || null;

    return res.json({
      success: true,
      shareBaseUrl,
      ...(targetPath ? { shareUrl: toPublicFileUrl(String(targetPath), req) } : {})
    });
  }
}

export const uploadsController = new UploadsController();
