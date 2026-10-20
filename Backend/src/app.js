import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import module routes
import authRoutes from './modules/auth/auth.routes.js';
import districtsRoutes from './modules/districts/districts.routes.js';
import branchHeadsRoutes from './modules/branchHeads/branchHeads.routes.js';
import clientsRoutes from './modules/clients/clients.routes.js';
import bookingsRoutes from './modules/bookings/bookings.routes.js';
import historyRoutes from './modules/history/history.routes.js';
import contentRoutes from './modules/content/content.routes.js';

dotenv.config();

const app = express();

// ---------------- Global Middleware ----------------

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:4200').split(',').map(s => s.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in development
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lightweight request logging
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString().slice(11, 19)}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// ---------------- Health Check ----------------

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'steel-door-backend',
    timestamp: new Date().toISOString()
  });
});

// ---------------- Mount Module Routes ----------------

app.use('/api/auth', authRoutes);
app.use('/api/districts', districtsRoutes);
app.use('/api/branch-heads', branchHeadsRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/history', historyRoutes);
app.use('/api', contentRoutes); // /api/services, /api/testimonials, /api/site-content

// ---------------- 404 Handler ----------------

app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// ---------------- Global Error Handler ----------------

app.use((err, req, res, next) => {
  console.error('[Error Handler]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error'
  });
});

export default app;
