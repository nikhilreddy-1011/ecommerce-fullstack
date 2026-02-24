import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}

export const errorHandler = (
    err: AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Log detailed error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('ERROR 💥:', err);
    }

    // Mongoose duplicate key error
    if ((err as any).code === 11000) {
        const field = Object.keys((err as any).keyValue || {})[0];
        res.status(400).json({
            success: false,
            message: `${field} already exists. Please use a different ${field}.`,
        });
        return;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values((err as any).errors).map((e: any) => e.message);
        res.status(400).json({ success: false, message: 'Validation Error', errors });
        return;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({ success: false, message: 'Invalid token' });
        return;
    }
    if (err.name === 'TokenExpiredError') {
        res.status(401).json({ success: false, message: 'Token expired' });
        return;
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

// Helper to create operational errors
export const createError = (message: string, statusCode: number): AppError => {
    const error: AppError = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
