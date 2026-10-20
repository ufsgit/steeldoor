import { query, callProcedure } from '../../../db.js';

export class BookingsService {
  /**
   * Fetch all bookings with optional filtering. Supports MySQL stored procedure or fallback.
   */
  async getBookings(filters = {}) {
    const { status, districtId, branchHeadId, clientId, clientType, search } = filters;

    try {
      // First attempt: call stored procedure if created in DB & SP
      // const spResult = await callProcedure('sp_get_bookings', [status || null, districtId || null, branchHeadId || null, clientId || null, search || null]);
      // if (spResult && spResult.length > 0) return spResult;

      // Fallback SQL query with parameters
      let sql = `
        SELECT b.id, b.client_id AS clientId, b.client_name AS clientName, b.client_type AS clientType,
               b.contact_phone AS contactPhone, b.contact_email AS contactEmail, b.district_id AS districtId,
               d.name AS districtName, b.area, b.address, b.landmark, b.pincode, b.door_details AS doorDetails,
               b.status, b.branch_head_id AS branchHeadId, bh.name AS branchHeadName,
               b.scheduled_fitting_date AS scheduledFittingDate, b.fitting_notes AS fittingNotes,
               b.cancellation_reason AS cancellationReason, b.created_at AS createdAt, b.updated_at AS updatedAt
        FROM bookings b
        LEFT JOIN districts d ON b.district_id = d.id
        LEFT JOIN branch_heads bh ON b.branch_head_id = bh.id
        WHERE 1=1
      `;
      const params = [];

      if (status) {
        sql += ` AND b.status = ?`;
        params.push(status);
      }
      if (districtId) {
        sql += ` AND b.district_id = ?`;
        params.push(districtId);
      }
      if (branchHeadId) {
        sql += ` AND b.branch_head_id = ?`;
        params.push(branchHeadId);
      }
      if (clientId) {
        sql += ` AND b.client_id = ?`;
        params.push(clientId);
      }
      if (clientType) {
        sql += ` AND b.client_type = ?`;
        params.push(clientType);
      }
      if (search) {
        sql += ` AND (b.id LIKE ? OR b.client_name LIKE ? OR d.name LIKE ?)`;
        const s = `%${search}%`;
        params.push(s, s, s);
      }

      sql += ` ORDER BY b.created_at DESC`;

      const rows = await query(sql, params);
      if (rows && rows.length > 0) return rows;
    } catch (err) {
      console.warn('[BookingsService] DB query failed, using mock bookings store.');
    }

    // Default mock dataset for development
    return this.getMockBookings(filters);
  }

  async getBookingById(id) {
    try {
      const rows = await query(
        `SELECT b.*, d.name AS districtName, bh.name AS branchHeadName 
         FROM bookings b
         LEFT JOIN districts d ON b.district_id = d.id
         LEFT JOIN branch_heads bh ON b.branch_head_id = bh.id
         WHERE b.id = ?`,
        [id]
      );
      if (rows && rows.length > 0) return rows[0];
    } catch (err) {
      console.warn('[BookingsService] DB single fetch failed.');
    }
    const all = this.getMockBookings();
    return all.find(b => b.id === id) || null;
  }

  async createBooking(payload) {
    const id = `BK-${new Date().getFullYear()}-${1000 + Math.floor(Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const booking = {
      id,
      clientId: payload.clientId || 'cli-direct',
      clientName: payload.clientName,
      clientType: payload.clientType || 'customer',
      contactPhone: payload.contactPhone,
      contactEmail: payload.contactEmail || '',
      districtId: payload.districtId,
      districtName: payload.districtName || 'Ernakulam Hub',
      area: payload.area,
      address: payload.address,
      landmark: payload.landmark || '',
      pincode: payload.pincode,
      doorDetails: payload.doorDetails || { doorType: 'Steel Security Single Door', thickness: '1.2mm High-Tensile Steel', dimensions: '2100mm x 900mm', frameFinish: 'Matte Charcoal Grey', quantity: 1 },
      status: 'Pending',
      branchHeadId: payload.branchHeadId || 'bh-1',
      branchHeadName: payload.branchHeadName || 'Rajesh Menon',
      createdAt: now,
      updatedAt: now
    };

    try {
      await query(
        `INSERT INTO bookings (id, client_id, client_name, client_type, contact_phone, contact_email, district_id, area, address, landmark, pincode, door_details, status, branch_head_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?)`,
        [booking.id, booking.clientId, booking.clientName, booking.clientType, booking.contactPhone, booking.contactEmail, booking.districtId, booking.area, booking.address, booking.landmark, booking.pincode, JSON.stringify(booking.doorDetails), booking.branchHeadId, now, now]
      );
    } catch (err) {
      console.warn('[BookingsService] DB booking insert skipped:', err.message);
    }

    return booking;
  }

  async updateStatus(id, payload) {
    const now = new Date().toISOString();
    try {
      await query(
        `UPDATE bookings 
         SET status = ?, scheduled_fitting_date = ?, fitting_notes = ?, cancellation_reason = ?, updated_at = ?
         WHERE id = ?`,
        [payload.status, payload.scheduledFittingDate || null, payload.fittingNotes || null, payload.cancellationReason || null, now, id]
      );
    } catch (err) {
      console.warn('[BookingsService] DB status update skipped:', err.message);
    }
    const current = await this.getBookingById(id);
    return current ? { ...current, status: payload.status, scheduledFittingDate: payload.scheduledFittingDate } : { id, ...payload };
  }

  async reassignBooking(id, payload) {
    const now = new Date().toISOString();
    try {
      await query(
        `UPDATE bookings SET branch_head_id = ?, updated_at = ? WHERE id = ?`,
        [payload.newBranchHeadId, now, id]
      );
    } catch (err) {
      console.warn('[BookingsService] DB reassign skipped:', err.message);
    }
    const current = await this.getBookingById(id);
    return current ? { ...current, branchHeadId: payload.newBranchHeadId, branchHeadName: payload.newBranchHeadName } : { id, ...payload };
  }

  getMockBookings(filter = {}) {
    let list = [
      { id: 'BK-2026-1041', clientId: 'cli-1', clientName: 'Riju Sabu', clientType: 'customer', contactPhone: '1234679142', districtId: 'dist-ekm', districtName: 'Ernakulam Hub', area: 'Edapally', address: 'Plot 4, Marine Drive', pincode: '682024', status: 'Pending', branchHeadId: 'bh-1', branchHeadName: 'Rajesh Menon', createdAt: '2026-10-20T08:00:00Z' },
      { id: 'BK-2026-1040', clientId: 'cli-1', clientName: 'Kavitha Ramesh', clientType: 'customer', contactPhone: '9847123456', districtId: 'dist-ekm', districtName: 'Ernakulam Hub', area: 'Edapally', address: 'Flat 3B, Silver Oaks', pincode: '682024', status: 'Pending', branchHeadId: 'bh-1', branchHeadName: 'Rajesh Menon', createdAt: '2026-10-20T07:30:00Z' },
      { id: 'BK-2026-1039', clientId: 'cli-2', clientName: 'Metro Infra Ltd', clientType: 'company', contactPhone: '9847188990', districtId: 'dist-ekm', districtName: 'Ernakulam Hub', area: 'Kakkanad', address: 'Infopark Expressway', pincode: '682030', status: 'Accepted', branchHeadId: 'bh-1', branchHeadName: 'Rajesh Menon', createdAt: '2026-10-19T14:20:00Z' },
      { id: 'BK-2026-1038', clientId: 'cli-3', clientName: 'Apex Doors Kochi', clientType: 'dealer', contactPhone: '9895233441', districtId: 'dist-tvm', districtName: 'Trivandrum Hub', area: 'Kowdiar', address: 'TC 14/890 Kowdiar Main Rd', pincode: '695003', status: 'Scheduled', branchHeadId: 'bh-2', branchHeadName: 'Suresh Kumar', scheduledFittingDate: '2026-10-25', createdAt: '2026-10-18T11:15:00Z' }
    ];

    if (filter.status) list = list.filter(b => b.status === filter.status);
    if (filter.districtId) list = list.filter(b => b.districtId === filter.districtId);
    if (filter.branchHeadId) list = list.filter(b => b.branchHeadId === filter.branchHeadId);
    if (filter.clientId) list = list.filter(b => b.clientId === filter.clientId);
    if (filter.search) {
      const s = filter.search.toLowerCase();
      list = list.filter(b => b.id.toLowerCase().includes(s) || b.clientName.toLowerCase().includes(s));
    }
    return list;
  }
}

export const bookingsService = new BookingsService();
