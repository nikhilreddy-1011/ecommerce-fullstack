'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Star, ShoppingCart, Heart, ChevronLeft, Share2,
    Truck, Shield, RotateCcw, Minus, Plus, Loader2
} from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { addItem } from '@/store/slices/cartSlice';
import { toggleItem } from '@/store/slices/wishlistSlice';
import { formatPrice } from '@/lib/utils';
import { IProduct, IReview } from '@/types';
import toast from 'react-hot-toast';

interface Props { params: { slug: string } }

export default function ProductDetailPage({ params }: Props) {
    const { fetchProductBySlug, isLoading } = useProducts();
    const dispatch = useAppDispatch();
    const wishlist = useAppSelector((s) => s.wishlist.items);

    const [product, setProduct] = useState<IProduct | null>(null);
    const [reviews, setReviews] = useState<IReview[]>([]);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetchProductBySlug(params.slug).then((data) => {
            if (data) {
                setProduct(data.product);
                setReviews(data.reviews || []);
            }
        });
    }, [params.slug, fetchProductBySlug]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <Loader2 size={36} className="animate-spin text-indigo-500" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-center px-4">
                <p className="text-5xl mb-4">😕</p>
                <h1 className="text-xl font-bold text-white mb-2">Product not found</h1>
                <Link href="/products" className="text-indigo-400 hover:underline text-sm">Browse all products</Link>
            </div>
        );
    }

    const isWishlisted = wishlist.includes(product._id);
    const discount = product.discountedPrice && product.price > product.discountedPrice
        ? Math.round(((product.price - product.discountedPrice) / product.price) * 100) : 0;
    const effectivePrice = product.discountedPrice || product.price;

    const handleAddToCart = () => {
        dispatch(addItem({
            productId: product._id,
            name: product.name,
            price: effectivePrice,
            image: product.images[0] || '',
            stock: product.stock,
            quantity,
            seller: typeof product.seller === 'object' ? (product.seller as { _id: string })._id : product.seller,
        }));
        toast.success(`${quantity} × ${product.name} added to cart`);
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/products" className="hover:text-white transition-colors">Products</Link>
                    <span>/</span>
                    <span className="text-gray-300 line-clamp-1">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
                    {/* ─── Image Gallery ───────────────────────────────────────────── */}
                    <div className="space-y-3">
                        {/* Main image */}
                        <div className="relative aspect-square bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
                            {product.images[selectedImage] ? (
                                <Image
                                    src={product.images[selectedImage]}
                                    alt={product.name}
                                    fill
                                    className="object-contain p-4"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-7xl">📦</div>
                            )}
                            {discount > 0 && (
                                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                                    {discount}% OFF
                                </span>
                            )}
                        </div>
                        {/* Thumbnails */}
                        {product.images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {product.images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImage(i)}
                                        className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-indigo-500' : 'border-gray-700 hover:border-gray-500'
                                            }`}
                                    >
                                        <Image src={img} alt={`View ${i + 1}`} fill className="object-cover" sizes="64px" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ─── Product Info ─────────────────────────────────────────────── */}
                    <div className="flex flex-col">
                        <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                                {typeof product.category === 'object' && (
                                    <Link
                                        href={`/products?category=${(product.category as { _id: string })._id}`}
                                        className="text-xs text-indigo-400 font-medium uppercase tracking-wider hover:text-indigo-300"
                                    >
                                        {(product.category as { name: string }).name}
                                    </Link>
                                )}
                                <h1 className="text-2xl md:text-3xl font-bold text-white mt-1">{product.name}</h1>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                <button
                                    onClick={handleShare}
                                    className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                >
                                    <Share2 size={16} />
                                </button>
                                <button
                                    onClick={() => { dispatch(toggleItem(product._id)); toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist'); }}
                                    className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center transition-colors"
                                >
                                    <Heart size={16} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
                                </button>
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                        key={s}
                                        size={16}
                                        className={s <= Math.round(product.ratings?.average || 0)
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'text-gray-700'}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-gray-400">
                                {product.ratings?.average?.toFixed(1) || '0.0'} ({product.ratings?.count || 0} reviews)
                            </span>
                        </div>

                        {/* Price */}
                        <div className="mb-5">
                            <div className="flex items-baseline gap-3">
                                <span className="text-4xl font-extrabold text-white">{formatPrice(effectivePrice)}</span>
                                {discount > 0 && (
                                    <>
                                        <span className="text-lg text-gray-500 line-through">{formatPrice(product.price)}</span>
                                        <span className="text-green-400 font-semibold text-sm">Save {formatPrice(product.price - effectivePrice)}</span>
                                    </>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
                        </div>

                        {/* Stock */}
                        <div className="mb-5">
                            {product.stock > 0 ? (
                                <span className="text-sm text-green-400 font-medium">
                                    ✓ In Stock {product.stock < 10 && `— Only ${product.stock} left!`}
                                </span>
                            ) : (
                                <span className="text-sm text-red-400 font-medium">✗ Out of Stock</span>
                            )}
                        </div>

                        {/* Attributes */}
                        {product.attributes && Object.keys(product.attributes).length > 0 && (
                            <div className="mb-5 flex flex-wrap gap-2">
                                {Object.entries(product.attributes).map(([key, val]) => (
                                    <span key={key} className="bg-gray-800 border border-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">
                                        <span className="text-gray-500 mr-1">{key}:</span>{String(val)}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Quantity + Add to Cart */}
                        {product.stock > 0 && (
                            <div className="flex gap-3 mb-6">
                                <div className="flex items-center bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="px-3 py-3 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="w-10 text-center text-white font-semibold text-sm">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        className="px-3 py-3 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-900/40 hover:shadow-indigo-900/60"
                                >
                                    <ShoppingCart size={18} /> Add to Cart
                                </button>
                            </div>
                        )}

                        {/* Trust badges */}
                        <div className="grid grid-cols-3 gap-3 border-t border-gray-800 pt-5">
                            {[
                                { icon: Truck, label: 'Free Delivery', sub: 'Orders above ₹499' },
                                { icon: Shield, label: '1 Year Warranty', sub: 'Brand guarantee' },
                                { icon: RotateCcw, label: '7-Day Returns', sub: 'Easy returns' },
                            ].map(({ icon: Icon, label, sub }) => (
                                <div key={label} className="text-center">
                                    <div className="w-10 h-10 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                                        <Icon size={18} className="text-indigo-400" />
                                    </div>
                                    <p className="text-xs font-semibold text-white">{label}</p>
                                    <p className="text-xs text-gray-500">{sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ─── Description ─────────────────────────────────────────────────── */}
                <div className="mb-12">
                    <h2 className="text-xl font-bold text-white mb-4">Product Description</h2>
                    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
                    </div>
                </div>

                {/* ─── Reviews ─────────────────────────────────────────────────────── */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">
                            Customer Reviews ({product.ratings?.count || 0})
                        </h2>
                        <div className="flex items-center gap-2">
                            <Star size={20} className="fill-amber-400 text-amber-400" />
                            <span className="text-2xl font-bold text-white">{product.ratings?.average?.toFixed(1) || '0.0'}</span>
                            <span className="text-gray-500 text-sm">/ 5</span>
                        </div>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="text-center py-12 bg-gray-900/40 border border-gray-800 rounded-2xl">
                            <p className="text-3xl mb-2">💬</p>
                            <p className="text-gray-400">No reviews yet. Be the first to review!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <div key={review._id} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-indigo-600/30 rounded-full flex items-center justify-center text-sm font-bold text-indigo-300">
                                                {typeof review.customer === 'object'
                                                    ? (review.customer as { name: string }).name.charAt(0).toUpperCase()
                                                    : 'U'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-white">
                                                    {typeof review.customer === 'object'
                                                        ? (review.customer as { name: string }).name
                                                        : 'User'}
                                                </p>
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <Star key={s} size={11} className={s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-700'} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    {review.title && <p className="text-sm font-semibold text-gray-200 mb-1">{review.title}</p>}
                                    <p className="text-sm text-gray-400">{review.body}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Back button */}
                <div className="mt-10">
                    <Link href="/products" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors w-fit">
                        <ChevronLeft size={16} /> Back to Products
                    </Link>
                </div>
            </div>
        </div>
    );
}
