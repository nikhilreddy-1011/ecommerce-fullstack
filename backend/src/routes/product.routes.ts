import { Router } from 'express';
import multer from 'multer';
import slugify from 'slugify';
import cloudinary from '../config/cloudinary';
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
import Product from '../models/Product.model';
import { validate } from '../middleware/validate.middleware';
import { protect } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { createProductSchema, updateProductSchema } from '../validators/product.schema';

const authorize = authorizeRoles;
const localupload = multer({ dest: 'uploads/' });

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
    authorize('seller'),
    localupload.single('image'),
    async (req, res) => {
        try {
            const { name, description, price, stock } = req.body;

            // Generate slug
            let slug = slugify(name, { lower: true, strict: true, trim: true });
            const existing = await Product.findOne({ slug });
            if (existing) slug = `${slug}-${Date.now()}`;

            const result = await cloudinary.uploader.upload(req.file!.path);

            const product = await Product.create({
                name,
                slug,
                description,
                price: Number(price),
                stock: Number(stock),
                images: [result.secure_url],
                seller: (req as any).user._id || (req as any).user.id,
            });

            res.status(201).json({ success: true, product });
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }
);
router.put(
    '/:id',
    protect,
    authorizeRoles('seller', 'admin'),
    localupload.array('images', 5),
    validate(updateProductSchema),
    updateProduct
);
router.delete('/:id', protect, authorizeRoles('seller', 'admin'), deleteProduct);
router.patch('/:id/stock', protect, authorizeRoles('seller', 'admin'), updateStock);

// ── Customer ─────────────────────────────────────────────────────────────────
router.post('/:id/reviews', protect, authorizeRoles('customer'), addReview);

export default router;
