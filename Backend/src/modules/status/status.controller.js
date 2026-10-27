import { statusService } from './status.service.js';

export class StatusController {
  /**
   * POST /api/status or POST /api/client-status
   * Also handles PATCH /api/bookings/:id/status
   */
  async save(req, res, next) {
    try {
      const user = req.user || {};
      const payload = {
        ...req.body,
        clientId: req.params.id || req.body.clientId || req.body.client_id,
        createdBy: user.id ?? req.body.createdBy ?? req.body.created_by ?? null,
        createdByName: user.name ?? req.body.createdByName ?? req.body.created_by_name ?? null
      };

      if (!payload.clientId) {
        return res.status(400).json({ error: 'clientId is required.' });
      }
      if (!payload.status) {
        return res.status(400).json({ error: 'status is required.' });
      }

      const saved = await statusService.saveStatus(payload);
      return res.status(200).json({
        success: true,
        message: `Status updated to ${saved.status} successfully`,
        data: saved
      });
    } catch (err) {
      if (err.sqlMessage || err.message) {
        return res.status(400).json({ error: err.sqlMessage || err.message });
      }
      next(err);
    }
  }

  /**
   * GET /api/status
   */
  async getStatusOptions(req, res, next) {
    try {
      const options = await statusService.getStatusOptions();
      return res.json({
        success: true,
        count: options.length,
        data: options
      });
    } catch (err) {
      if (err.sqlMessage || err.message) {
        return res.status(400).json({ error: err.sqlMessage || err.message });
      }
      next(err);
    }
  }
}

export const statusController = new StatusController();
