import { Router } from 'express';
import * as testimonialController from './testimonial.controller';

const router = Router();

router.get('/', testimonialController.getTestimonials);
router.get('/:id', testimonialController.getTestimonialById);
router.post('/', testimonialController.createTestimonial);
router.patch('/:id', testimonialController.updateTestimonial);
router.delete('/:id', testimonialController.deleteTestimonial);

export default router;
