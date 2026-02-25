import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    slug: string;
    description: string;
    price: number;
    discountedPrice?: number;
    category: string;
    seller: mongoose.Types.ObjectId;
    images: string[];
    stock: number;
    attributes: Map<string, string>;
    ratings: {
        average: number;
        count: number;
    };
    isActive: boolean;
}

const ProductSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true },
        description: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        discountedPrice: { type: Number, min: 0 },
        category: { type: String, required: true },
        seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        images: [{ type: String }],
        stock: { type: Number, required: true, default: 0, min: 0 },
        attributes: { type: Map, of: String, default: {} },
        ratings: {
            average: { type: Number, default: 0, min: 0, max: 5 },
            count: { type: Number, default: 0 },
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Full-text search index
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1, price: 1, 'ratings.average': -1 });

export default mongoose.model<IProduct>('Product', ProductSchema);
