import dotenv from 'dotenv';
import app from './src/app.js';
import { testConnection, pool } from './db.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

async function bootstrap() {
  console.log('='.repeat(50));
  console.log('  SteelGuard Door Management System - Backend API');
  console.log('='.repeat(50));

  // Verify database connection
  await testConnection();

  const server = app.listen(PORT, () => {
    console.log(`[Server] Backend API running at http://localhost:${PORT}`);
    console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('='.repeat(50));
  });

  // Graceful shutdown
  const handleShutdown = async (signal) => {
    console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      try {
        await pool.end();
        console.log('[Database] MySQL pool closed.');
      } catch (err) {
        console.error('[Database] Error closing pool:', err.message);
      }
      process.exit(0);
    });
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
}

bootstrap().catch(err => {
  console.error('[Bootstrap Error]', err);
  process.exit(1);
});
