import 'express-async-errors';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { env } from './env.js';
import { errorHandler, notFound } from './middleware/error.js';
import { authRouter } from './routes/auth.js';
import { healthRouter } from './routes/health.js';
import { transactionsRouter } from './routes/transactions.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/transactions', transactionsRouter);

  // Later phases:
  // app.use('/api/reminders', remindersRouter);
  // app.use('/api/budgets', budgetsRouter);
  // app.use('/api/reports', reportsRouter);
  // app.use('/api/dashboard', dashboardRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
