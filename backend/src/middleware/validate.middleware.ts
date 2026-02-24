import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

export const validate = (schema: ZodTypeAny) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const zodErrors = result.error?.issues ?? [];
            const errors = zodErrors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            }));
            res.status(400).json({ success: false, message: 'Validation failed', errors });
            return;
        }
        req.body = result.data;
        next();
    };
};
