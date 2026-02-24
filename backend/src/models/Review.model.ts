import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
    product: mongoose.Types.ObjectId;
    customer: mongoose.Types.ObjectId;
    rating: number;
    title: string;
    body: string;
    images: string[];
    isVerifiedPurchase: boolean;
}

const ReviewSchema = new Schema<IReview>(
    {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        title: { type: String, required: true, trim: true },
        body: { type: String, required: true },
        images: [{ type: String }],
        isVerifiedPurchase: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// A customer can review a product only once
ReviewSchema.index({ product: 1, customer: 1 }, { unique: true });

export default mongoose.model<IReview>('Review', ReviewSchema);
