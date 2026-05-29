import { Router } from 'express';
import * as blogController from './blog.controller';
import reviewRoutes from '../reviews/review.routes';
import commentRoutes from '../comments/comment.routes';

const router = Router();

router.get('/generate', blogController.generateBlogHandler);
router.get('/ai-list', blogController.generateBlogListHandler);
router.get('/', blogController.getBlogs);
router.get('/:id', blogController.getBlogById);
router.post('/', blogController.createBlog);
router.put('/:id', blogController.upsertBlog);
router.delete('/:id', blogController.deleteBlog);

// Nested: /api/v1/blogs/:blogId/reviews
router.use('/:blogId/reviews', reviewRoutes);

// Nested: /api/v1/blogs/:blogId/comments
router.use('/:blogId/comments', commentRoutes);

export default router;
