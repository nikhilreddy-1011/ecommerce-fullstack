import { Request, Response } from 'express';
import mongoose from 'mongoose';
import slugify from 'slugify';
import Product from '../models/Product.model';
import Review from '../models/Review.model';
// Rebuild trigger
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/response.utils';
import { paginate } from '../utils/paginate.utils';

const makeSlug = (name: string) =>
    slugify(name, { lower: true, strict: true, trim: true });

// ─── GET ALL PRODUCTS (with search, filter, sort, paginate) ──────────────────
export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page, limit, skip, totalPages } = paginate(req);
        const {
            search, minPrice, maxPrice, minRating, sortBy, seller,
        } = req.query;

        // Build dynamic filter
        const filter: Record<string, unknown> = { isActive: true };

        if (search) {
            filter.$text = { $search: search as string };
        }

        if (seller) {
            filter.seller = new mongoose.Types.ObjectId(seller as string);
        }
        if (minPrice || maxPrice) {
            const priceFilter: Record<string, number> = {};
            if (minPrice) priceFilter.$gte = Number(minPrice);
            if (maxPrice) priceFilter.$lte = Number(maxPrice);
            filter.price = priceFilter;
        }
        if (minRating) {
            filter['ratings.average'] = { $gte: Number(minRating) };
        }

        // Sort mapping
        const sortMap: Record<string, Record<string, 1 | -1>> = {
            price_asc: { price: 1 },
            price_desc: { price: -1 },
            rating_desc: { 'ratings.average': -1 },
            newest: { createdAt: -1 },
            popular: { 'ratings.count': -1 },
        };
        const sort = sortMap[(sortBy as string)] || sortMap.newest;

        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate('seller', 'name profileImage')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.countDocuments(filter),
        ]);

        sendSuccess(res, 200, 'Products fetched', {
            products,
            total,
            page,
            totalPages: totalPages(total),
            limit,
        });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

// ─── GET SINGLE PRODUCT ───────────────────────────────────────────────────────
export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await Product.findOne({ slug: req.params.slug, isActive: true })
            .populate('seller', 'name profileImage')
            .lean();

        if (!product) {
            sendError(res, 404, 'Product not found');
            return;
        }

        // Fetch latest reviews alongside product
        const reviews = await Review.find({ product: product._id })
            .populate('customer', 'name profileImage')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        sendSuccess(res, 200, 'Product fetched', { product, reviews });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

// ─── GET PRODUCT BY ID ────────────────────────────────────────────────────────
export const getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('seller', 'name profileImage')
            .lean();
        if (!product) {
            sendError(res, 404, 'Product not found');
            return;
        }
        sendSuccess(res, 200, 'Product fetched', { product });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

// ─── CREATE PRODUCT ───────────────────────────────────────────────────────────
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, description, price, discountedPrice, stock, attributes } = req.body;

        // Build slug and ensure uniqueness
        let slug = makeSlug(name);
        const existing = await Product.findOne({ slug });
        if (existing) slug = `${slug}-${Date.now()}`;

        // Collect uploaded image URLs from Cloudinary
        const files = req.files as (Express.Multer.File & { path?: string })[];
        const images = files?.map((f) => f.path || '').filter(Boolean) || [];

        const product = await Product.create({
            name,
            slug,
            description,
            price: Number(price),
            discountedPrice: discountedPrice ? Number(discountedPrice) : undefined,
            seller: req.user!.id,
            images,
            stock: Number(stock) || 0,
            attributes: attributes || {},
        });

        sendSuccess(res, 201, 'Product created successfully', { product });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

// ─── UPDATE PRODUCT ───────────────────────────────────────────────────────────
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            sendError(res, 404, 'Product not found');
            return;
        }

        // Only the product owner or admin can update
        if (
            product.seller.toString() !== req.user!.id &&
            req.user!.role !== 'admin'
        ) {
            sendError(res, 403, 'Not authorized to update this product');
            return;
        }

        const files = req.files as (Express.Multer.File & { path?: string })[];
        const newImages = files?.map((f) => f.path || '').filter(Boolean) || [];

        const updateData = {
            ...req.body,
            ...(newImages.length > 0 && { images: [...product.images, ...newImages] }),
            ...(req.body.name && { slug: makeSlug(req.body.name) }),
        };

        const updated = await Product.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });

        sendSuccess(res, 200, 'Product updated', { product: updated });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

// ─── DELETE PRODUCT ───────────────────────────────────────────────────────────
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            sendError(res, 404, 'Product not found');
            return;
        }
        if (
            product.seller.toString() !== req.user!.id &&
            req.user!.role !== 'admin'
        ) {
            sendError(res, 403, 'Not authorized');
            return;
        }
        // Soft delete — mark as inactive instead of removing
        await Product.findByIdAndUpdate(req.params.id, { isActive: false });
        sendSuccess(res, 200, 'Product removed successfully');
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

// ─── UPDATE STOCK ─────────────────────────────────────────────────────────────
export const updateStock = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { stock } = req.body;
        if (typeof stock !== 'number' || stock < 0) {
            sendError(res, 400, 'Invalid stock value');
            return;
        }
        const product = await Product.findById(req.params.id);
        if (!product) {
            sendError(res, 404, 'Product not found');
            return;
        }
        if (
            product.seller.toString() !== req.user!.id &&
            req.user!.role !== 'admin'
        ) {
            sendError(res, 403, 'Not authorized');
            return;
        }
        product.stock = stock;
        await product.save();
        sendSuccess(res, 200, 'Stock updated', { stock: product.stock });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

// ─── ADD REVIEW ───────────────────────────────────────────────────────────────
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page, limit, skip, totalPages } = paginate(req);
        const productId = new mongoose.Types.ObjectId(req.params.id as string);

        const [reviews, total] = await Promise.all([
            Review.find({ product: productId })
                .populate('customer', 'name profileImage')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Review.countDocuments({ product: productId }),
        ]);

        sendSuccess(res, 200, 'Reviews fetched', {
            reviews, total, page, totalPages: totalPages(total), limit,
        });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

export const addReview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { rating, title, body } = req.body;
        const productId = req.params.id;

        const existing = await Review.findOne({
            product: productId,
            customer: req.user!.id,
        });
        if (existing) {
            sendError(res, 409, 'You have already reviewed this product');
            return;
        }

        const review = await Review.create({
            product: productId,
            customer: req.user!.id,
            rating: Number(rating),
            title,
            body,
        });

        // Recalculate product average rating
        const stats = await Review.aggregate([
            { $match: { product: new mongoose.Types.ObjectId(productId as string) } as Record<string, unknown> },
            { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
        ]);

        if (stats.length > 0) {
            await Product.findByIdAndUpdate(productId, {
                'ratings.average': Math.round(stats[0].avg * 10) / 10,
                'ratings.count': stats[0].count,
            });
        }

        sendSuccess(res, 201, 'Review submitted', { review });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};
