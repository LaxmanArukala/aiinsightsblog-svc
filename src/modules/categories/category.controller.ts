import { Request, Response } from 'express';
import * as categoryService from './category.service';
import { CategoryListQuery } from './category.types';
import { errorResponse, successResponse } from '../../lib/response';

export async function getCategories(req: Request, res: Response): Promise<void> {
  try {
    const query: CategoryListQuery = {
      page:  req.query.page  ? Number.parseInt(req.query.page  as string, 10) : 1,
      limit: req.query.limit ? Number.parseInt(req.query.limit as string, 10) : 10,
    };
    const result = await categoryService.getCategories(query);
    res.json(successResponse(result, 'Categories fetched successfully'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to fetch categories', [(err as Error).message]));
  }
}

export async function getCategoryById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(id);
    if (!category) {
      res.status(404).json(errorResponse('Category not found'));
      return;
    }
    res.json(successResponse(category, 'Category fetched successfully'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to fetch category', [(err as Error).message]));
  }
}

export async function createCategory(req: Request, res: Response): Promise<void> {
  try {
    const { name, color } = req.body;
    if (!name) {
      res.status(400).json(errorResponse('Validation failed', ['name is required']));
      return;
    }
    const category = await categoryService.createCategory({ name, color });
    res.status(201).json(successResponse(category, 'Category created successfully'));
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes('unique') || msg.includes('duplicate')) {
      res.status(409).json(errorResponse('Category name already exists'));
      return;
    }
    res.status(500).json(errorResponse('Failed to create category', [msg]));
  }
}

export async function updateCategory(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, color, blog_count } = req.body;
    const category = await categoryService.updateCategory(id, { name, color, blog_count });
    if (!category) {
      res.status(404).json(errorResponse('Category not found'));
      return;
    }
    res.json(successResponse(category, 'Category updated successfully'));
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes('unique') || msg.includes('duplicate')) {
      res.status(409).json(errorResponse('Category name already exists'));
      return;
    }
    res.status(500).json(errorResponse('Failed to update category', [msg]));
  }
}

export async function deleteCategory(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await categoryService.deleteCategory(id);
    if (!deleted) {
      res.status(404).json(errorResponse('Category not found'));
      return;
    }
    res.status(200).json(successResponse(null, 'Category deleted successfully'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to delete category', [(err as Error).message]));
  }
}
