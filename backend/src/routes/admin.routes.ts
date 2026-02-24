import { Router } from 'express';
import {
    getDashboardStats, getAllUsers, approveSeller,
    toggleBlockUser, adminGetProducts, toggleProductActive,
} from '../controllers/admin.controller';
import { protect } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();
router.use(protect, authorizeRoles('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/approve', approveSeller);
router.patch('/users/:id/block', toggleBlockUser);
router.get('/products', adminGetProducts);
router.patch('/products/:id/toggle', toggleProductActive);

export default router;
