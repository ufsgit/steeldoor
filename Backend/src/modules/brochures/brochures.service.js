import { pool } from '../../../db.js';

export class BrochuresService {
  /**
   * Get all active brochures with optional search filter and pagination
   */
  async getAll({ search = '', page = 1, limit = 9 } = {}) {
    let whereClause = 'WHERE b.is_deleted = 0';
    const params = [];

    if (search && search.trim()) {
      whereClause += ` AND (b.title LIKE ? OR b.description LIKE ? OR b.original_name LIKE ? OR b.file_name LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    // 1. Total count
    const countSql = `SELECT COUNT(*) AS total FROM brochures b ${whereClause}`;
    const [countRows] = await pool.query(countSql, params);
    const total = Number(countRows[0]?.total || 0);

    // 2. Pagination calculation
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 9);
    const offset = (pageNum - 1) * limitNum;

    // 3. Paginated list
    const sql = `
      SELECT 
        b.id,
        b.title,
        b.description,
        b.file_name,
        b.original_name,
        b.file_path,
        b.file_size,
        b.mime_type,
        b.uploaded_by,
        b.created_at,
        b.updated_at,
        u.name AS uploaded_by_name
      FROM brochures b
      LEFT JOIN users u ON b.uploaded_by = u.id
      ${whereClause}
      ORDER BY b.created_at DESC, b.id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(sql, [...params, limitNum, offset]);
    return {
      rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  /**
   * Get brochure by ID
   */
  async getById(id) {
    const [rows] = await pool.query(
      `SELECT * FROM brochures WHERE id = ? AND is_deleted = 0 LIMIT 1`,
      [Number(id)]
    );
    return rows[0] || null;
  }

  /**
   * Create a new brochure entry with unique title validation
   */
  async create({ title, description, fileName, originalName, filePath, fileSize, mimeType, uploadedBy }) {
    const cleanTitle = (title || '').trim();
    if (!cleanTitle) {
      const err = new Error('Brochure name / title is required.');
      err.statusCode = 400;
      throw err;
    }

    // Check if an active brochure with the same name already exists (case-insensitive)
    const [existing] = await pool.query(
      `SELECT id FROM brochures WHERE LOWER(TRIM(title)) = LOWER(?) AND is_deleted = 0 LIMIT 1`,
      [cleanTitle]
    );

    if (existing.length > 0) {
      const err = new Error(`A brochure with the name "${cleanTitle}" already exists. Please choose a unique name.`);
      err.statusCode = 409;
      throw err;
    }

    const sql = `
      INSERT INTO brochures (
        title,
        description,
        file_name,
        original_name,
        file_path,
        file_size,
        mime_type,
        uploaded_by,
        is_active,
        is_deleted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
    `;

    const params = [
      cleanTitle,
      description ? description.trim() : null,
      fileName,
      originalName,
      filePath,
      fileSize || null,
      mimeType || 'application/pdf',
      uploadedBy || null
    ];

    try {
      const [result] = await pool.query(sql, params);
      return this.getById(result.insertId);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        const dupErr = new Error(`A brochure with the name "${cleanTitle}" already exists. Please choose a unique name.`);
        dupErr.statusCode = 409;
        throw dupErr;
      }
      throw err;
    }
  }

  /**
   * Soft delete a brochure
   */
  async delete(id) {
    const numId = Number(id);
    if (!numId) return true;
    await pool.query(
      `UPDATE brochures SET is_deleted = 1, is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [numId]
    );
    return true;
  }
}

export const brochuresService = new BrochuresService();

