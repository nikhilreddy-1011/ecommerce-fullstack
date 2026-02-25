'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Package, ChevronRight, Clock, CheckCircle, Truck,
    XCircle, Loader2, ShoppingBag, ArrowRight
} from 'lucide-react';
import api from '@/lib/axios';
import { formatPrice } from '@/lib/utils';
import { IOrder, OrderStatus } from '@/types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: 'Pending', color: 'text-yellow-400 bg-yellow-900/20 border-yellow-700/30', icon: Clock },
    confirmed: { label: 'Confirmed', color: 'text-blue-400 bg-blue-900/20 border-blue-700/30', icon: CheckCircle },
    processing: { label: 'Processing', color: 'text-indigo-400 bg-indigo-900/20 border-indigo-700/30', icon: Package },
    shipped: { label: 'Shipped', color: 'text-purple-400 bg-purple-900/20 border-purple-700/30', icon: Truck },
    delivered: { label: 'Delivered', color: 'text-green-400 bg-green-900/20 border-green-700/30', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'text-red-400 bg-red-900/20 border-red-700/30', icon: XCircle },
};

const getProductImage = (item: IOrder['items'][0]): string => {
    if (typeof item.product === 'object' && item.product !== null) {
        const p = item.product as { images?: string[] };
        return p.images?.[0] || '';
    }
    return '';
};

const getProductName = (item: IOrder['items'][0]): string => {
    if (typeof item.product === 'object' && item.product !== null) {
        return (item.product as { name?: string }).name || 'Product';
    }
    return 'Product';
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = useCallback(async (page = 1) => {
        setIsLoading(true);
        try {
            const { data } = await api.get(`/orders/my?page=${page}&limit=10`);
            setOrders(data.data.orders);
            setMeta({ page: data.data.page, totalPages: data.data.totalPages });
        } catch (err: unknown) {
            setError((err as Error).message || 'Failed to load orders');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-indigo-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-center px-4">
                <p className="text-red-400 mb-2">{error}</p>
                <button onClick={() => fetchOrders()} className="text-indigo-400 hover:underline text-sm">Retry</button>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 text-center">
                <div className="w-20 h-20 bg-indigo-600/10 border border-indigo-500/20 rounded-full flex items-center justify-center mb-5">
                    <ShoppingBag size={32} className="text-indigo-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">No orders yet</h1>
                <p className="text-gray-400 text-sm mb-6">Your order history will appear here.</p>
                <Link
                    href="/products"
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-indigo-900/40"
                >
                    Start Shopping <ArrowRight size={16} />
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-white mb-6">My Orders</h1>

                <div className="space-y-4">
  {orders && orders.length > 0 ? (
    orders.map((order) => {
      const statusCfg =
        STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
      const StatusIcon = statusCfg.icon;

      return (
        <Link
          key={order._id}
          href={`/orders/${order._id}`}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
        >
          {/* Keep your existing inner order UI here */}
        </Link>
      );
    })
  ) : (
    <p className="text-gray-400 text-center">No orders found</p>
  )}
</div>
                                    ))}
                                    {order.items.length > 3 && (
                                        <div className="w-12 h-12 bg-gray-800 rounded-xl border-2 border-gray-900 flex items-center justify-center text-xs text-gray-400 font-semibold">
                                            +{order.items.length - 3}
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-0.5">
                                                Order #{order._id.slice(-8).toUpperCase()}
                                            </p>
                                            <p className="text-sm text-gray-300">
                                                {order.items.length} item{order.items.length !== 1 ? 's' : ''} ·{' '}
                                                <span className="text-white font-semibold">{formatPrice(order.totalAmount)}</span>
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'long', year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0 mt-1" />
                                    </div>

                                    {/* Status badge */}
                                    <div className="mt-3">
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${statusCfg.color}`}>
                                            <StatusIcon size={11} />
                                            {statusCfg.label}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Pagination */}
                {meta.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-3 mt-8">
                        <button
                            disabled={meta.page <= 1}
                            onClick={() => fetchOrders(meta.page - 1)}
                            className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl text-sm disabled:opacity-40 hover:bg-gray-700 transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-400">
                            {meta.page} / {meta.totalPages}
                        </span>
                        <button
                            disabled={meta.page >= meta.totalPages}
                            onClick={() => fetchOrders(meta.page + 1)}
                            className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl text-sm disabled:opacity-40 hover:bg-gray-700 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
