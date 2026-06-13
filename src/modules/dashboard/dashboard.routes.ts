import { Router } from 'express';
import * as dashboardController from './dashboard.controller';

const router = Router();

// GET /api/v1/dashboard
router.get('/', dashboardController.getDashboardStats);

export default router;
