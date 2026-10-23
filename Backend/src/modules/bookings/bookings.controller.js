import { bookingsService } from './bookings.service.js';
import fs from 'fs';
import path from 'path';

/**
 * Helper to ensure any uploaded files or base64 data URLs in documents
 * are physically written to the Backend/uploads directory.
 */
function processIncomingDocuments(rawDocs, reqFiles = []) {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const processed = [];

  // 1. Add any files uploaded via multipart/form-data
  if (Array.isArray(reqFiles) && reqFiles.length > 0) {
    for (const f of reqFiles) {
      if (f.filename) {
        processed.push(`/uploads/${f.filename}`);
      }
    }
  }

  // 2. Process documents array / strings
  if (rawDocs) {
    const list = Array.isArray(rawDocs) ? rawDocs : [rawDocs];
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      if (typeof item !== 'string' || !item.trim()) continue;

      // Check if it is a base64 Data URL (e.g. data:image/png;base64,...)
      if (item.startsWith('data:image/')) {
        try {
          const matches = item.match(/^data:image\/([a-zA-Z0-9.+]+);base64,(.+)$/);
          if (matches) {
            let ext = matches[1].toLowerCase();
            if (ext === 'jpeg') ext = 'jpg';
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
      const page = req.query.page;
      const limit = req.query.limit;

      const user = req.user || {};
      const roleId = req.query.roleId ?? req.query.role_id ?? user.roleId ?? user.dbRoleId ?? null;
      const loginId = req.query.loginId ?? req.query.login_id ?? user.id ?? null;
      const districtId = req.query.districtId ?? req.query.district_id ?? user.districtId ?? null;

      const result = await bookingsService.getBookings({
        page,
        limit,
        roleId,
        loginId,
        districtId
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


