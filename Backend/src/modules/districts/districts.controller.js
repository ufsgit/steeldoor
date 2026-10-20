import { districtsService } from './districts.service.js';

export class DistrictsController {
  async getAll(req, res, next) {
    try {
      const data = await districtsService.getAllDistricts();
      return res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async addArea(req, res, next) {
    try {
      const { id } = req.params;
      const { area } = req.body;
      if (!area) return res.status(400).json({ error: 'Area name is required.' });
      const updated = await districtsService.addArea(id, area);
      return res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  async updateArea(req, res, next) {
    try {
      const { id } = req.params;
      const { oldName, newName } = req.body;
      if (!oldName || !newName) return res.status(400).json({ error: 'oldName and newName are required.' });
      const updated = await districtsService.updateArea(id, oldName, newName);
      return res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  async deleteArea(req, res, next) {
    try {
      const { id, areaName } = req.params;
      const updated = await districtsService.deleteArea(id, decodeURIComponent(areaName));
      return res.json(updated);
    } catch (err) {
      next(err);
    }
  }
}

export const districtsController = new DistrictsController();
