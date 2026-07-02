import { Router, type Router as ExpressRouter } from 'express';
import { getSystemMetrics } from '../services/metrics';
import { getLogs, getErrors } from '../services/logger';

const router: ExpressRouter = Router();

router.get('/', (_req, res) => {
  res.json(getSystemMetrics());
});

router.get('/logs', (_req, res) => {
  res.json({ logs: getLogs() });
});

router.get('/errors', (_req, res) => {
  res.json({ errors: getErrors() });
});

export default router;
