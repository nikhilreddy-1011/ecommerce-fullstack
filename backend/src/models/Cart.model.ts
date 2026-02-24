import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
    product: mongoose.Types.ObjectId;
    quantity: number;
    addedAt: Date;
}

export interface ICart extends Document {
    customer: mongoose.Types.ObjectId;
    items: ICartItem[];
}

const CartItemSchema = new Schema<ICartItem>({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    addedAt: { type: Date, default: Date.now },
});

const CartSchema = new Schema<ICart>(
    {
        customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        items: [CartItemSchema],
    },
    { timestamps: true }
);

export default mongoose.model<ICart>('Cart', CartSchema);
