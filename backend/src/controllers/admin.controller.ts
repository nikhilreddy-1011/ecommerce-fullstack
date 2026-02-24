import { Response } from 'express';
import User from '../models/User.model';
import Product from '../models/Product.model';
import Order from '../models/Order.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/response.utils';
import { paginate } from '../utils/paginate.utils';

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────
export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const [
            totalUsers,
            totalProducts,
            totalOrders,
            pendingSellers,
            revenueResult,
            recentOrders,
        ] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments({ isActive: true }),
            Order.countDocuments(),
            User.countDocuments({ role: 'seller', isApproved: false }),
            Order.aggregate([
                { $match: { status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } },
            ]),
            Order.find()
                .populate('customer', 'name email')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
        ]);

        const totalRevenue = revenueResult[0]?.total || 0;

        sendSuccess(res, 200, 'Dashboard stats', {
            totalUsers,
            totalProducts,
            totalOrders,
            pendingSellers,
            totalRevenue,
            recentOrders,
        });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

// ─── LIST USERS ───────────────────────────────────────────────────────────────
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { page, limit, skip, totalPages } = paginate(req);
        const { role, search } = req.query;

        const filter: Record<string, unknown> = {};
        if (role) filter.role = role;
        if (search) filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];

        const [users, total] = await Promise.all([
            User.find(filter).select('-password -refreshToken').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            User.countDocuments(filter),
        ]);

        sendSuccess(res, 200, 'Users fetched', {
            users, total, page, totalPages: totalPages(total), limit,
        });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

// ─── APPROVE SELLER ───────────────────────────────────────────────────────────
export const approveSeller = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true }
        ).select('-password -refreshToken');

        if (!user) { sendError(res, 404, 'User not found'); return; }
        sendSuccess(res, 200, 'Seller approved', { user });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

// ─── BLOCK / UNBLOCK USER ─────────────────────────────────────────────────────
export const toggleBlockUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) { sendError(res, 404, 'User not found'); return; }
        if (user.role === 'admin') { sendError(res, 403, 'Cannot block admin'); return; }

        user.isBlocked = !user.isBlocked;
        await user.save();
        sendSuccess(res, 200, `User ${user.isBlocked ? 'blocked' : 'unblocked'}`, {
            isBlocked: user.isBlocked,
        });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

// ─── ALL PRODUCTS (admin view) ────────────────────────────────────────────────
export const adminGetProducts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { page, limit, skip, totalPages } = paginate(req);
        const { search, isActive } = req.query;
        const filter: Record<string, unknown> = {};
        if (search) filter.$text = { $search: search as string };
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate('seller', 'name email')
                .populate('category', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.countDocuments(filter),
        ]);

        sendSuccess(res, 200, 'Products fetched', {
            products, total, page, totalPages: totalPages(total), limit,
        });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

// ─── TOGGLE PRODUCT ACTIVE ────────────────────────────────────────────────────
export const toggleProductActive = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) { sendError(res, 404, 'Product not found'); return; }

        product.isActive = !product.isActive;
        await product.save();
        sendSuccess(res, 200, `Product ${product.isActive ? 'activated' : 'deactivated'}`, {
            isActive: product.isActive,
        });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};
