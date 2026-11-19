import { pool } from '../../../db.js';

export class ActionTypesService {
  /**
   * Fetch active action types ordered by sort_order using stored procedure get_action_types
   */
  async getActionTypes() {
    const [results] = await pool.query('CALL get_action_types()');
    const rows = results?.[0] || [];
    return rows.map(r => ({
      id: r.id,
      code: r.code,
      name: r.name,
      colorCode: r.colorCode ?? r.color_code ?? '#4f46e5',
      sortOrder: r.sortOrder ?? r.sort_order ?? 0,
      isActive: r.isActive ?? r.is_active ?? 1
    }));
  }
}

export const actionTypesService = new ActionTypesService();
