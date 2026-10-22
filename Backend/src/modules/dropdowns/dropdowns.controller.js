import { dropdownsService } from './dropdowns.service.js';

export class DropdownsController {
  /**
   * Helper to resolve role and parentId based on JWT user token
   */
  resolveParams(req, type) {
    const user = req.user || {};
    const roleId = Number(user.roleId ?? user.dbRoleId ?? null);
    const isBranchHead = roleId === 3;

    let parentId = req.query.parentId ?? req.query.parent_id ?? req.query.stateId ?? req.query.districtId ?? null;

    // For Role 3 (Branch Head), district is locked to their assigned district
    if (isBranchHead) {
      parentId = user.districtId ?? parentId;
    }

    const search = req.query.search ?? req.query.q ?? null;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 20);

    return {
      roleId: roleId || null,
      loginId: user.id ?? null,
      parentId: parentId ? Number(parentId) : null,
      search: search ? String(search).trim() : null,
      page,
      limit
    };
  }

  /**
   * GET /api/dropdowns?type=district|area&parentId=1&search=xyz&page=1&limit=20
   */
  async getDropdown(req, res, next) {
    try {
      const type = req.query.type;
      if (!type) {
        return res.status(400).json({
          error: 'Query parameter "type" is required ("district" or "area").'
        });
      }

      const { roleId, loginId, parentId, search, page, limit } = this.resolveParams(req, type);
      const items = await dropdownsService.getDropdownData(type, parentId, search, roleId, loginId, page, limit);

      return res.json({
        type: type.toLowerCase(),
        page,
        limit,
        count: items.length,
        data: items
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/dropdowns/districts?stateId=1&search=xyz&page=1&limit=20
   */
  async getDistricts(req, res, next) {
    try {
      const { roleId, loginId, parentId, search, page, limit } = this.resolveParams(req, 'district');
      const items = await dropdownsService.getDropdownData('district', parentId, search, roleId, loginId, page, limit);

      return res.json({
        type: 'district',
        page,
        limit,
        count: items.length,
        data: items
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/dropdowns/areas?districtId=1&search=xyz&page=1&limit=20
   */
  async getAreas(req, res, next) {
    try {
      const { roleId, loginId, parentId, search, page, limit } = this.resolveParams(req, 'area');
      const items = await dropdownsService.getDropdownData('area', parentId, search, roleId, loginId, page, limit);

      return res.json({
        type: 'area',
        page,
        limit,
        count: items.length,
        data: items
      });
    } catch (err) {
      next(err);
    }
  }
}

export const dropdownsController = new DropdownsController();
