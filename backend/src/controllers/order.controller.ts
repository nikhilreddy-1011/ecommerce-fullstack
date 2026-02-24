import { Response } from 'express';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.model';
import Payment from '../models/Payment.model';
import Cart from '../models/Cart.model';
import Product from '../models/Product.model';
import User from '../models/User.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/response.utils';
import { paginate } from '../utils/paginate.utils';
import { sendOrderConfirmationEmail } from '../utils/email.utils';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// ─── CREATE RAZORPAY ORDER ────────────────────────────────────────────────────
export const createRazorpayOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { shippingAddress } = req.body;
        if (!shippingAddress) {
            sendError(res, 400, 'Shipping address is required');
            return;
        }

        // Load the user's cart
        const cart = await Cart.findOne({ customer: req.user!.id }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            sendError(res, 400, 'Cart is empty');
            return;
        }

        // Validate stock and build order items
        let totalAmount = 0;
        const orderItems: {
            product: mongoose.Types.ObjectId;
            seller: mongoose.Types.ObjectId;
            quantity: number;
            price: number;
        }[] = [];

        for (const item of cart.items) {
            const product = await Product.findById(item.product);
            if (!product || !product.isActive) {
                sendError(res, 400, `Product ${item.product} is no longer available`);
                return;
            }
            if (product.stock < item.quantity) {
                sendError(res, 400, `Insufficient stock for ${product.name}`);
                return;
            }
            const price = product.discountedPrice || product.price;
            totalAmount += price * item.quantity;
            orderItems.push({
                product: product._id,
                seller: product.seller,
                quantity: item.quantity,
                price,
            });
        }

        // Create Razorpay order (amount in paise)
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100),
            currency: 'INR',
            receipt: `order_${Date.now()}`,
        });

        // Create a pending Order document in our DB
        const order = await Order.create({
            customer: req.user!.id,
            items: orderItems,
            shippingAddress,
            totalAmount,
            commissionAmount: parseFloat((totalAmount * 0.02).toFixed(2)),
            status: 'pending',
            razorpayOrderId: razorpayOrder.id,
        });

        sendSuccess(res, 201, 'Order initiated', {
            orderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

// ─── VERIFY PAYMENT ───────────────────────────────────────────────────────────
export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

        // Verify the HMAC signature
        const body = `${razorpayOrderId}|${razorpayPaymentId}`;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpaySignature) {
            sendError(res, 400, 'Payment verification failed: invalid signature');
            return;
        }

        // Mark order as confirmed
        const order = await Order.findById(orderId);
        if (!order) {
            sendError(res, 404, 'Order not found');
            return;
        }

        order.status = 'confirmed';
        order.paymentId = razorpayPaymentId;
        await order.save();

        // Store payment record
        await Payment.create({
            order: order._id,
            customer: req.user!.id,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            amount: order.totalAmount,
            status: 'captured',
        });

        // Deduct stock for each ordered item
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity },
            });
        }

        // Clear cart after successful payment
        await Cart.findOneAndUpdate({ customer: req.user!.id }, { items: [] });

        // Fire-and-forget order confirmation email
        try {
            const customer = await User.findById(req.user!.id).select('name email');
            if (customer?.email) {
                void sendOrderConfirmationEmail(
                    customer.email,
                    customer.name,
                    String(order._id),
                    order.totalAmount
                );
            }
        } catch { /* email failure should not break payment response */ }

        sendSuccess(res, 200, 'Payment verified and order confirmed', { order });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

// ─── GET USER ORDERS ──────────────────────────────────────────────────────────
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { page, limit, skip, totalPages } = paginate(req);

        const [orders, total] = await Promise.all([
            Order.find({ customer: req.user!.id })
                .populate({ path: 'items.product', select: 'name slug images price' })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Order.countDocuments({ customer: req.user!.id }),
        ]);

        sendSuccess(res, 200, 'Orders fetched', {
            orders,
            total,
            page,
            totalPages: totalPages(total),
            limit,
        });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

// ─── GET SINGLE ORDER ─────────────────────────────────────────────────────────
export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const order = await Order.findById(req.params.id)
            .populate({ path: 'items.product', select: 'name slug images price discountedPrice' })
            .populate({ path: 'items.seller', select: 'name email' })
            .lean();

        if (!order) {
            sendError(res, 404, 'Order not found');
            return;
        }

        // Customers can only view their own orders; admins/sellers can view all
        if (
            order.customer.toString() !== req.user!.id &&
            req.user!.role !== 'admin'
        ) {
            sendError(res, 403, 'Not authorized');
            return;
        }

        sendSuccess(res, 200, 'Order fetched', { order });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

// ─── UPDATE ORDER STATUS (Admin / Seller) ─────────────────────────────────────
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { status } = req.body;
        const validStatuses = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            sendError(res, 400, 'Invalid status');
            return;
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!order) {
            sendError(res, 404, 'Order not found');
            return;
        }

        // If cancelled, restore stock
        if (status === 'cancelled') {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity },
                });
            }
        }

        sendSuccess(res, 200, 'Order status updated', { order });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

// ─── GET ALL ORDERS (Admin) ───────────────────────────────────────────────────
export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { page, limit, skip, totalPages } = paginate(req);

        const [orders, total] = await Promise.all([
            Order.find()
                .populate({ path: 'customer', select: 'name email' })
                .populate({ path: 'items.product', select: 'name images price' })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Order.countDocuments(),
        ]);

        sendSuccess(res, 200, 'All orders fetched', {
            orders,
            total,
            page,
            totalPages: totalPages(total),
            limit,
        });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};
