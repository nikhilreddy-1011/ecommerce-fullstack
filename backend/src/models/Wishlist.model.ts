import mongoose, { Document, Schema } from 'mongoose';

export interface IWishlist extends Document {
    customer: mongoose.Types.ObjectId;
    products: mongoose.Types.ObjectId[];
}

const WishlistSchema = new Schema<IWishlist>(
    {
        customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    },
    { timestamps: true }
);

export default mongoose.model<IWishlist>('Wishlist', WishlistSchema);
