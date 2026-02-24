import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, message: 'No token provided' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: string };

        const user = await User.findById(decoded.id).select('-passwordHash -refreshToken');
        if (!user) {
            res.status(401).json({ success: false, message: 'User not found' });
            return;
        }
        if (user.isBlocked) {
            res.status(403).json({ success: false, message: 'Your account has been blocked' });
            return;
        }

        req.user = { id: decoded.id, role: decoded.role };
        next();
    } catch {
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};
