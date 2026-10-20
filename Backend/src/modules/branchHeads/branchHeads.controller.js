import { branchHeadsService } from './branchHeads.service.js';

export class BranchHeadsController {
  async getAll(req, res, next) {
    try {
      const data = await branchHeadsService.getAll();
      return res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const item = await branchHeadsService.getById(id);
      if (!item) return res.status(404).json({ error: 'Branch head not found.' });
      return res.json(item);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const created = await branchHeadsService.create(req.body);
      return res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await branchHeadsService.update(id, req.body);
      return res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  async toggle(req, res, next) {
    try {
      const { id } = req.params;
      const { active } = req.body;
      const updated = await branchHeadsService.toggleActive(id, active);
      return res.json(updated);
    } catch (err) {
      next(err);
    }
  }
}

export const branchHeadsController = new BranchHeadsController();
