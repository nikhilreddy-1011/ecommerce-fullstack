'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { IProduct } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { addItem } from '@/store/slices/cartSlice';
import { toggleItem } from '@/store/slices/wishlistSlice';
import toast from 'react-hot-toast';

interface ProductCardProps {
    product: IProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
    const dispatch = useAppDispatch();
    const wishlist = useAppSelector((s) => s.wishlist.items);
    const isWishlisted = wishlist.some((id) => id === product._id);

    const discount =
        product.discountedPrice && product.price > product.discountedPrice
            ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
            : 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        dispatch(
            addItem({
                productId: product._id,
                name: product.name,
                price: product.discountedPrice || product.price,
                image: product.images[0] || '',
                stock: product.stock,
                quantity: 1,
                seller: typeof product.seller === 'object' ? (product.seller as { _id: string })._id : product.seller,
            })
        );
        toast.success('Added to cart');
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        dispatch(toggleItem(product._id));
        toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    };

    return (
        <Link href={`/products/${product.slug}`} className="group block">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-900/20 transition-all duration-300">
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-800">
                    {product.images[0] ? (
                        <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-5xl">📦</div>
                    )}
                    {discount > 0 && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {discount}% OFF
                        </span>
                    )}
                    {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">Out of Stock</span>
                        </div>
                    )}
                    {/* Wishlist button */}
                    <button
                        onClick={handleWishlist}
                        className="absolute top-2 right-2 w-8 h-8 bg-gray-900/80 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-800"
                    >
                        <Heart
                            size={15}
                            className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-300'}
                        />
                    </button>
                </div>

                {/* Info */}
                <div className="p-4">
                    <p className="text-xs text-indigo-400 font-medium mb-1 uppercase tracking-wider">
                        {typeof product.category === 'object'
                            ? (product.category as { name: string }).name
                            : 'Uncategorized'}
                    </p>
                    <h3 className="text-sm font-semibold text-white line-clamp-2 mb-2 group-hover:text-indigo-300 transition-colors">
                        {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span className="text-xs text-gray-400">
                            {product.ratings?.average?.toFixed(1) || '0.0'}{' '}
                            <span className="text-gray-600">({product.ratings?.count || 0})</span>
                        </span>
                    </div>

                    {/* Price + Cart */}
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-lg font-bold text-white">
                                {formatPrice(product.discountedPrice || product.price)}
                            </span>
                            {discount > 0 && (
                                <span className="text-xs text-gray-500 line-through ml-2">
                                    {formatPrice(product.price)}
                                </span>
                            )}
                        </div>
                        {product.stock > 0 && (
                            <button
                                onClick={handleAddToCart}
                                className="w-9 h-9 bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center justify-center transition-colors shadow-md shadow-indigo-900/40"
                            >
                                <ShoppingCart size={16} className="text-white" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
