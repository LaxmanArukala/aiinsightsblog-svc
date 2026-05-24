import { Request, Response } from 'express';
import * as testimonialService from './testimonial.service';
import { CreateTestimonialDto, TestimonialListQuery, UpdateTestimonialDto } from './testimonial.types';
import { errorResponse, successResponse } from '../../lib/response';

export async function getTestimonials(req: Request, res: Response): Promise<void> {
  try {
    const query: TestimonialListQuery = {
      page: req.query.page ? Number.parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? Number.parseInt(req.query.limit as string, 10) : 10,
      rating: req.query.rating ? Number.parseInt(req.query.rating as string, 10) : undefined,
    };
    const result = await testimonialService.getTestimonials(query);
    res.json(successResponse(result, 'Testimonials fetched successfully'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to fetch testimonials', [(err as Error).message]));
  }
}

export async function getTestimonialById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const testimonial = await testimonialService.getTestimonialById(id);
    if (!testimonial) {
      res.status(404).json(errorResponse('Testimonial not found'));
      return;
    }
    res.json(successResponse(testimonial, 'Testimonial fetched successfully'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to fetch testimonial', [(err as Error).message]));
  }
}

export async function createTestimonial(req: Request, res: Response): Promise<void> {
  try {
    const dto: CreateTestimonialDto = req.body;
    if (!dto.author || !dto.role || !dto.company || !dto.avatar || !dto.content) {
      res.status(400).json(errorResponse('Validation failed', ['author, role, company, avatar and content are required']));
      return;
    }
    if (dto.rating !== undefined && (dto.rating < 1 || dto.rating > 5)) {
      res.status(400).json(errorResponse('Validation failed', ['rating must be between 1 and 5']));
      return;
    }
    const testimonial = await testimonialService.createTestimonial(dto);
    res.status(201).json(successResponse(testimonial, 'Testimonial created successfully'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to create testimonial', [(err as Error).message]));
  }
}

export async function updateTestimonial(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const dto: UpdateTestimonialDto = req.body;
    if (dto.rating !== undefined && (dto.rating < 1 || dto.rating > 5)) {
      res.status(400).json(errorResponse('Validation failed', ['rating must be between 1 and 5']));
      return;
    }
    const testimonial = await testimonialService.updateTestimonial(id, dto);
    if (!testimonial) {
      res.status(404).json(errorResponse('Testimonial not found'));
      return;
    }
    res.json(successResponse(testimonial, 'Testimonial updated successfully'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to update testimonial', [(err as Error).message]));
  }
}

export async function deleteTestimonial(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await testimonialService.deleteTestimonial(id);
    if (!deleted) {
      res.status(404).json(errorResponse('Testimonial not found'));
      return;
    }
    res.status(200).json(successResponse(null, 'Testimonial deleted successfully'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to delete testimonial', [(err as Error).message]));
  }
}
