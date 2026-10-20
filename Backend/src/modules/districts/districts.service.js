import { query, callProcedure } from '../../../db.js';

export class DistrictsService {
  async getAllDistricts() {
    try {
      let districts = [];

      // 1. Try get_districts_by_state Stored Procedure
      try {
        let spRows = await callProcedure('get_districts_by_state', [1]);
        if (!spRows || spRows.length === 0) {
          spRows = await callProcedure('sp_get_districts_by_state', [1]);
        }
        if (spRows && spRows.length > 0) {
          districts = spRows.map(r => ({
            id: r.districtCode || `dist-${r.districtId}`,
            dbId: r.districtId,
            name: r.districtName,
            state: r.stateName || 'Kerala',
            stateId: r.stateId || 1
          }));
        }
      } catch (spErr) {
        // Fall through to query if SP not deployed
      }

      // 2. Direct query fallback
      if (districts.length === 0) {
        const rows = await query(`
          SELECT d.id AS dbId, d.code, d.name, s.name AS stateName, d.state_id AS stateId
          FROM districts d
          LEFT JOIN states s ON d.state_id = s.id
          ORDER BY d.name ASC
        `);
        if (rows && rows.length > 0) {
          districts = rows.map(r => ({
            id: r.code,
            dbId: r.dbId,
            name: r.name,
            state: r.stateName || 'Kerala',
            stateId: r.stateId
          }));
        }
      }

      if (districts.length > 0) {
        // Populate areas for each district
        for (const dist of districts) {
          const areas = await query(
            `SELECT name FROM areas WHERE district_id = ? ORDER BY name ASC`,
            [dist.dbId]
          );
          dist.areas = areas.map(a => a.name);
        }
        return districts;
      }
    } catch (err) {
      console.warn('[DistrictsService] DB query failed, using initial district list.');
    }

    // Default regional hubs
    return [
      { id: 'dist-ekm', name: 'Ernakulam Hub', state: 'Kerala', areas: ['Edapally', 'Kakkanad', 'Aluva', 'Palarivattom', 'Fort Kochi', 'Vyttila', 'Kaloor', 'Tripunithura'] },
      { id: 'dist-tvm', name: 'Trivandrum Hub', state: 'Kerala', areas: ['Kowdiar', 'Technopark', 'Kazhakkoottam', 'Pattom', 'Vellayambalam', 'Thampanoor'] },
      { id: 'dist-clt', name: 'Kozhikode Hub', state: 'Kerala', areas: ['Mavoor Road', 'Palayam', 'Mananchira', 'Chevayur', 'Medical College'] },
      { id: 'dist-tsr', name: 'Thrissur Hub', state: 'Kerala', areas: ['Round North', 'Punkunnam', 'Ayyanthole', 'Ollur', 'Chalakudy'] },
      { id: 'dist-knr', name: 'Kannur Hub', state: 'Kerala', areas: ['Thana', 'Payyambalam', 'South Bazar', 'Talap', 'Payyanur'] }
    ];
  }

  async addArea(districtId, area) {
    try {
      const districts = await this.getAllDistricts();
      const target = districts.find(d => d.id === districtId || d.dbId === Number(districtId));
      const dbId = target?.dbId || 1;
      await query(`INSERT INTO areas (district_id, name) VALUES (?, ?)`, [dbId, area]);
    } catch (err) {
      console.warn('[DistrictsService] Could not persist area to DB:', err.message);
    }
    const all = await this.getAllDistricts();
    return all.find(d => d.id === districtId);
  }

  async updateArea(districtId, oldName, newName) {
    try {
      const districts = await this.getAllDistricts();
      const target = districts.find(d => d.id === districtId || d.dbId === Number(districtId));
      const dbId = target?.dbId || 1;
      await query(`UPDATE areas SET name = ? WHERE district_id = ? AND name = ?`, [newName, dbId, oldName]);
    } catch (err) {
      console.warn('[DistrictsService] Could not update area in DB:', err.message);
    }
    const all = await this.getAllDistricts();
    return all.find(d => d.id === districtId);
  }

  async deleteArea(districtId, areaName) {
    try {
      const districts = await this.getAllDistricts();
      const target = districts.find(d => d.id === districtId || d.dbId === Number(districtId));
      const dbId = target?.dbId || 1;
      await query(`DELETE FROM areas WHERE district_id = ? AND name = ?`, [dbId, areaName]);
    } catch (err) {
      console.warn('[DistrictsService] Could not delete area in DB:', err.message);
    }
    const all = await this.getAllDistricts();
    return all.find(d => d.id === districtId);
  }
}

export const districtsService = new DistrictsService();
