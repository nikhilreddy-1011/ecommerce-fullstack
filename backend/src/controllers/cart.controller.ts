import { Response } from 'express';
import mongoose from 'mongoose';
import Cart from '../models/Cart.model';
import Product from '../models/Product.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/response.utils';

// ─── GET CART ─────────────────────────────────────────────────────────────────
export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        let cart = await Cart.findOne({ customer: req.user!.id })
            .populate({
                path: 'items.product',
                select: 'name slug images price discountedPrice stock isActive seller',
                populate: { path: 'seller', select: 'name' },
            })
            .lean();

        if (!cart) {
            cart = { _id: new mongoose.Types.ObjectId(), customer: new mongoose.Types.ObjectId(req.user!.id), items: [], createdAt: new Date(), updatedAt: new Date() } as unknown as typeof cart;
        }

        sendSuccess(res, 200, 'Cart fetched', { cart });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

// ─── ADD / UPDATE ITEM ────────────────────────────────────────────────────────
export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { productId, quantity } = req.body;
        const qty = Math.max(1, Number(quantity) || 1);

        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            sendError(res, 404, 'Product not found');
            return;
        }
        if (product.stock < qty) {
            sendError(res, 400, `Only ${product.stock} units available`);
            return;
        }

        let cart = await Cart.findOne({ customer: req.user!.id });
        if (!cart) {
            cart = new Cart({ customer: req.user!.id, items: [] });
        }

        const existingIdx = cart.items.findIndex(
            (i) => i.product.toString() === productId
        );
        if (existingIdx > -1) {
            const newQty = Math.min(cart.items[existingIdx].quantity + qty, product.stock);
            cart.items[existingIdx].quantity = newQty;
        } else {
            cart.items.push({ product: product._id, quantity: qty, addedAt: new Date() });
        }

        await cart.save();

        const populated = await Cart.findById(cart._id)
            .populate({
                path: 'items.product',
                select: 'name slug images price discountedPrice stock isActive',
            })
            .lean();

        sendSuccess(res, 200, 'Item added to cart', { cart: populated });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

// ─── UPDATE ITEM QUANTITY ─────────────────────────────────────────────────────
export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        const qty = Number(quantity);

        if (!qty || qty < 1) {
            sendError(res, 400, 'Quantity must be at least 1');
            return;
        }

        const product = await Product.findById(productId);
        if (!product) {
            sendError(res, 404, 'Product not found');
            return;
        }
        if (product.stock < qty) {
            sendError(res, 400, `Only ${product.stock} units available`);
            return;
        }

        const cart = await Cart.findOne({ customer: req.user!.id });
        if (!cart) {
            sendError(res, 404, 'Cart not found');
            return;
        }

        const item = cart.items.find((i) => i.product.toString() === productId);
        if (!item) {
            sendError(res, 404, 'Item not in cart');
            return;
        }

        item.quantity = qty;
        await cart.save();
        sendSuccess(res, 200, 'Cart updated', { cart });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

// ─── REMOVE ITEM ──────────────────────────────────────────────────────────────
export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { productId } = req.params;
        const cart = await Cart.findOne({ customer: req.user!.id });
        if (!cart) {
            sendError(res, 404, 'Cart not found');
            return;
        }
        cart.items = cart.items.filter((i) => i.product.toString() !== productId);
        await cart.save();
        sendSuccess(res, 200, 'Item removed from cart');
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

// ─── CLEAR CART ───────────────────────────────────────────────────────────────
export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await Cart.findOneAndUpdate({ customer: req.user!.id }, { items: [] });
        sendSuccess(res, 200, 'Cart cleared');
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};
