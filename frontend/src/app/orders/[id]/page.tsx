'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MapPin, Package, Clock, CheckCircle, Truck, XCircle, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import { formatPrice } from '@/lib/utils';
import { IOrder, OrderStatus } from '@/types';

interface Props { params: { id: string } }

const STATUS_STEPS: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: 'Pending', color: 'text-yellow-400', icon: Clock },
    confirmed: { label: 'Confirmed', color: 'text-blue-400', icon: CheckCircle },
    processing: { label: 'Processing', color: 'text-indigo-400', icon: Package },
    shipped: { label: 'Shipped', color: 'text-purple-400', icon: Truck },
    delivered: { label: 'Delivered', color: 'text-green-400', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'text-red-400', icon: XCircle },
};

const getProductImage = (product: unknown): string => {
    if (typeof product === 'object' && product !== null) {
        return ((product as { images?: string[] }).images?.[0]) || '';
    }
    return '';
};
const getProductName = (product: unknown): string => {
    if (typeof product === 'object' && product !== null) {
        return (product as { name?: string }).name || 'Product';
    }
    return 'Product';
};
const getProductSlug = (product: unknown): string => {
    if (typeof product === 'object' && product !== null) {
        return (product as { slug?: string }).slug || '';
    }
    return '';
};

export default function OrderDetailPage({ params }: Props) {
    const [order, setOrder] = useState<IOrder | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrder = useCallback(async () => {
        try {
            const { data } = await api.get(`/orders/${params.id}`);
            setOrder(data.data.order);
        } catch {
            setOrder(null);
        } finally {
            setIsLoading(false);
        }
    }, [params.id]);

    useEffect(() => { fetchOrder(); }, [fetchOrder]);

    if (isLoading) {
        return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><Loader2 size={32} className="animate-spin text-indigo-500" /></div>;
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-center px-4">
                <p className="text-xl font-bold text-white mb-2">Order not found</p>
                <Link href="/orders" className="text-indigo-400 hover:underline text-sm">← Back to orders</Link>
            </div>
        );
    }

    const statusCfg = STATUS_CONFIG[order.status];
    const StatusIcon = statusCfg.icon;
    const currentStepIdx = STATUS_STEPS.indexOf(order.status);

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <Link href="/orders" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 w-fit transition-colors">
                    <ArrowLeft size={14} /> My Orders
                </Link>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-white">
                            Order #{order._id.slice(-8).toUpperCase()}
                        </h1>
                        <p className="text-gray-500 text-sm mt-0.5">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'long', year: 'numeric'
                            })}
                        </p>
                    </div>
                    <span className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-1.5 rounded-full border ${order.status === 'delivered' ? 'border-green-700/30 bg-green-900/20 text-green-400' :
                            order.status === 'cancelled' ? 'border-red-700/30 bg-red-900/20 text-red-400' :
                                order.status === 'shipped' ? 'border-purple-700/30 bg-purple-900/20 text-purple-400' :
                                    'border-indigo-700/30 bg-indigo-900/20 text-indigo-400'
                        }`}>
                        <StatusIcon size={14} /> {statusCfg.label}
                    </span>
                </div>

                {/* Progress tracker (hide for cancelled) */}
                {order.status !== 'cancelled' && (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-5">
                        <div className="flex items-center justify-between relative">
                            {/* Progress bar */}
                            <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-800 z-0">
                                <div
                                    className="h-full bg-indigo-600 transition-all duration-500"
                                    style={{ width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
                                />
                            </div>
                            {STATUS_STEPS.map((step, i) => {
                                const cfg = STATUS_CONFIG[step];
                                const Icon = cfg.icon;
                                const done = i <= currentStepIdx;
                                return (
                                    <div key={step} className="relative z-10 flex flex-col items-center gap-1.5">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${done ? 'bg-indigo-600 border-indigo-500' : 'bg-gray-800 border-gray-700'
                                            }`}>
                                            <Icon size={14} className={done ? 'text-white' : 'text-gray-600'} />
                                        </div>
                                        <span className={`text-xs hidden sm:block ${done ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {cfg.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Items */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                        <h2 className="text-sm font-bold text-white mb-4">Items Ordered</h2>
                        <div className="space-y-3">
                            {order.items.map((item, i) => {
                                const imgSrc = getProductImage(item.product);
                                const name = getProductName(item.product);
                                const slug = getProductSlug(item.product);
                                return (
                                    <div key={i} className="flex gap-3 items-center">
                                        <div className="relative w-12 h-12 bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
                                            {imgSrc ? (
                                                <Image src={imgSrc} alt={name} fill className="object-cover" sizes="48px" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {slug ? (
                                                <Link href={`/products/${slug}`} className="text-sm text-white hover:text-indigo-300 line-clamp-1 transition-colors">
                                                    {name}
                                                </Link>
                                            ) : (
                                                <p className="text-sm text-white line-clamp-1">{name}</p>
                                            )}
                                            <p className="text-xs text-gray-500">× {item.quantity}</p>
                                        </div>
                                        <span className="text-sm font-semibold text-white flex-shrink-0">
                                            {formatPrice(item.price * item.quantity)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Order summary + address */}
                    <div className="space-y-4">
                        {/* Summary */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                            <h2 className="text-sm font-bold text-white mb-3">Payment Summary</h2>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Items total</span>
                                    <span className="text-white">{formatPrice(order.items.reduce((a, i) => a + i.price * i.quantity, 0))}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Delivery</span>
                                    <span className="text-green-400">FREE</span>
                                </div>
                                <div className="border-t border-gray-800 pt-2 flex justify-between">
                                    <span className="font-bold text-white">Total Paid</span>
                                    <span className="font-extrabold text-white text-lg">{formatPrice(order.totalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Shipping address */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                <MapPin size={14} className="text-indigo-400" /> Shipping Address
                            </h2>
                            <p className="text-sm text-gray-300">{order.shippingAddress.street}</p>
                            <p className="text-sm text-gray-400">
                                {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}
                            </p>
                            <p className="text-sm text-gray-400">{order.shippingAddress.country}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
