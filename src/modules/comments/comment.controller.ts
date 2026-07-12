import type { Request, Response } from 'express';
import { errorResponse, successResponse } from '../../lib/response';
import * as commentService from './comment.service';
import type { CommentQueryParams, CommentStatus, CreateCommentDto, UpdateCommentDto } from './comment.types';

const VALID_STATUSES = new Set<CommentStatus>(['pending', 'approved', 'rejected']);

export async function getComments(req: Request, res: Response): Promise<void> {
  try {
    const { blogId } = req.params;
    const params: CommentQueryParams = {
      page:   req.query.page   ? Number.parseInt(req.query.page as string, 10)  : 1,
      limit:  req.query.limit  ? Number.parseInt(req.query.limit as string, 10) : 10,
      status: req.query.status as CommentStatus | undefined,
    };
    const { data, total } = await commentService.getCommentsByBlogId(blogId, params);
    res.json(successResponse({ data, total, page: params.page, limit: params.limit }, 'Comments fetched'));
  } catch (err) {
    console.error(err);
    res.status(500).json(errorResponse('Failed to fetch comments'));
  }
}

export async function getAllComments(req: Request, res: Response): Promise<void> {
  try {
    const params: CommentQueryParams = {
      page:   req.query.page   ? Number.parseInt(req.query.page as string, 10)  : 1,
      limit:  req.query.limit  ? Number.parseInt(req.query.limit as string, 10) : 10,
      status: req.query.status as CommentStatus | undefined,
    };
    const { data, total } = await commentService.getAllComments(params);
    res.json(successResponse({ data, total, page: params.page, limit: params.limit }, 'Comments fetched'));
  } catch (err) {
    console.error(err);
    res.status(500).json(errorResponse('Failed to fetch comments'));
  }
}

export async function getCommentById(req: Request, res: Response): Promise<void> {
  try {
    const { blogId, commentId } = req.params;
    const comment = await commentService.getCommentById(commentId, blogId);
    if (!comment) { res.status(404).json(errorResponse('Comment not found')); return; }
    res.json(successResponse(comment, 'Comment fetched'));
  } catch (err) {
    console.error(err);
    res.status(500).json(errorResponse('Failed to fetch comment'));
  }
}

export async function createComment(req: Request, res: Response): Promise<void> {
  try {
    const { blogId } = req.params;
    const dto = req.body as CreateCommentDto;

    if (!dto.name || !dto.comment_text) {
      res.status(400).json(errorResponse('name and comment_text are required'));
      return;
    }

    const comment = await commentService.createComment(blogId, dto);
    res.status(201).json(successResponse(comment, 'Comment created'));
  } catch (err) {
    console.error(err);
    res.status(500).json(errorResponse('Failed to create comment'));
  }
}

export async function updateComment(req: Request, res: Response): Promise<void> {
  try {
    const { blogId, commentId } = req.params;
    const dto = req.body as UpdateCommentDto;

    if (dto.status !== undefined && !VALID_STATUSES.has(dto.status)) {
      res.status(400).json(errorResponse('status must be pending, approved, or rejected'));
      return;
    }

    const comment = await commentService.updateComment(commentId, blogId, dto);
    if (!comment) { res.status(404).json(errorResponse('Comment not found')); return; }
    res.json(successResponse(comment, 'Comment updated'));
  } catch (err) {
    console.error(err);
    res.status(500).json(errorResponse('Failed to update comment'));
  }
}

export async function deleteComment(req: Request, res: Response): Promise<void> {
  try {
    const { blogId, commentId } = req.params;
    const deleted = await commentService.deleteComment(commentId, blogId);
    if (!deleted) { res.status(404).json(errorResponse('Comment not found')); return; }
    res.json(successResponse(null, 'Comment deleted'));
  } catch (err) {
    console.error(err);
    res.status(500).json(errorResponse('Failed to delete comment'));
  }
}
