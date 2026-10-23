import { areasService } from './areas.service.js';

export class AreasController {
  async getHierarchy(req, res, next) {
    try {
      const selectedDistrictId = req.query.districtId || null;
      const data = await areasService.getHierarchy(selectedDistrictId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getAreas(req, res, next) {
    try {
      const districtId = req.query.districtId || req.query.district_id;
      if (!districtId) {
        return res.status(400).json({ error: 'Query parameter "districtId" is required.' });
      }
      const search = req.query.search || null;
      const areas = await areasService.getAreasByDistrict(districtId, search);
      res.json({ success: true, data: areas });
    } catch (err) {
      next(err);
    }
  }

  async createArea(req, res, next) {
    try {
      const { districtId, name, pincode } = req.body;
      const created = await areasService.createArea({ districtId, name, pincode });
      res.status(201).json({ success: true, data: created, message: 'Area created successfully.' });
    } catch (err) {
      next(err);
    }
  }

  async updateArea(req, res, next) {
    try {
      const id = req.params.id;
      const { name, pincode, districtId } = req.body;
      const updated = await areasService.updateArea(id, { name, pincode, districtId });
      res.json({ success: true, data: updated, message: 'Area updated successfully.' });
    } catch (err) {
      next(err);
    }
  }

  async deleteArea(req, res, next) {
    try {
      const id = req.params.id;
      const result = await areasService.deleteArea(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const areasController = new AreasController();
