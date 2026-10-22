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
  const [rows] = await pool.query(sql, params);
  return rows;
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
  testConnection
};
