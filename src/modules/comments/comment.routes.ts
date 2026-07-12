import { Router } from 'express';
import * as commentController from './comment.controller';

// Mounted at /api/v1/blogs/:blogId/comments
const router = Router({ mergeParams: true });

router.get('/',              commentController.getComments);
router.post('/',             commentController.createComment);
router.get('/:commentId',    commentController.getCommentById);
router.patch('/:commentId',  commentController.updateComment);
router.delete('/:commentId', commentController.deleteComment);

export default router;

// Mounted at /api/v1/comments - full list across all blogs
export const allCommentsRouter = Router();
allCommentsRouter.get('/', commentController.getAllComments);
