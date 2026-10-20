import { clientsService } from './clients.service.js';

export class ClientsController {
  async getAll(req, res, next) {
    try {
      const data = await clientsService.getAll();
      return res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const client = await clientsService.getById(id);
      if (!client) return res.status(404).json({ error: 'Client not found.' });
      return res.json(client);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const { credentials, ...clientData } = req.body;
      const created = await clientsService.create(clientData, credentials);
      return res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await clientsService.update(id, req.body);
      return res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  async setCredentials(req, res, next) {
    try {
      const { id } = req.params;
      const result = await clientsService.setCredentials(id, req.body);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const clientsController = new ClientsController();
