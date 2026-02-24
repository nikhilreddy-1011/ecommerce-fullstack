'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { removeItem, updateQuantity, clearCart } from '@/store/slices/cartSlice';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CartPage() {
    const dispatch = useAppDispatch();
    const { items } = useAppSelector((s) => s.cart);

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const deliveryFee = subtotal >= 499 ? 0 : 49;
    const total = subtotal + deliveryFee;
    const savings = items.reduce((acc, item) => {
        // No originalPrice tracking yet — show 0
        return acc;
    }, 0);

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 text-center">
                <div className="w-24 h-24 bg-indigo-600/10 border border-indigo-500/20 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag size={36} className="text-indigo-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Your cart is empty</h1>
                <p className="text-gray-400 text-sm mb-6">Add items from the store to get started.</p>
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
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Shopping Cart</h1>
                        <p className="text-gray-400 text-sm mt-0.5">
                            {items.length} item{items.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={() => { dispatch(clearCart()); toast.success('Cart cleared'); }}
                        className="text-sm text-gray-500 hover:text-red-400 flex items-center gap-1.5 transition-colors"
                    >
                        <Trash2 size={14} /> Clear all
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ── Cart Items ──────────────────────────────────────────────── */}
                    <div className="lg:col-span-2 space-y-3">
                        {items.map((item) => (
                            <div
                                key={item.productId}
                                className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex gap-4 hover:border-gray-700 transition-colors"
                            >
                                {/* Image */}
                                <Link href={`/products/${item.productId}`} className="flex-shrink-0">
                                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gray-800 rounded-xl overflow-hidden">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                                sizes="96px"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                                        )}
                                    </div>
                                </Link>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <Link
                                        href={`/products/${item.productId}`}
                                        className="text-sm font-semibold text-white hover:text-indigo-300 line-clamp-2 transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {item.stock < 5 && item.stock > 0 && (
                                            <span className="text-amber-400">Only {item.stock} left · </span>
                                        )}
                                        {item.stock === 0 && <span className="text-red-400">Out of stock · </span>}
                                        {formatPrice(item.price)} each
                                    </p>

                                    {/* Quantity + Remove */}
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                                            <button
                                                onClick={() => {
                                                    if (item.quantity <= 1) {
                                                        dispatch(removeItem(item.productId));
                                                        toast.success('Item removed');
                                                    } else {
                                                        dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }));
                                                    }
                                                }}
                                                className="px-2.5 py-1.5 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-8 text-center text-white text-sm font-semibold">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    if (item.quantity >= item.stock) {
                                                        toast.error('Max stock reached');
                                                        return;
                                                    }
                                                    dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }));
                                                }}
                                                className="px-2.5 py-1.5 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="text-base font-bold text-white">
                                                {formatPrice(item.price * item.quantity)}
                                            </span>
                                            <button
                                                onClick={() => { dispatch(removeItem(item.productId)); toast.success('Item removed'); }}
                                                className="text-gray-600 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-900/20"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Continue shopping */}
                        <Link
                            href="/products"
                            className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm transition-colors mt-4 w-fit"
                        >
                            ← Continue Shopping
                        </Link>
                    </div>

                    {/* ── Order Summary ───────────────────────────────────────────── */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sticky top-20">
                            <h2 className="text-lg font-bold text-white mb-5">Order Summary</h2>

                            {/* Delivery notice */}
                            {deliveryFee > 0 && (
                                <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl px-4 py-3 mb-4 text-xs text-amber-300 flex items-center gap-2">
                                    <Tag size={13} />
                                    Add{' '}
                                    <span className="font-bold">{formatPrice(499 - subtotal)}</span>{' '}
                                    more for FREE delivery!
                                </div>
                            )}
                            {deliveryFee === 0 && (
                                <div className="bg-green-900/20 border border-green-700/30 rounded-xl px-4 py-3 mb-4 text-xs text-green-300 flex items-center gap-2">
                                    ✓ You&apos;ve unlocked FREE delivery!
                                </div>
                            )}

                            {/* Line items */}
                            <div className="space-y-3 mb-5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">
                                        Subtotal ({items.reduce((a, i) => a + i.quantity, 0)} items)
                                    </span>
                                    <span className="text-white font-medium">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Delivery</span>
                                    <span className={deliveryFee === 0 ? 'text-green-400 font-medium' : 'text-white font-medium'}>
                                        {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                                    </span>
                                </div>
                                {savings > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-green-400">You save</span>
                                        <span className="text-green-400 font-medium">-{formatPrice(savings)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-700 pt-4 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-white font-bold">Total</span>
                                    <span className="text-xl font-extrabold text-white">{formatPrice(total)}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
                            </div>

                            <Link
                                href="/checkout"
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-900/40 hover:shadow-indigo-900/60"
                            >
                                Proceed to Checkout <ArrowRight size={16} />
                            </Link>

                            {/* Trust line */}
                            <div className="flex items-center justify-center gap-4 mt-4">
                                {['🔒 Secure', '✓ Genuine', '↩ Easy Returns'].map((t) => (
                                    <span key={t} className="text-xs text-gray-600">{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
