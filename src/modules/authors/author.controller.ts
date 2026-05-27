import { Request, Response } from 'express';
import * as authorService from './author.service';
import { AuthorListQuery, UpdateAuthorDto } from './author.types';
import { errorResponse, successResponse } from '../../lib/response';

export async function getAuthors(req: Request, res: Response): Promise<void> {
  try {
    const query: AuthorListQuery = {
      page: req.query.page ? Number.parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? Number.parseInt(req.query.limit as string, 10) : 10,
      search: req.query.search as string | undefined,
    };
    const result = await authorService.getAuthors(query);
    res.json(successResponse(result, 'Authors fetched successfully'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to fetch authors', [(err as Error).message]));
  }
}

export async function createAuthor(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, avatar, bio, education, specialization } = req.body;
    if (!name || !email) {
      res.status(400).json(errorResponse('Validation failed', ['name and email are required']));
      return;
    }
    const author = await authorService.createAuthor({ name, email, avatar, bio, education, specialization });
    res.status(201).json(successResponse(author, 'Author created successfully'));
  } catch (err: any) {
    if (err.code === '23505') {
      res.status(409).json(errorResponse('Conflict', ['An author with this email already exists']));
      return;
    }
    res.status(500).json(errorResponse('Failed to create author', [err.message]));
  }
}

export async function getAuthorById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const author = await authorService.getAuthorById(id);
    if (!author) {
      res.status(404).json(errorResponse('Author not found'));
      return;
    }
    res.json(successResponse(author, 'Author fetched successfully'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to fetch author', [(err as Error).message]));
  }
}

export async function updateAuthor(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const dto: UpdateAuthorDto = req.body;
    const author = await authorService.updateAuthor(id, dto);
    if (!author) {
      res.status(404).json(errorResponse('Author not found'));
      return;
    }
    res.json(successResponse(author, 'Author updated successfully'));
  } catch (err: any) {
    if (err.code === '23505') {
      res.status(409).json(errorResponse('Conflict', ['An author with this email already exists']));
      return;
    }
    res.status(500).json(errorResponse('Failed to update author', [err.message]));
  }
}

export async function deleteAuthor(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await authorService.deleteAuthor(id);
    if (!deleted) {
      res.status(404).json(errorResponse('Author not found'));
      return;
    }
    res.status(200).json(successResponse(null, 'Author deleted successfully'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to delete author', [(err as Error).message]));
  }
}
