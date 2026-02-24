import { Router } from 'express';
import { getWishlist, toggleWishlist, clearWishlist } from '../controllers/wishlist.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', getWishlist);
router.post('/:productId', toggleWishlist);
router.delete('/', clearWishlist);

export default router;
