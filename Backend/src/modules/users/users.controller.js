import { usersService } from './users.service.js';

export class UsersController {
  async getAll(req, res, next) {
    try {
      const users = await usersService.getAllUsers();
      res.json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (err) {
      if (err.sqlMessage || err.message) {
        return res.status(400).json({ error: err.sqlMessage || err.message });
      }
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const user = await usersService.createUser(req.body);
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user
      });
    } catch (err) {
      if (err.sqlMessage || err.message) {
        return res.status(400).json({ error: err.sqlMessage || err.message });
      }
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const user = await usersService.updateUser(id, req.body);
      res.json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (err) {
      if (err.sqlMessage || err.message) {
        return res.status(400).json({ error: err.sqlMessage || err.message });
      }
      next(err);
    }
  }

  async toggleStatus(req, res, next) {
    try {
      const { id } = req.params;
      const user = await usersService.toggleStatus(id);
      res.json({
        success: true,
        message: `User status changed to ${user.isActive ? 'Active' : 'Inactive'}`,
        data: user
      });
    } catch (err) {
      if (err.sqlMessage || err.message) {
        return res.status(400).json({ error: err.sqlMessage || err.message });
      }
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const result = await usersService.deleteUser(id);
      res.json({
        success: true,
        message: 'User deleted successfully',
        data: result
      });
    } catch (err) {
      if (err.sqlMessage || err.message) {
        return res.status(400).json({ error: err.sqlMessage || err.message });
      }
      next(err);
    }
  }
}

export const usersController = new UsersController();
