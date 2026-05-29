import type { Request, Response } from 'express';
import { errorResponse, successResponse } from '../../lib/response';
import * as reviewService from './review.service';
import type { CreateReviewDto, ReviewQueryParams, ReviewStatus, UpdateReviewDto } from './review.types';

const VALID_STATUSES = new Set<ReviewStatus>(['pending', 'approved', 'rejected']);

export async function getReviews(req: Request, res: Response): Promise<void> {
  try {
    const { blogId } = req.params;
    const params: ReviewQueryParams = {
      page:   req.query.page   ? Number.parseInt(req.query.page as string, 10)   : 1,
      limit:  req.query.limit  ? Number.parseInt(req.query.limit as string, 10)  : 10,
      rating: req.query.rating ? Number.parseInt(req.query.rating as string, 10) : undefined,
      status: req.query.status as ReviewStatus | undefined,
    };
    const { data, total } = await reviewService.getReviewsByBlogId(blogId, params);
    res.json(successResponse({ data, total, page: params.page, limit: params.limit }, 'Reviews fetched'));
  } catch (err) {
    console.error(err);
    res.status(500).json(errorResponse('Failed to fetch reviews'));
  }
}

export async function getReviewById(req: Request, res: Response): Promise<void> {
  try {
    const { blogId, reviewId } = req.params;
    const review = await reviewService.getReviewById(reviewId, blogId);
    if (!review) { res.status(404).json(errorResponse('Review not found')); return; }
    res.json(successResponse(review, 'Review fetched'));
  } catch (err) {
    console.error(err);
    res.status(500).json(errorResponse('Failed to fetch review'));
  }
}

export async function createReview(req: Request, res: Response): Promise<void> {
  try {
    const { blogId } = req.params;
    const dto = req.body as CreateReviewDto;

    if (!dto.name || !dto.email || !dto.rating || !dto.review_text) {
      res.status(400).json(errorResponse('name, email, rating, and review_text are required'));
      return;
    }
    if (dto.rating < 1 || dto.rating > 5) {
      res.status(400).json(errorResponse('rating must be between 1 and 5'));
      return;
    }

    const review = await reviewService.createReview(blogId, dto);
    res.status(201).json(successResponse(review, 'Review created'));
  } catch (err) {
    console.error(err);
    res.status(500).json(errorResponse('Failed to create review'));
  }
}

export async function updateReview(req: Request, res: Response): Promise<void> {
  try {
    const { blogId, reviewId } = req.params;
    const dto = req.body as UpdateReviewDto;

    if (dto.rating !== undefined && (dto.rating < 1 || dto.rating > 5)) {
      res.status(400).json(errorResponse('rating must be between 1 and 5'));
      return;
    }
    if (dto.status !== undefined && !VALID_STATUSES.has(dto.status)) {
      res.status(400).json(errorResponse('status must be pending, approved, or rejected'));
      return;
    }

    const review = await reviewService.updateReview(reviewId, blogId, dto);
    if (!review) { res.status(404).json(errorResponse('Review not found')); return; }
    res.json(successResponse(review, 'Review updated'));
  } catch (err) {
    console.error(err);
    res.status(500).json(errorResponse('Failed to update review'));
  }
}

export async function deleteReview(req: Request, res: Response): Promise<void> {
  try {
    const { blogId, reviewId } = req.params;
    const deleted = await reviewService.deleteReview(reviewId, blogId);
    if (!deleted) { res.status(404).json(errorResponse('Review not found')); return; }
    res.json(successResponse(null, 'Review deleted'));
  } catch (err) {
    console.error(err);
    res.status(500).json(errorResponse('Failed to delete review'));
  }
}
