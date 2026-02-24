import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parentCategory?: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
}

const CategorySchema = new Schema<ICategory>(
    {
        name: { type: String, required: true, unique: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true },
        description: { type: String },
        image: { type: String },
        parentCategory: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

export default mongoose.model<ICategory>('Category', CategorySchema);
