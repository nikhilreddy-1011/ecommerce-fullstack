import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cart.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All cart routes require authentication
router.use(protect);

router.get('/', getCart);
router.post('/add', addToCart);
router.patch('/item/:productId', updateCartItem);
router.delete('/item/:productId', removeFromCart);
router.delete('/', clearCart);

export default router;
