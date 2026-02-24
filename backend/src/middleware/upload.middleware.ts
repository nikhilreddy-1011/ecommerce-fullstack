import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (_req, file) => ({
        folder: 'shopx/products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
        public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    }),
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// Generic error handler for multer errors
export const handleUploadError = (err: Error, _req: Request, res: Response, next: NextFunction): void => {
    if (err instanceof multer.MulterError) {
        res.status(400).json({ success: false, message: err.message });
        return;
    }
    if (err) {
        res.status(400).json({ success: false, message: err.message });
        return;
    }
    next();
};
