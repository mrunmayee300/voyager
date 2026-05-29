import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/error-handler';
import { authRouter } from './routes/auth.routes';
import { countriesRouter } from './routes/countries.routes';
import { visaRouter } from './routes/visa.routes';
import { tripsRouter } from './routes/trips.routes';
import { currencyRouter } from './routes/currency.routes';
import { centersRouter } from './routes/centers.routes';
import { aiRouter } from './routes/ai.routes';
import { plannerRouter } from './routes/planner.routes';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'voyager-api', timestamp: new Date().toISOString() });
  });

  const api = express.Router();
  api.use('/auth', authRouter);
  api.use('/countries', countriesRouter);
  api.use('/visa', visaRouter);
  api.use('/trips', tripsRouter);
  api.use('/currency', currencyRouter);
  api.use('/centers', centersRouter);
  api.use('/ai', aiRouter);
  api.use('/planner', plannerRouter);

  app.use('/api/v1', api);
  app.use(errorHandler);

  return app;
}
