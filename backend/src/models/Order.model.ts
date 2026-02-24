import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
    product: mongoose.Types.ObjectId;
    seller: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
    status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
}

export interface IOrder extends Document {
    customer: mongoose.Types.ObjectId;
    items: IOrderItem[];
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
    };
    paymentId?: mongoose.Types.ObjectId;
    razorpayOrderId?: string;
    totalAmount: number;
    commissionAmount: number;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    invoiceUrl?: string;
}

const OrderItemSchema = new Schema<IOrderItem>({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'shipped', 'delivered', 'cancelled'],
        default: 'pending',
    },
});

const OrderSchema = new Schema<IOrder>(
    {
        customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        items: [OrderItemSchema],
        shippingAddress: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
            country: { type: String, default: 'India' },
        },
        paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
        razorpayOrderId: { type: String },
        totalAmount: { type: Number, required: true },
        commissionAmount: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending',
        },
        invoiceUrl: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
