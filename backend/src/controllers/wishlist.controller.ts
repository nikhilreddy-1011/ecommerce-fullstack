import { Response } from 'express';
import Wishlist from '../models/Wishlist.model';
import Product from '../models/Product.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/response.utils';

// ─── GET WISHLIST ─────────────────────────────────────────────────────────────
export const getWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const wishlist = await Wishlist.findOne({ customer: req.user!.id })
            .populate({
                path: 'products',
                select: 'name slug images price discountedPrice ratings stock isActive',
            })
            .lean();

        sendSuccess(res, 200, 'Wishlist fetched', { wishlist: wishlist || { products: [] } });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

// ─── TOGGLE WISHLIST ITEM ─────────────────────────────────────────────────────
export const toggleWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            sendError(res, 404, 'Product not found');
            return;
        }

        let wishlist = await Wishlist.findOne({ customer: req.user!.id });
        if (!wishlist) {
            wishlist = new Wishlist({ customer: req.user!.id, products: [] });
        }

        const productObjId = product._id;
        const idx = wishlist.products.findIndex((p) => p.toString() === productId);

        let action: 'added' | 'removed';
        if (idx > -1) {
            wishlist.products.splice(idx, 1);
            action = 'removed';
        } else {
            wishlist.products.push(productObjId);
            action = 'added';
        }

        await wishlist.save();
        sendSuccess(res, 200, `Product ${action} from wishlist`, {
            action,
            productId,
            count: wishlist.products.length,
        });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

// ─── CLEAR WISHLIST ───────────────────────────────────────────────────────────
export const clearWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await Wishlist.findOneAndUpdate({ customer: req.user!.id }, { products: [] });
        sendSuccess(res, 200, 'Wishlist cleared');
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};
