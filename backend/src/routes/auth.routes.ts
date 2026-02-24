import { Router } from 'express';
import {
    register,
    login,
    sendOtp,
    verifyOtpLogin,
    refreshToken,
    forgotPassword,
    resetPassword,
    logout,
    getMe,
} from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { protect } from '../middleware/auth.middleware';
import {
    registerSchema,
    loginSchema,
    sendOtpSchema,
    verifyOtpSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    refreshTokenSchema,
} from '../validators/auth.schema';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/login/otp/send', validate(sendOtpSchema), sendOtp);
router.post('/login/otp/verify', validate(verifyOtpSchema), verifyOtpLogin);
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;
