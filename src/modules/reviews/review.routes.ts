import { Router } from 'express';
import * as reviewController from './review.controller';

// Mounted at /api/v1/blogs/:blogId/reviews
const router = Router({ mergeParams: true });

router.get('/',            reviewController.getReviews);
router.post('/',           reviewController.createReview);
router.get('/:reviewId',   reviewController.getReviewById);
router.patch('/:reviewId', reviewController.updateReview);
router.delete('/:reviewId',reviewController.deleteReview);

export default router;

// Mounted at /api/v1/reviews - full list across all blogs
export const allReviewsRouter = Router();
allReviewsRouter.get('/', reviewController.getAllReviews);
