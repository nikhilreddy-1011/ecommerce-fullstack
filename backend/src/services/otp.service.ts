import crypto from 'crypto';
import User from '../models/User.model';

const OTP_EXPIRY_MINUTES = 10;

// Generate a cryptographically secure 6-digit OTP
const generateOtp = (): string => {
    return crypto.randomInt(100000, 999999).toString();
};

// Hash OTP before storing (never store plain OTP)
const hashOtp = (otp: string): string => {
    return crypto.createHash('sha256').update(otp).digest('hex');
};

export const createAndSaveOtp = async (phone: string): Promise<string> => {
    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);
    const expiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Upsert: update existing user's OTP or create new user stub
    await User.findOneAndUpdate(
        { phone },
        { otp: hashedOtp, otpExpiry: expiry },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return otp; // Return plain OTP to send via SMS
};

export const verifyOtp = async (
    phone: string,
    inputOtp: string
): Promise<boolean> => {
    const user = await User.findOne({ phone });
    if (!user || !user.otp || !user.otpExpiry) return false;

    const isExpired = new Date() > new Date(user.otpExpiry);
    if (isExpired) return false;

    const hashedInput = hashOtp(inputOtp);
    const isValid = crypto.timingSafeEqual(
        Buffer.from(hashedInput),
        Buffer.from(user.otp)
    );

    if (isValid) {
        // Invalidate OTP after successful verification
        await User.findByIdAndUpdate(user._id, {
            $unset: { otp: '', otpExpiry: '' },
        });
    }

    return isValid;
};
