import { Router } from 'express';
import * as blogController from './blog.controller';
import reviewRoutes from '../reviews/review.routes';
import commentRoutes from '../comments/comment.routes';
import analyticsRoutes from '../analytics/analytics.routes';

const router = Router();

router.get('/generate', blogController.generateBlogHandler);
router.get('/ai-list', blogController.generateBlogListHandler);
router.get('/related', blogController.getRelatedBlogs);
router.get('/', blogController.getBlogs);
router.get('/:id', blogController.getBlogById);
router.post('/', blogController.createBlog);
router.patch('/:id', blogController.upsertBlog);
router.delete('/:id', blogController.deleteBlog);

// Nested: /api/v1/blogs/:blogId/reviews
router.use('/:blogId/reviews', reviewRoutes);

// Nested: /api/v1/blogs/:blogId/comments
router.use('/:blogId/comments', commentRoutes);

// Nested: /api/v1/blogs/:blogId/(views|likes|bookmarks|shares)
router.use('/:blogId', analyticsRoutes);

export default router;
