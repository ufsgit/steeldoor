import { actionTypesService } from './action-types.service.js';

export class ActionTypesController {
  /**
   * GET /api/action-types
   * Retrieves active action types using stored procedure get_action_types
   */
  async getActionTypes(req, res, next) {
    try {
      const data = await actionTypesService.getActionTypes();
      return res.status(200).json({
        success: true,
        count: data.length,
        data
      });
    } catch (err) {
      if (err.sqlMessage || err.message) {
        return res.status(400).json({ error: err.sqlMessage || err.message });
      }
      next(err);
    }
  }
}

export const actionTypesController = new ActionTypesController();
