import { Router, type Router as ExpressRouter } from 'express';
import { HealthResponse } from '../types';

const router: ExpressRouter = Router();

router.get('/', (_req, res) => {
  const health: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV ?? 'development',
  };
  res.json(health);
});

export default router;
