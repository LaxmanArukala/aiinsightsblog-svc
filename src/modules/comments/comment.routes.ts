import { Router } from 'express';
import * as commentController from './comment.controller';

// Mounted at /api/v1/blogs/:blogId/comments
const router = Router({ mergeParams: true });

router.get('/',              commentController.getComments);
router.post('/',             commentController.createComment);
router.get('/:commentId',    commentController.getCommentById);
router.put('/:commentId',    commentController.updateComment);
router.delete('/:commentId', commentController.deleteComment);

export default router;
