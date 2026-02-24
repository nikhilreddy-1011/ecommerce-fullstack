import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

// Controllers will be added in later phases
// User profile management
const router = Router();

// GET /api/users/me
router.get('/me', protect, async (req, res) => {
    res.json({ success: true, message: 'Will be implemented fully in Phase 2b', user: (req as any).user });
});

// GET /api/users — Admin only
router.get('/', protect, authorizeRoles('admin'), async (_req, res) => {
    res.json({ success: true, message: 'Admin user list endpoint — Phase 7' });
});

// PUT /api/users/:id/block — Admin only
router.put('/:id/block', protect, authorizeRoles('admin'), async (_req, res) => {
    res.json({ success: true, message: 'Block user endpoint — Phase 7' });
});

export default router;
