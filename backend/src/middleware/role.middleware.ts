import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const authorizeRoles = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `Role '${req.user?.role}' is not authorized to access this route`,
            });
            return;
        }
        next();
    };
};
