import { Request, Response } from 'express';
import * as blogService from './blog.service';
import { generateBlogByTopic, generateBlogList } from './blog.generate';
import { BlogListQuery, CreateBlogDto, UpsertBlogDto } from './blog.types';
import { errorResponse, successResponse } from '../../lib/response';

export async function getBlogs(req: Request, res: Response): Promise<void> {
  try {
    const query: BlogListQuery = {
      page: req.query.page ? Number.parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? Number.parseInt(req.query.limit as string, 10) : 10,
      search: req.query.search as string | undefined,
      sort: req.query.sort as BlogListQuery['sort'],
      featured: req.query.featured === undefined ? undefined : req.query.featured === 'true',
      category: (req.query.category_slug ?? req.query.category) as string | undefined,
      category_name: req.query.category_name as string | undefined,
      status: req.query.status as BlogListQuery['status'] | undefined,
      review: req.query.review === 'true',
      rewritten: req.query.rewritten === undefined ? undefined : req.query.rewritten === 'true',
    };
    const result = await blogService.getBlogs(query);
    res.json(successResponse(result, 'Blogs fetched successfully'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to fetch blogs', [(err as Error).message]));
  }
}

export async function getBlogById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const blog = await blogService.getBlogById(id);
    if (!blog) {
      res.status(404).json(errorResponse('Blog not found'));
      return;
    }
    res.json(successResponse(blog, 'Blog fetched successfully'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to fetch blog', [(err as Error).message]));
  }
}

export async function createBlog(req: Request, res: Response): Promise<void> {
  try {
    const dto: CreateBlogDto = req.body;
    if (!dto.title || !dto.slug) {
      res.status(400).json(errorResponse('Validation failed', ['title and slug are required']));
      return;
    }
    const blog = await blogService.createBlog(dto);
    res.status(201).json(successResponse(blog, 'Blog created successfully'));
  } catch (err: any) {
    if (err.code === '23505') {
      res.status(409).json(errorResponse('Conflict', ['A blog with this slug already exists']));
      return;
    }
    res.status(500).json(errorResponse('Failed to create blog', [err.message]));
  }
}

export async function upsertBlog(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const dto: UpsertBlogDto = req.body;
    if (!dto.title || !dto.slug) {
      res.status(400).json(errorResponse('Validation failed', ['title and slug are required']));
      return;
    }
    const blog = await blogService.upsertBlog(id, dto);
    if (!blog) {
      res.status(404).json(errorResponse('Blog not found'));
      return;
    }
    res.json(successResponse(blog, 'Blog updated successfully'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to upsert blog', [(err as Error).message]));
  }
}

export async function deleteBlog(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await blogService.deleteBlog(id);
    if (!deleted) {
      res.status(404).json(errorResponse('Blog not found'));
      return;
    }
    res.status(200).json(successResponse(null, 'Blog deleted successfully'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to delete blog', [(err as Error).message]));
  }
}

export async function getRelatedBlogs(req: Request, res: Response): Promise<void> {
  try {
    const categoryId = req.query.category_id as string;
    if (!categoryId) {
      res.status(400).json(errorResponse('Validation failed', ['category_id query param is required']));
      return;
    }
    const limit = req.query.limit ? Math.min(20, Number.parseInt(req.query.limit as string, 10)) : 4;
    const blogs = await blogService.getRelatedBlogs(categoryId, limit);
    res.json(successResponse(blogs, 'Related blogs fetched successfully'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to fetch related blogs', [(err as Error).message]));
  }
}

export async function generateBlogHandler(req: Request, res: Response): Promise<void> {
  try {
    const topic = req.query.topic as string;
    if (!topic || topic.trim() === '') {
      res.status(400).json(errorResponse('Validation failed', ['topic query param is required']));
      return;
    }
    const blog = await generateBlogByTopic(topic.trim());
    res.json(successResponse(blog, 'Blog generated successfully'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to generate blog', [(err as Error).message]));
  }
}

export async function generateBlogListHandler(req: Request, res: Response): Promise<void> {
  try {
    const category = (req.query.category as string) || 'Artificial Intelligence';
    const count = req.query.count ? Math.min(20, Number.parseInt(req.query.count as string, 10)) : 6;
    const blogs = await generateBlogList(category.trim(), count);
    res.json(successResponse({ data: blogs, meta: { total: blogs.length, category } }, 'Blog list generated successfully'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to generate blog list', [(err as Error).message]));
  }
}

export async function submitRevision(req: Request, res: Response): Promise<void> {
  try {
    const { content, excerpt, tags, read_time, quality_scores } = req.body ?? {};
    if (!content) {
      res.status(400).json(errorResponse('Validation failed', ['content is required']));
      return;
    }
    const blog = await blogService.submitRevision(req.params.id, {
      content,
      excerpt: excerpt ?? null,
      tags: Array.isArray(tags) ? tags : [],
      read_time: Number(read_time) || 0,
      quality_scores: quality_scores ?? null,
    });
    if (!blog) {
      res.status(404).json(errorResponse('Published blog not found'));
      return;
    }
    res.json(successResponse(blog, 'Revision submitted for approval'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to submit revision', [(err as Error).message]));
  }
}

export async function approveBlog(req: Request, res: Response): Promise<void> {
  try {
    const blog = await blogService.approveBlog(req.params.id);
    if (!blog) {
      res.status(404).json(errorResponse('Nothing awaiting approval for this blog'));
      return;
    }
    res.json(successResponse(blog, 'Blog approved'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to approve blog', [(err as Error).message]));
  }
}

export async function rejectBlog(req: Request, res: Response): Promise<void> {
  try {
    const blog = await blogService.rejectBlog(req.params.id);
    if (!blog) {
      res.status(404).json(errorResponse('Nothing awaiting approval for this blog'));
      return;
    }
    res.json(successResponse(blog, 'Blog rejected'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to reject blog', [(err as Error).message]));
  }
}
