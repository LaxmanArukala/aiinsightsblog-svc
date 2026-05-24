import { Router } from 'express';
import * as blogController from './blog.controller';

const router = Router();

router.get('/generate', blogController.generateBlogHandler);
router.get('/ai-list', blogController.generateBlogListHandler);
router.get('/', blogController.getBlogs);
router.get('/:id', blogController.getBlogById);
router.post('/', blogController.createBlog);
router.put('/:id', blogController.upsertBlog);
router.delete('/:id', blogController.deleteBlog);

export default router;
