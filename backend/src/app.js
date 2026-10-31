import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import nutritionRoutes from './routes/nutritionRoutes.js';
import profileRoutes from './routes/profileRoutes.js';

// Security: Validate JWT_SECRET on startup
const isProd = process.env.NODE_ENV === 'production';
if (!process.env.JWT_SECRET) {
  if (isProd) {
    throw new Error('FATAL: JWT_SECRET environment variable is required in production and must be at least 32 characters.');
  }
  process.env.JWT_SECRET = 'fittrack-development-fallback-secret-minimum-32-chars-long';
  console.warn('⚠️ [SECURITY] Running with development fallback JWT_SECRET. In production, provide a secret with >= 32 characters.');
} else if (process.env.JWT_SECRET.length < 32) {
  if (isProd) {
    throw new Error('FATAL: JWT_SECRET must be at least 32 characters in production.');
  }
  console.warn('⚠️ [SECURITY] Warning: JWT_SECRET is shorter than 32 characters.');
}

const app = express();

// Security headers
app.disable('x-powered-by');
app.use(helmet());

// CORS configuration: Strict whitelist matching CLIENT_URL / CLIENT_ORIGIN
const rawOrigins = process.env.CLIENT_URL || process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const allowedOrigins = rawOrigins
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

// Security: Reject wildcard '*' CORS in production when credentials: true
if (isProd && allowedOrigins.includes('*')) {
  throw new Error('FATAL [SECURITY]: Wildcard CORS origin "*" is not permitted in production when credentials: true is enabled. Specify exact CLIENT_URL origin(s).');
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Non-browser clients (server-to-server health probes, curl, mobile native) do not send an Origin header
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || (!isProd && allowedOrigins.includes('*'))) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: Origin '${origin}' is not authorized.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Parsers & logging
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('tiny'));
}

// Health check endpoint (reports exact database status)
app.get('/api/health', (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const isConnected = dbState === 1;
  res.status(200).json({
    status: isConnected ? 'ok' : 'degraded',
    service: 'fittrack-api',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: isConnected ? 'connected' : 'disconnected',
      readyState: dbState,
    },
    demoMode: process.env.DEMO_MODE === 'true',
  });
});

// Rate limiting for authentication routes: 20 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === 'test' ? 1000 : 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

// Mount API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/profile', profileRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((error, _req, res, _next) => {
  if (error?.message && error.message.startsWith('CORS blocked')) {
    return res.status(403).json({ message: error.message });
  }
  if (error?.code === 11000) {
    return res.status(409).json({ message: 'A record with this value already exists.' });
  }
  if (error?.name === 'ValidationError') {
    return res.status(400).json({
      message: Object.values(error.errors)
        .map((item) => item.message)
        .join(' '),
    });
  }
  if (error?.name === 'CastError') {
    return res.status(400).json({
      message: `Invalid ID format for parameter '${error.path}'. Must be a 24-character hexadecimal ObjectId.`,
    });
  }
  if (
    error?.name === 'MongoServerSelectionError' ||
    error?.name === 'MongooseServerSelectionError' ||
    error?.name === 'MongoNetworkError' ||
    error?.name === 'MongoTimeoutError' ||
    (mongoose.connection.readyState !== 1 && error?.name?.includes('Mongo'))
  ) {
    return res.status(503).json({
      message: 'Database service is currently unavailable. Please check your connection and try again.',
    });
  }
  console.error(error);
  res.status(error.status || 500).json({
    message:
      process.env.NODE_ENV === 'production'
        ? 'An unexpected server error occurred.'
        : error.message || 'Internal server error.',
  });
});

export default app;
