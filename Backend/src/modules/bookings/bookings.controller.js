import { bookingsService } from './bookings.service.js';
import fs from 'fs';
import path from 'path';

/**
 * Helper to ensure any uploaded files or base64 data URLs in documents
 * are physically written to the Backend/uploads directory.
 */
function processIncomingDocuments(rawDocs, reqFiles = []) {
  const uploadsDir = fs.existsSync(path.join(process.cwd(), 'uploads'))
    ? path.join(process.cwd(), 'uploads')
    : (fs.existsSync(path.join(process.cwd(), 'Backend', 'uploads'))
        ? path.join(process.cwd(), 'Backend', 'uploads')
        : path.join(process.cwd(), 'uploads'));

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const processed = [];

  // 1. Add any files uploaded via multipart/form-data
  const filesList = Array.isArray(reqFiles) ? reqFiles : (reqFiles ? Object.values(reqFiles).flat() : []);
  if (filesList.length > 0) {
    for (const f of filesList) {
      if (f && f.filename) {
        processed.push(`/uploads/${f.filename}`);
      }
    }
  }

  // 2. Process documents array / strings
  if (rawDocs) {
    let list = rawDocs;
    if (typeof rawDocs === 'string') {
      try {
        const parsed = JSON.parse(rawDocs);
        list = Array.isArray(parsed) ? parsed : [rawDocs];
      } catch {
        list = [rawDocs];
      }
    } else if (!Array.isArray(rawDocs)) {
      list = [rawDocs];
    }

    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      if (typeof item !== 'string' || !item.trim()) continue;

      // Check if it is a base64 Data URL (images, PDFs, documents)
      if (item.startsWith('data:')) {
        try {
          const matches = item.match(/^data:([a-zA-Z0-9.+/-]+);base64,(.+)$/);
          if (matches) {
            const mime = matches[1].toLowerCase();
            let ext = 'bin';
            if (mime.includes('pdf')) ext = 'pdf';
            else if (mime.includes('png')) ext = 'png';
            else if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
            else if (mime.includes('webp')) ext = 'webp';
            else if (mime.includes('text') || mime.includes('plain')) ext = 'txt';

            const buffer = Buffer.from(matches[2], 'base64');
            const filename = `${Date.now()}-${i}-${Math.round(Math.random() * 1e5)}.${ext}`;
            const filePath = path.join(uploadsDir, filename);
            fs.writeFileSync(filePath, buffer);
            processed.push(`/uploads/${filename}`);
            continue;
          }
        } catch (err) {
          console.warn('[Uploads] Error saving base64 document:', err.message);
        }
      }

      // Normal URL or relative path
      processed.push(item);
    }
  }

  return processed;
}

export class BookingsController {
  /**
   * GET /api/bookings?page=1&limit=15
   * Role-based access rules:
   * - Role 1 (Company) & Role 2 (Coordinator): list all clients
   * - Role 3 (Branch Head): display client details by district_id
   * - Role 4 (Dealer) & Role 5 (Customer): take list by login_id
   */
  async getAll(req, res, next) {
    try {
      const { page, limit, status, search } = req.query;

      const roleId = req.user?.roleId ?? req.user?.dbRoleId ?? (req.query.roleId ? parseInt(req.query.roleId, 10) : null);
      const loginId = req.user?.id ?? (req.query.loginId ? parseInt(req.query.loginId, 10) : null);
      const districtId = req.user?.districtId ?? (req.query.districtId ? parseInt(req.query.districtId, 10) : null);

      // If status filter tab or search keyword is supplied, use coordinator filter SP
      if (status || search) {
        const result = await bookingsService.getCoordinatorBookings({
          status,
          districtId,
          search,
          page,
          limit
        });
        return res.json(result);
      }

      const result = await bookingsService.getBookings({ page, limit, roleId, loginId, districtId });
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/bookings/coordinator?status=ALL|UNREAD|PENDING&districtId=1&search=xyz&page=1&limit=15
   * Dedicated coordinator list with UI tabs (All, Unread, Pending), district filter, and search
   */
  async getCoordinatorBookings(req, res, next) {
    try {
      const { status, districtId, search, page, limit } = req.query;
      const result = await bookingsService.getCoordinatorBookings({
        status,
        districtId,
        search,
        page,
        limit
      });
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/bookings
   */
  async create(req, res, next) {
    try {
      const name = req.body.name || req.body.clientName;
      const mobile = req.body.mobile || req.body.contactPhone;
      const address = req.body.address || req.body.streetAddress;
      if (!name || !mobile || !address) {
        return res.status(400).json({ error: 'name, mobile, and address are required fields.' });
      }

      const user = req.user || {};
      const roleId = Number(user.roleId ?? user.dbRoleId ?? req.body.loginRoleId ?? req.body.login_role_id ?? null);
      const isBranchHead = roleId === 3;

      const rawDocs = req.body.documents ?? req.body.doorDetails?.documents ?? req.body.doorDetails?.images ?? [];
      const savedDocs = processIncomingDocuments(rawDocs, req.files);

      const bookingData = {
        ...req.body,
        name,
        mobile,
        address,
        notes: req.body.notes ?? req.body.doorDetails?.notes ?? null,
        documents: savedDocs,
        loginRoleId: roleId || null,
        loginId: user.id ?? req.body.loginId ?? req.body.login_id ?? null,
        loginName: user.name ?? req.body.loginName ?? req.body.login_name ?? null,
        // 1. Every authenticated user has state in their token (frontend does not send them)
        stateId: user.stateId ?? req.body.stateId ?? 1,
        stateName: user.stateName ?? req.body.stateName ?? null,

        // 2. Role 3 (Branch Head) has district in token; other roles specify district in booking form
        districtId: isBranchHead ? user.districtId : (req.body.districtId ?? null),
        districtName: isBranchHead ? user.districtName : (req.body.districtName ?? null)
      };

      const newBooking = await bookingsService.createBooking(bookingData);
      return res.status(201).json(newBooking);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/bookings/:id
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const rawDocs = req.body.documents ?? req.body.doorDetails?.documents ?? req.body.doorDetails?.images;
      const savedDocs = rawDocs !== undefined ? processIncomingDocuments(rawDocs, req.files) : undefined;

      const updateData = {
        ...req.body,
        name: req.body.name ?? req.body.clientName,
        mobile: req.body.mobile ?? req.body.contactPhone,
        address: req.body.address ?? req.body.streetAddress,
        notes: req.body.notes ?? req.body.doorDetails?.notes,
        documents: savedDocs
      };
      const updatedBooking = await bookingsService.updateBooking(id, updateData);
      
      if (!updatedBooking) {
        return res.status(404).json({ error: 'Booking not found or has been deleted.' });
      }

      return res.json(updatedBooking);
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/bookings/:id
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const success = await bookingsService.deleteBooking(id);

      if (!success) {
        return res.status(404).json({ error: 'Booking not found or already deleted.' });
      }

      return res.json({
        message: 'Booking deleted successfully.',
        id: parseInt(id, 10)
      });
    } catch (err) {
      next(err);
    }
  }
}

export const bookingsController = new BookingsController();


