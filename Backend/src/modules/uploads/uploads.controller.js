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

      return res.status(201).json({
        success: true,
        message: 'File uploaded successfully.',
        url: relativeUrl,
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/uploads/multiple
   * Upload multiple documents or photos (up to 10 files)
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

      return res.status(201).json({
        success: true,
        message: `${files.length} file(s) uploaded successfully.`,
        count: files.length,
        files: uploadedList,
        urls: uploadedList.map(f => f.url)
      });
    } catch (err) {
      next(err);
    }
  }
}

export const uploadsController = new UploadsController();
