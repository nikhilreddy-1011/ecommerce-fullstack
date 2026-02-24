import { Request, Response } from 'express';
import slugify from 'slugify';
import Category from '../models/Category.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/response.utils';

// Helper: auto-generate slug from name if not provided
const makeSlug = (name: string) =>
    slugify(name, { lower: true, strict: true, trim: true });

// ─── CREATE CATEGORY ─────────────────────────────────────────────────────────
export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, description, parentCategory } = req.body;
        const slug = req.body.slug || makeSlug(name);

        const existing = await Category.findOne({ slug });
        if (existing) {
            sendError(res, 409, `Category with slug '${slug}' already exists`);
            return;
        }

        const category = await Category.create({
            name,
            slug,
            description,
            parentCategory: parentCategory || null,
            createdBy: req.user!.id,
            image: (req.file as Express.Multer.File & { path?: string })?.path || undefined,
        });

        sendSuccess(res, 201, 'Category created successfully', { category });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

// ─── GET ALL CATEGORIES ───────────────────────────────────────────────────────
export const getCategories = async (_req: Request, res: Response): Promise<void> => {
    try {
        const categories = await Category.find()
            .populate('parentCategory', 'name slug')
            .sort({ name: 1 })
            .lean();
        sendSuccess(res, 200, 'Categories fetched', { categories });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

// ─── GET SINGLE CATEGORY ─────────────────────────────────────────────────────
export const getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
        const category = await Category.findOne({ slug: req.params.slug })
            .populate('parentCategory', 'name slug')
            .lean();
        if (!category) {
            sendError(res, 404, 'Category not found');
            return;
        }
        sendSuccess(res, 200, 'Category fetched', { category });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

// ─── UPDATE CATEGORY ──────────────────────────────────────────────────────────
export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, description, parentCategory } = req.body;
        const updateData: Record<string, unknown> = { description, parentCategory };

        if (name) {
            updateData.name = name;
            updateData.slug = req.body.slug || makeSlug(name);
        }
        if ((req.file as Express.Multer.File & { path?: string })?.path) {
            updateData.image = (req.file as Express.Multer.File & { path?: string }).path;
        }

        const category = await Category.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });
        if (!category) {
            sendError(res, 404, 'Category not found');
            return;
        }
        sendSuccess(res, 200, 'Category updated', { category });
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};

// ─── DELETE CATEGORY ──────────────────────────────────────────────────────────
export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            sendError(res, 404, 'Category not found');
            return;
        }
        sendSuccess(res, 200, 'Category deleted successfully');
    } catch (error) {
        sendError(res, 500, (error as Error).message);
    }
};
