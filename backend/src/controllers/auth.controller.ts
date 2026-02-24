import { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/User.model';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';
import { sendSuccess, sendError } from '../utils/response.utils';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/email.service';
import { createAndSaveOtp, verifyOtp } from '../services/otp.service';
import { AuthRequest } from '../middleware/auth.middleware';

// ─── REGISTER ────────────────────────────────────────────────────────────────
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            sendError(res, 409, 'An account with this email already exists');
            return;
        }

        const user = await User.create({
            name,
            email,
            passwordHash: password, // pre-save hook hashes it
            role: role || 'customer',
        });

        const payload = { id: user._id.toString(), role: user.role };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // Store refresh token in DB
        await User.findByIdAndUpdate(user._id, { refreshToken });

        // Send welcome email (non-blocking)
        sendWelcomeEmail(email, name).catch(console.error);

        sendSuccess(res, 201, 'Account created successfully', {
            accessToken,
            refreshToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
            },
        });
    } catch (error) {
        const err = error as Error;
        sendError(res, 500, err.message || 'Registration failed');
    }
};

// ─── LOGIN (email + password) ─────────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+passwordHash +refreshToken');
        if (!user || !user.passwordHash) {
            sendError(res, 401, 'Invalid email or password');
            return;
        }

        // Use instance method (defined via UserSchema.method)
        const isMatch = await (user as any).comparePassword(password);
        if (!isMatch) {
            sendError(res, 401, 'Invalid email or password');
            return;
        }

        if (user.isBlocked) {
            sendError(res, 403, 'Your account has been suspended. Contact support.');
            return;
        }

        const payload = { id: user._id.toString(), role: user.role };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        await User.findByIdAndUpdate(user._id, { refreshToken });

        sendSuccess(res, 200, 'Login successful', {
            accessToken,
            refreshToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
                profileImage: user.profileImage,
            },
        });
    } catch (error) {
        const err = error as Error;
        sendError(res, 500, err.message || 'Login failed');
    }
};

// ─── SEND OTP ────────────────────────────────────────────────────────────────
export const sendOtp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { phone } = req.body;

        const otp = await createAndSaveOtp(phone);

        // In production: send via Twilio/MSG91
        // For dev, log to console
        if (process.env.NODE_ENV === 'development') {
            console.log(`[DEV] OTP for ${phone}: ${otp}`);
        }

        // TODO: Integrate Twilio/MSG91 here in production
        // await twilioClient.messages.create({ body: `Your ShopX OTP: ${otp}`, from: ..., to: `+91${phone}` });

        sendSuccess(res, 200, `OTP sent to +91${phone}`, {
            // Only expose in dev/test for easier testing
            ...(process.env.NODE_ENV === 'development' && { otp }),
        });
    } catch (error) {
        const err = error as Error;
        sendError(res, 500, err.message || 'Failed to send OTP');
    }
};

// ─── VERIFY OTP ──────────────────────────────────────────────────────────────
export const verifyOtpLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { phone, otp, name } = req.body;

        const isValid = await verifyOtp(phone, otp);
        if (!isValid) {
            sendError(res, 400, 'Invalid or expired OTP');
            return;
        }

        // Find or auto-create user on first OTP login
        let user = await User.findOne({ phone });
        if (!user) {
            user = await User.create({
                name: name || `User_${phone.slice(-4)}`,
                phone,
                role: 'customer',
            });
            if (user.email) sendWelcomeEmail(user.email, user.name).catch(console.error);
        }

        if (user.isBlocked) {
            sendError(res, 403, 'Your account has been suspended.');
            return;
        }

        const payload = { id: user._id.toString(), role: user.role };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        await User.findByIdAndUpdate(user._id, { refreshToken });

        sendSuccess(res, 200, 'OTP verified. Login successful', {
            accessToken,
            refreshToken,
            user: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role,
                isApproved: user.isApproved,
            },
        });
    } catch (error) {
        const err = error as Error;
        sendError(res, 500, err.message || 'OTP verification failed');
    }
};

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken: token } = req.body;

        const decoded = verifyRefreshToken(token);
        const user = await User.findById(decoded.id).select('+refreshToken');

        if (!user || user.refreshToken !== token) {
            sendError(res, 401, 'Invalid refresh token');
            return;
        }

        if (user.isBlocked) {
            sendError(res, 403, 'Account suspended');
            return;
        }

        const payload = { id: user._id.toString(), role: user.role };
        const newAccessToken = generateAccessToken(payload);

        sendSuccess(res, 200, 'Token refreshed', { accessToken: newAccessToken });
    } catch {
        sendError(res, 401, 'Invalid or expired refresh token');
    }
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        // Always return success to prevent email enumeration attack
        if (!user) {
            sendSuccess(res, 200, 'If an account exists, a reset link has been sent');
            return;
        }

        // Generate secure reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Store hashed token + 15-min expiry in OTP fields (reuse)
        await User.findByIdAndUpdate(user._id, {
            otp: hashedToken,
            otpExpiry: new Date(Date.now() + 15 * 60 * 1000),
        });

        await sendPasswordResetEmail(email, user.name, resetToken);

        sendSuccess(res, 200, 'If an account exists, a reset link has been sent');
    } catch (error) {
        const err = error as Error;
        sendError(res, 500, err.message || 'Failed to process password reset');
    }
};

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token, password } = req.body;

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            otp: hashedToken,
            otpExpiry: { $gt: new Date() },
        });

        if (!user) {
            sendError(res, 400, 'Invalid or expired reset token');
            return;
        }

        // Update password (pre-save hook will re-hash)
        user.passwordHash = password;
        user.otp = undefined;
        user.otpExpiry = undefined;
        user.refreshToken = undefined; // Invalidate all sessions
        await user.save();

        sendSuccess(res, 200, 'Password reset successfully. Please log in again.');
    } catch (error) {
        const err = error as Error;
        sendError(res, 500, err.message || 'Password reset failed');
    }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await User.findByIdAndUpdate(req.user?.id, { $unset: { refreshToken: '' } });
        sendSuccess(res, 200, 'Logged out successfully');
    } catch (error) {
        const err = error as Error;
        sendError(res, 500, err.message || 'Logout failed');
    }
};

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?.id).select(
            '-passwordHash -refreshToken -otp -otpExpiry'
        );
        if (!user) {
            sendError(res, 404, 'User not found');
            return;
        }
        sendSuccess(res, 200, 'User fetched', { user });
    } catch (error) {
        const err = error as Error;
        sendError(res, 500, err.message || 'Failed to fetch user');
    }
};
