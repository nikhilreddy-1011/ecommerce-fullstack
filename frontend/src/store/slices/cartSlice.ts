import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LocalCartItem {
    productId: string;
    name: string;
    price: number;
    image: string;
    stock: number;
    quantity: number;
    seller: string;
}

interface CartState {
    items: LocalCartItem[];
    isLoading: boolean;
}

const initialState: CartState = {
    items: [],
    isLoading: false,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCart: (state, action: PayloadAction<LocalCartItem[]>) => {
            state.items = action.payload;
        },
        addItem: (state, action: PayloadAction<LocalCartItem>) => {
            const existing = state.items.find((i) => i.productId === action.payload.productId);
            if (existing) {
                existing.quantity = Math.min(existing.quantity + action.payload.quantity, existing.stock);
            } else {
                state.items.push(action.payload);
            }
        },
        removeItem: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((i) => i.productId !== action.payload);
        },
        updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
            const item = state.items.find((i) => i.productId === action.payload.productId);
            if (item) item.quantity = Math.max(1, Math.min(action.payload.quantity, item.stock));
        },
        clearCart: (state) => {
            state.items = [];
        },
        setCartLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
    },
});

export const { setCart, addItem, removeItem, updateQuantity, clearCart, setCartLoading } =
    cartSlice.actions;
export default cartSlice.reducer;
