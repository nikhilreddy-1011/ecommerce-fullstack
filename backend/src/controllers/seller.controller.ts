import { Response } from 'express';
import Product from '../models/Product.model';
import Order from '../models/Order.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/response.utils';
import { paginate } from '../utils/paginate.utils';

// ─── SELLER DASHBOARD STATS ───────────────────────────────────────────────────
export const getSellerStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const sellerId = req.user!.id;

        const [totalProducts, totalOrders, revenueResult, recentOrders] = await Promise.all([
            Product.countDocuments({ seller: sellerId, isActive: true }),
            Order.countDocuments({ 'items.seller': sellerId }),
            Order.aggregate([
                { $match: { 'items.seller': sellerId, status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } } },
                { $unwind: '$items' },
                { $match: { 'items.seller': sellerId } },
                { $group: { _id: null, total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
            ]),
            Order.find({ 'items.seller': sellerId })
                .populate({ path: 'items.product', select: 'name images' })
                .populate('customer', 'name email')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
        ]);

        sendSuccess(res, 200, 'Seller stats', {
            totalProducts,
            totalOrders,
            totalRevenue: revenueResult[0]?.total || 0,
            recentOrders,
        });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

// ─── SELLER'S OWN PRODUCTS ────────────────────────────────────────────────────
export const getSellerProducts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { page, limit, skip, totalPages } = paginate(req);
        const sellerId = req.user!.id;

        const [products, total] = await Promise.all([
            Product.find({ seller: sellerId })
                .populate('category', 'name slug')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.countDocuments({ seller: sellerId }),
        ]);

        sendSuccess(res, 200, 'Seller products', {
            products, total, page, totalPages: totalPages(total), limit,
        });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

// ─── SELLER'S ORDERS ──────────────────────────────────────────────────────────
export const getSellerOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { page, limit, skip, totalPages } = paginate(req);
        const sellerId = req.user!.id;
        const { status } = req.query;

        const filter: Record<string, unknown> = { 'items.seller': sellerId };
        if (status) filter.status = status;

        const [orders, total] = await Promise.all([
            Order.find(filter)
                .populate({ path: 'items.product', select: 'name images price' })
                .populate('customer', 'name email phone')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Order.countDocuments(filter),
        ]);

        sendSuccess(res, 200, 'Seller orders', {
            orders, total, page, totalPages: totalPages(total), limit,
        });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};
