import { Request, Response } from 'express';
import * as dashboardService from './dashboard.service';
import { errorResponse, successResponse } from '../../lib/response';

export async function getDashboardStats(req: Request, res: Response): Promise<void> {
  try {
    const stats = await dashboardService.getDashboardStats();
    res.json(successResponse(stats, 'Dashboard stats fetched successfully'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to fetch dashboard stats', [(err as Error).message]));
  }
}
