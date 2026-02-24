import { Router } from 'express';
import {
    getProducts,
    getProductBySlug,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    getProductReviews,
    addReview,
} from '../controllers/product.controller';
import { validate } from '../middleware/validate.middleware';
import { protect } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { createProductSchema, updateProductSchema } from '../validators/product.schema';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// ── Public ──────────────────────────────────────────────────────────────────
router.get('/', getProducts);
router.get('/detail/:slug', getProductBySlug);
router.get('/:id', getProductById);
router.get('/:id/reviews', getProductReviews);

// ── Seller + Admin ───────────────────────────────────────────────────────────
router.post(
    '/',
    protect,
    authorizeRoles('seller', 'admin'),
    upload.array('images', 5),
    validate(createProductSchema),
    createProduct
);
router.put(
    '/:id',
    protect,
    authorizeRoles('seller', 'admin'),
    upload.array('images', 5),
    validate(updateProductSchema),
    updateProduct
);
router.delete('/:id', protect, authorizeRoles('seller', 'admin'), deleteProduct);
router.patch('/:id/stock', protect, authorizeRoles('seller', 'admin'), updateStock);

// ── Customer ─────────────────────────────────────────────────────────────────
router.post('/:id/reviews', protect, authorizeRoles('customer'), addReview);

export default router;
