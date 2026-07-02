import { Router, type Router as ExpressRouter } from 'express';
import { authMiddleware } from '../middleware/auth';
import healthRouter from './health';
import metricsRouter from './metrics';

const router: ExpressRouter = Router();

router.get('/', (_req, res) => {
  res.send('Application is Running');
});

router.use('/health', authMiddleware, healthRouter);
router.use('/metrics', authMiddleware, metricsRouter);

export default router;
