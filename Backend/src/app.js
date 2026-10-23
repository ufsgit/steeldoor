import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swagger.js';

// Import module routes
import authRoutes from './modules/auth/auth.routes.js';
import bookingsRoutes from './modules/bookings/bookings.routes.js';
import dropdownsRoutes from './modules/dropdowns/dropdowns.routes.js';
import uploadsRoutes from './modules/uploads/uploads.routes.js';
import statusRoutes from './modules/status/status.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import districtsRoutes from './modules/districts/districts.routes.js';
import areasRoutes from './modules/areas/areas.routes.js';

dotenv.config();

const app = express();

// ---------------- Global Middleware ----------------

const defaultOrigins = [
  'https://steeldoor.ufstech.in',
  'https://steeldoorapi.ufstech.in',
  'http://localhost:4200',
  'http://localhost:1025',
  'http://localhost:5000'
];

const envOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    // Also allow any subdomains of ufstech.in
    if (/^https?:\/\/([a-zA-Z0-9-]+\.)*ufstech\.in(:[0-9]+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive fallback to prevent breaking API calls
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'Accept', 'Origin']
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

// ---------------- Swagger Documentation ----------------

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: 'SteelGuard API Docs',
  customCss: '.swagger-ui .topbar { display: none }'
}));
app.get('/api/docs.json', (req, res) => res.json(swaggerDocument));

// ---------------- Health Check ----------------

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'steel-door-backend',
    timestamp: new Date().toISOString()
  });
});

// Static files serving (for uploaded documents and images)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/uploads', express.static(path.join(process.cwd(), 'Backend', 'uploads')));

// ---------------- Mount Module Routes ----------------

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/dropdowns', dropdownsRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/client-status', statusRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/districts', districtsRoutes);
app.use('/api/areas', areasRoutes);

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
