'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { toggleItem, clearWishlist } from '@/store/slices/wishlistSlice';
import { addItem } from '@/store/slices/cartSlice';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function WishlistPage() {
    const dispatch = useAppDispatch();
    const { items: wishlistIds } = useAppSelector((s) => s.wishlist);

    // NOTE: In a real app these would be fetched from /api/wishlists.
    // The Redux state holds IDs only; the wishlist page would fetch full product details.
    // For now we display a message if empty.

    if (wishlistIds.length === 0) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 text-center">
                <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6">
                    <Heart size={36} className="text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Your wishlist is empty</h1>
                <p className="text-gray-400 text-sm mb-6">
                    Save items you love so you can find them later.
                </p>
                <Link
                    href="/products"
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-indigo-900/40"
                >
                    Browse Products <ArrowRight size={16} />
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">My Wishlist</h1>
                        <p className="text-gray-400 text-sm mt-0.5">
                            {wishlistIds.length} saved item{wishlistIds.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={() => { dispatch(clearWishlist()); toast.success('Wishlist cleared'); }}
                        className="text-sm text-gray-500 hover:text-red-400 flex items-center gap-1.5 transition-colors"
                    >
                        <Trash2 size={14} /> Clear all
                    </button>
                </div>

                {/* Prompt to visit products to browse */}
                <div className="bg-indigo-950/40 border border-indigo-700/30 rounded-2xl p-6 text-center">
                    <Heart size={32} className="text-red-400 mx-auto mb-3" />
                    <p className="text-gray-300 text-sm mb-1">
                        You have <span className="text-white font-semibold">{wishlistIds.length} item{wishlistIds.length !== 1 ? 's' : ''}</span> wishlisted.
                    </p>
                    <p className="text-gray-500 text-xs mb-4">
                        Product details are fetched live. Visit the product page to see details.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link
                            href="/products"
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                        >
                            Browse Products <ArrowRight size={14} />
                        </Link>
                        <button
                            onClick={() => { dispatch(clearWishlist()); toast.success('Wishlist cleared'); }}
                            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
                        >
                            <Trash2 size={14} /> Clear Wishlist
                        </button>
                    </div>
                </div>

                {/* Saved product ID list — shown for transparency */}
                <div className="mt-6 border-t border-gray-800 pt-5">
                    <p className="text-xs text-gray-600 mb-2">Saved product IDs:</p>
                    <div className="flex flex-wrap gap-2">
                        {wishlistIds.map((id) => (
                            <span key={id} className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-lg font-mono">
                                {id}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="mt-6">
                    <Link href="/products" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                        ← Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
