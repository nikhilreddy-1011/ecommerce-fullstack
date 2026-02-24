import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAddress {
    label: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
}

// Plain object interface — no Document extension to avoid Mongoose 9 type conflicts
export interface IUser {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone?: string;
    passwordHash: string;
    role: 'customer' | 'seller' | 'admin';
    isApproved: boolean;
    isBlocked: boolean;
    refreshToken?: string;
    profileImage?: string;
    address: IAddress[];
    otp?: string;
    otpExpiry?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Methods interface
export interface IUserMethods {
    comparePassword(password: string): Promise<boolean>;
}

// Combined model type
type UserModel = Model<IUser, object, IUserMethods>;

const AddressSchema = new Schema<IAddress>({
    label: { type: String, default: 'Home' },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' },
});

const UserSchema = new Schema<IUser, UserModel, IUserMethods>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, unique: true, lowercase: true, trim: true },
        phone: { type: String, unique: true, sparse: true },
        passwordHash: { type: String },
        role: { type: String, enum: ['customer', 'seller', 'admin'], default: 'customer' },
        isApproved: { type: Boolean, default: false },
        isBlocked: { type: Boolean, default: false },
        refreshToken: { type: String },
        profileImage: { type: String },
        address: [AddressSchema],
        otp: { type: String },
        otpExpiry: { type: Date },
    },
    { timestamps: true }
);

// Define method
UserSchema.method('comparePassword', async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash as string);
});

// Pre-save: hash password
UserSchema.pre('save', async function () {
    if (this.isModified('passwordHash')) {
        const salt = await bcrypt.genSalt(12);
        this.passwordHash = await bcrypt.hash(this.passwordHash as string, salt);
    }
    // Auto-approve non-sellers on first save
    if (this.isNew && this.role !== 'seller') {
        this.isApproved = true;
    }
});

const User = mongoose.model<IUser, UserModel>('User', UserSchema);
export default User;
