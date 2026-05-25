import { Router } from 'express';
import * as authorController from './author.controller';

const router = Router();

router.get('/', authorController.getAuthors);
router.get('/:id', authorController.getAuthorById);
router.patch('/:id', authorController.updateAuthor);
router.delete('/:id', authorController.deleteAuthor);

export default router;
