import { usersService } from './users.service.js';

export class UsersController {
  _formatError(err) {
    if (
      err.code === 'ER_DUP_ENTRY' ||
      err.errno === 1062 ||
      String(err.sqlMessage || '').includes('Duplicate entry') ||
      String(err.message || '').includes('Duplicate entry') ||
      String(err.message || '').includes('User already exists')
    ) {
      return 'User already exists';
    }
    return err.sqlMessage || err.message || 'An error occurred';
  }

  async getAll(req, res, next) {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const role = req.query.role;

      const { rows, pagination } = await usersService.getAllUsers({ page, limit, search, role });
      res.json({
        success: true,
        count: rows.length,
        pagination,
        data: rows
      });
    } catch (err) {
      return res.status(400).json({ error: this._formatError(err) });
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
      return res.status(400).json({ error: this._formatError(err) });
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
      return res.status(400).json({ error: this._formatError(err) });
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

  async getAvailableBranchDistricts(req, res, next) {
    try {
      const userId = req.query.userId || null;
      const districts = await usersService.getAvailableBranchDistricts(userId);
      res.json(districts);
    } catch (err) {
      return res.status(400).json({ error: this._formatError(err) });
    }
  }
}

export const usersController = new UsersController();
