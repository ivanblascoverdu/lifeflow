import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import config from './config/env';

// Import routes
import authRoutes from './routes/auth.routes';
import habitsRoutes from './routes/habits.routes';
import goalsRoutes from './routes/goals.routes';
import timeTrackingRoutes from './routes/time-tracking.routes';
import analyticsRoutes from './routes/analytics.routes';

// Import middleware
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();

// Middleware
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
const API_PREFIX = `/api/${process.env.API_VERSION || 'v1'}`;

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/habits`, habitsRoutes);
app.use(`${API_PREFIX}/goals`, goalsRoutes);
app.use(`${API_PREFIX}/time-tracking`, timeTrackingRoutes);
app.use(`${API_PREFIX}/analytics`, analyticsRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
