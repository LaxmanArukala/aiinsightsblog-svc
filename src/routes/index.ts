import { Router, Request, Response } from 'express';
import { successResponse } from '../lib/response';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(successResponse({ docs: '/api/v1', version: '1.0.0' }, 'Welcome to AI Insights Hub API'));
});

router.get('/health', (_req: Request, res: Response) => {
  res.json(successResponse({ status: 'healthy' }, 'OK'));
});

export default router;
