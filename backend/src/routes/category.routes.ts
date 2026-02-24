import { Router } from 'express';
import {
    createCategory,
    getCategories,
    getCategoryBySlug,
    updateCategory,
    deleteCategory,
} from '../controllers/category.controller';
import { validate } from '../middleware/validate.middleware';
import { protect } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { createCategorySchema, updateCategorySchema } from '../validators/product.schema';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Public
router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

// Admin only
router.post(
    '/',
    protect,
    authorizeRoles('admin'),
    upload.single('image'),
    validate(createCategorySchema),
    createCategory
);
router.put(
    '/:id',
    protect,
    authorizeRoles('admin'),
    upload.single('image'),
    validate(updateCategorySchema),
    updateCategory
);
router.delete('/:id', protect, authorizeRoles('admin'), deleteCategory);

export default router;
