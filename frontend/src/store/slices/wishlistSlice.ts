import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WishlistState {
    items: string[]; // stores product IDs only (lightweight)
}

const initialState: WishlistState = {
    items: [],
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        setWishlistItems: (state, action: PayloadAction<string[]>) => {
            state.items = action.payload;
        },
        toggleItem: (state, action: PayloadAction<string>) => {
            const idx = state.items.indexOf(action.payload);
            if (idx > -1) {
                state.items.splice(idx, 1);
            } else {
                state.items.push(action.payload);
            }
        },
        clearWishlist: (state) => {
            state.items = [];
        },
    },
});

export const { setWishlistItems, toggleItem, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
