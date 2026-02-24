import { Router } from 'express';
import {
    createRazorpayOrder,
    verifyPayment,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    getAllOrders,
} from '../controllers/order.controller';
import { protect } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();

router.use(protect);

// Customer routes
router.post('/create', authorizeRoles('customer'), createRazorpayOrder);
router.post('/verify', authorizeRoles('customer'), verifyPayment);
router.get('/my', getMyOrders);
router.get('/:id', getOrderById);

// Admin routes
router.get('/', authorizeRoles('admin'), getAllOrders);
router.patch('/:id/status', authorizeRoles('admin', 'seller'), updateOrderStatus);

export default router;
