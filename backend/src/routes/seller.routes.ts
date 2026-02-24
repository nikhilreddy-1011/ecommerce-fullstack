import { Router } from 'express';
import { getSellerStats, getSellerProducts, getSellerOrders } from '../controllers/seller.controller';
import { protect } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();
router.use(protect, authorizeRoles('seller', 'admin'));

router.get('/stats', getSellerStats);
router.get('/products', getSellerProducts);
router.get('/orders', getSellerOrders);

export default router;
