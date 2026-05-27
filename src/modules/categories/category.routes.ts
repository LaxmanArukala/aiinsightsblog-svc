import { Router } from 'express';
import * as categoryController from './category.controller';

const router = Router();

router.get('/',       categoryController.getCategories);
router.post('/',      categoryController.createCategory);
router.get('/:id',    categoryController.getCategoryById);
router.put('/:id',    categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;
