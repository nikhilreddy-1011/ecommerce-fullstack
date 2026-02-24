import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
    order: mongoose.Types.ObjectId;
    customer: mongoose.Types.ObjectId;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    amount: number;
    currency: string;
    status: 'created' | 'paid' | 'failed' | 'refunded';
    method?: string;
}

const PaymentSchema = new Schema<IPayment>(
    {
        order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
        customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        razorpayOrderId: { type: String, required: true, unique: true },
        razorpayPaymentId: { type: String },
        razorpaySignature: { type: String },
        amount: { type: Number, required: true },
        currency: { type: String, default: 'INR' },
        status: {
            type: String,
            enum: ['created', 'paid', 'failed', 'refunded'],
            default: 'created',
        },
        method: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model<IPayment>('Payment', PaymentSchema);
