import { z } from 'zod';

export const createCategorySchema = z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters').max(80),
    slug: z
        .string()
        .min(2)
        .max(80)
        .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only')
        .optional(),
    description: z.string().max(500).optional(),
    parentCategory: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createProductSchema = z.object({
    name: z.string().min(3, 'Product name is required').max(200),
    description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
    price: z.coerce.number().positive('Price must be positive'),
    discountedPrice: z.coerce.number().positive().optional(),

    stock: z.coerce.number().int().min(0, 'Stock cannot be negative').default(0),
    attributes: z.record(z.string(), z.unknown()).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(12),
    search: z.string().max(200).optional(),

    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().positive().optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    sortBy: z
        .enum(['price_asc', 'price_desc', 'rating_desc', 'newest', 'popular'])
        .default('newest'),
    seller: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
