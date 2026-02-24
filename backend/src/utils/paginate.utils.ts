import { Request } from 'express';

export interface PaginationResult {
    page: number;
    limit: number;
    skip: number;
    totalPages: (total: number) => number;
}

export const paginate = (req: Request): PaginationResult => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 12);
    const skip = (page - 1) * limit;

    return {
        page,
        limit,
        skip,
        totalPages: (total: number) => Math.ceil(total / limit),
    };
};
