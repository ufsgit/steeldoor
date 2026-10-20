import { historyService } from './history.service.js';

export class HistoryController {
  async getHistory(req, res, next) {
    try {
      const { bookingId, role, action } = req.query;
      const history = await historyService.getAuditHistory({ bookingId, role, action });
      return res.json(history);
    } catch (err) {
      next(err);
    }
  }
}

export const historyController = new HistoryController();
