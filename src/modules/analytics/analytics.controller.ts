import { Request, Response } from 'express';
import * as analyticsService from './analytics.service';
import { AnalyticsIdentifier } from './analytics.types';
import { errorResponse, successResponse } from '../../lib/response';

function getIdentifier(req: Request): AnalyticsIdentifier {
  const visitorId = (req.headers['x-visitor-id'] as string) || undefined;
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ??
    req.socket.remoteAddress ??
    '0.0.0.0';
  return { visitorId, ipAddress: ip };
}

// ── Views ─────────────────────────────────────────────────────────────────────

export async function postView(req: Request, res: Response): Promise<void> {
  try {
    const result = await analyticsService.recordView(req.params.blogId, getIdentifier(req));
    res.json(successResponse(result, 'View recorded'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to record view', [(err as Error).message]));
  }
}

export async function getViews(req: Request, res: Response): Promise<void> {
  try {
    const result = await analyticsService.getViews(req.params.blogId);
    res.json(successResponse(result, 'Views fetched'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to fetch views', [(err as Error).message]));
  }
}

// ── Likes ─────────────────────────────────────────────────────────────────────

export async function postLike(req: Request, res: Response): Promise<void> {
  try {
    const result = await analyticsService.toggleLike(req.params.blogId, getIdentifier(req));
    res.json(successResponse(result, result.liked ? 'Blog liked' : 'Blog unliked'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to toggle like', [(err as Error).message]));
  }
}

export async function getLikes(req: Request, res: Response): Promise<void> {
  try {
    const result = await analyticsService.getLikes(req.params.blogId, getIdentifier(req));
    res.json(successResponse(result, 'Likes fetched'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to fetch likes', [(err as Error).message]));
  }
}

// ── Bookmarks ─────────────────────────────────────────────────────────────────

export async function postBookmark(req: Request, res: Response): Promise<void> {
  try {
    const result = await analyticsService.toggleBookmark(req.params.blogId, getIdentifier(req));
    res.json(successResponse(result, result.bookmarked ? 'Blog bookmarked' : 'Bookmark removed'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to toggle bookmark', [(err as Error).message]));
  }
}

export async function getBookmarks(req: Request, res: Response): Promise<void> {
  try {
    const result = await analyticsService.getBookmarks(req.params.blogId, getIdentifier(req));
    res.json(successResponse(result, 'Bookmarks fetched'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to fetch bookmarks', [(err as Error).message]));
  }
}

// ── Shares ────────────────────────────────────────────────────────────────────

export async function postShare(req: Request, res: Response): Promise<void> {
  try {
    const { platform } = req.body as { platform?: string };
    const result = await analyticsService.recordShare(req.params.blogId, getIdentifier(req), platform);
    res.json(successResponse(result, 'Share recorded'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to record share', [(err as Error).message]));
  }
}

export async function getShares(req: Request, res: Response): Promise<void> {
  try {
    const result = await analyticsService.getShares(req.params.blogId);
    res.json(successResponse(result, 'Shares fetched'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to fetch shares', [(err as Error).message]));
  }
}
