import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * MySQL Connection Pool Configuration
 */
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'steel_door_db',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
};

export const pool = mysql.createPool(poolConfig);

/**
 * Execute standard SQL queries with parameterized inputs
 */
export async function query(sql, params = []) {
  const [rows, fields] = await pool.query(sql, params);
  return rows;
}

/**
 * Execute a MySQL Stored Procedure
 * Example: callProcedure('sp_get_all_bookings', [status, districtId])
 */
export async function callProcedure(procedureName, params = []) {
  const placeholders = params.map(() => '?').join(', ');
  const sql = `CALL ${procedureName}(${placeholders})`;
  const [results] = await pool.query(sql, params);
  // Stored procedure results in mysql2 return array of result sets; first item is the SELECT output
  return results && results.length > 0 ? results[0] : [];
}

/**
 * Test MySQL connection on server startup
 */
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Connected successfully to MySQL (${poolConfig.database}@${poolConfig.host}:${poolConfig.port})`);
    connection.release();
    return true;
  } catch (error) {
    console.warn(`[Database] Warning: Could not connect to MySQL at ${poolConfig.host}:${poolConfig.port}/${poolConfig.database}`);
    console.warn(`[Database] Error code: ${error.code || error.message}`);
    console.warn(`[Database] Please ensure your MySQL server is running and credentials in Backend/.env are correct.`);
    return false;
  }
}

export default {
  pool,
  query,
  callProcedure,
  testConnection
};
