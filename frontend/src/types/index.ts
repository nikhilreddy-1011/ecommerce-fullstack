// ─── User Types ───────────────────────────────────────────────────────────────
export type UserRole = 'customer' | 'seller' | 'admin';

export interface IAddress {
    _id?: string;
    label: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
}

export interface IShippingAddress {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
}

export interface IUser {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    isApproved: boolean;
    isBlocked: boolean;
    profileImage?: string;
    address: IAddress[];
    createdAt: string;
    updatedAt: string;
}

// ─── Auth Types ───────────────────────────────────────────────────────────────
export interface AuthState {
    user: IUser | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
}

// ─── Product Types ────────────────────────────────────────────────────────────
export interface IProduct {
    _id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    discountedPrice?: number;
    category: ICategory;
    seller: IUser;
    images: string[];
    stock: number;
    attributes: Record<string, string>;
    ratings: {
        average: number;
        count: number;
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// ─── Category Types ───────────────────────────────────────────────────────────
export interface ICategory {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parentCategory?: ICategory | null;
}

// ─── Cart Types ───────────────────────────────────────────────────────────────
export interface ICartItem {
    product: IProduct;
    quantity: number;
    addedAt: string;
}

export interface ICart {
    _id: string;
    customer: string;
    items: ICartItem[];
}

// ─── Wishlist Types ───────────────────────────────────────────────────────────
export interface IWishlist {
    _id: string;
    customer: string;
    products: IProduct[];
}

// ─── Order Types ──────────────────────────────────────────────────────────────
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type OrderItemStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled';

export interface IOrderItem {
    product: IProduct;
    seller: IUser;
    quantity: number;
    price: number;
    status: OrderItemStatus;
}

export interface IOrder {
    _id: string;
    customer: IUser;
    items: IOrderItem[];
    shippingAddress: IShippingAddress;
    paymentId?: string;
    razorpayOrderId?: string;
    totalAmount: number;
    commissionAmount: number;
    status: OrderStatus;
    invoiceUrl?: string;
    createdAt: string;
    updatedAt: string;
}

// ─── Review Types ─────────────────────────────────────────────────────────────
export interface IReview {
    _id: string;
    product: string;
    customer: IUser;
    rating: number;
    title: string;
    body: string;
    images: string[];
    isVerifiedPurchase: boolean;
    createdAt: string;
}

// ─── API Response Types ───────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
}
