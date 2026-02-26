'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Package, ShoppingBag, TrendingUp, Loader2, Plus,
    Clock, CheckCircle, Truck, XCircle, ChevronRight,
} from 'lucide-react';
import api from '@/lib/axios';
import { formatPrice } from '@/lib/utils';
import { IOrder, OrderStatus } from '@/types';

interface SellerStats {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    recentOrders: IOrder[];
}

interface SellerProduct {
    _id: string;
    name: string;
    slug: string;
    images: string[];
    price: number;
    discountedPrice?: number;
    stock: number;
    isActive: boolean;
    ratings: { average: number; count: number };
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: 'Pending', color: 'text-yellow-400 bg-yellow-900/20 border-yellow-700/30', icon: Clock },
    confirmed: { label: 'Confirmed', color: 'text-blue-400 bg-blue-900/20 border-blue-700/30', icon: CheckCircle },
    processing: { label: 'Processing', color: 'text-indigo-400 bg-indigo-900/20 border-indigo-700/30', icon: Package },
    shipped: { label: 'Shipped', color: 'text-purple-400 bg-purple-900/20 border-purple-700/30', icon: Truck },
    delivered: { label: 'Delivered', color: 'text-green-400 bg-green-900/20 border-green-700/30', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'text-red-400 bg-red-900/20 border-red-700/30', icon: XCircle },
};

const StatCard = ({ icon: Icon, label, value, color }: {
    icon: React.ElementType; label: string; value: string | number; color: string;
}) => (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
            <Icon size={22} className="text-white" />
        </div>
        <div>
            <p className="text-gray-400 text-xs">{label}</p>
            <p className="text-xl font-bold text-white mt-0.5">{value}</p>
        </div>
    </div>
);

export default function SellerDashboard() {
    const [stats, setStats] = useState<SellerStats | null>(null);
    const [products, setProducts] = useState<SellerProduct[]>([]);
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [tab, setTab] = useState<'overview' | 'products' | 'orders'>('overview');

    const fetchAll = useCallback(async () => {
        const [statsRes, productsRes, ordersRes] = await Promise.all([
            api.get('/seller/stats'),
            api.get('/seller/products?limit=10'),
            api.get('/seller/orders?limit=10'),
        ]);
        setStats(statsRes.data.data);
        setProducts(productsRes.data.products);
        setOrders(ordersRes.data.data.orders);
    }, []);

    useEffect(() => {
        setIsLoading(true);
        fetchAll().finally(() => setIsLoading(false));
    }, [fetchAll]);

    if (isLoading) {
        return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><Loader2 size={32} className="animate-spin text-indigo-500" /></div>;
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-600/20 border border-purple-500/30 rounded-2xl flex items-center justify-center">
                            <TrendingUp size={20} className="text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Seller Dashboard</h1>
                            <p className="text-gray-500 text-sm">Manage your products and orders</p>
                        </div>
                    </div>
                    <Link
                        href="/seller/add-product"
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-lg shadow-indigo-900/40"
                    >
                        <Plus size={15} /> Add Product
                    </Link>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-2xl p-1 mb-6 w-fit">
                    {(['overview', 'products', 'orders'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${tab === t ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* ── OVERVIEW ──────────────────────────────────────── */}
                {tab === 'overview' && stats && (
                    <div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            <StatCard icon={Package} label="Active Products" value={stats.totalProducts} color="bg-indigo-600" />
                            <StatCard icon={ShoppingBag} label="Total Orders" value={stats.totalOrders} color="bg-purple-600" />
                            <StatCard icon={TrendingUp} label="Total Revenue" value={formatPrice(stats.totalRevenue)} color="bg-green-600" />
                        </div>

                        {/* Recent orders */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                                <h2 className="text-sm font-bold text-white">Recent Orders</h2>
                                <button onClick={() => setTab('orders')} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                    View all →
                                </button>
                            </div>
                            {stats.recentOrders.length === 0 ? (
                                <div className="p-8 text-center">
                                    <ShoppingBag size={28} className="text-gray-700 mx-auto mb-2" />
                                    <p className="text-gray-600 text-sm">No orders yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-800/50">
                                    {stats.recentOrders.map((order) => {
                                        const cfg = STATUS_CONFIG[order.status];
                                        const Icon = cfg.icon;
                                        return (
                                            <Link
                                                key={order._id}
                                                href={`/orders/${order._id}`}
                                                className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-800/30 transition-colors"
                                            >
                                                <div>
                                                    <p className="text-sm text-white font-medium">Order #{order._id.slice(-6).toUpperCase()}</p>
                                                    <p className="text-xs text-gray-500">{formatPrice(order.totalAmount)}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${cfg.color}`}>
                                                        <Icon size={10} /> {cfg.label}
                                                    </span>
                                                    <ChevronRight size={14} className="text-gray-600" />
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── PRODUCTS ──────────────────────────────────────── */}
                {tab === 'products' && (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-800 bg-gray-900/60">
                                        <th className="text-left px-5 py-3 text-gray-400 font-medium">Product</th>
                                        <th className="text-left px-5 py-3 text-gray-400 font-medium">Price</th>
                                        <th className="text-left px-5 py-3 text-gray-400 font-medium">Stock</th>
                                        <th className="text-left px-5 py-3 text-gray-400 font-medium">Rating</th>
                                        <th className="text-left px-5 py-3 text-gray-400 font-medium">Status</th>
                                        <th className="text-right px-5 py-3 text-gray-400 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((p) => (
                                        <tr key={p._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="relative w-9 h-9 bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
                                                        {p.images?.[0] ? (
                                                            <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="36px" />
                                                        ) : <div className="w-full h-full flex items-center justify-center text-base">📦</div>}
                                                    </div>
                                                    <p className="text-white max-w-[160px] truncate">{p.name}</p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-white">{formatPrice(p.discountedPrice || p.price)}</td>
                                            <td className="px-5 py-3">
                                                <span className={`text-xs ${p.stock === 0 ? 'text-red-400' : p.stock < 5 ? 'text-amber-400' : 'text-gray-300'}`}>
                                                    {p.stock}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-gray-300 text-xs">
                                                ⭐ {p.ratings.average.toFixed(1)} ({p.ratings.count})
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.isActive ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-500'
                                                    }`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <Link
                                                    href={`/products/${p.slug}/edit`}
                                                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                                                >
                                                    Edit
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── ORDERS ────────────────────────────────────────── */}
                {tab === 'orders' && (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-800 bg-gray-900/60">
                                        <th className="text-left px-5 py-3 text-gray-400 font-medium">Order ID</th>
                                        <th className="text-left px-5 py-3 text-gray-400 font-medium">Customer</th>
                                        <th className="text-left px-5 py-3 text-gray-400 font-medium">Amount</th>
                                        <th className="text-left px-5 py-3 text-gray-400 font-medium">Date</th>
                                        <th className="text-left px-5 py-3 text-gray-400 font-medium">Status</th>
                                        <th className="text-right px-5 py-3 text-gray-400 font-medium">View</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((o) => {
                                        const cfg = STATUS_CONFIG[o.status];
                                        const Icon = cfg.icon;
                                        return (
                                            <tr key={o._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                                <td className="px-5 py-3 text-gray-300 font-mono text-xs">#{o._id.slice(-8).toUpperCase()}</td>
                                                <td className="px-5 py-3">
                                                    {typeof o.customer === 'object' && o.customer !== null ? (
                                                        <div>
                                                            <p className="text-white text-xs">{(o.customer as { name: string }).name}</p>
                                                            <p className="text-gray-500 text-[11px]">{(o.customer as { email: string }).email}</p>
                                                        </div>
                                                    ) : <span className="text-gray-500 text-xs">—</span>}
                                                </td>
                                                <td className="px-5 py-3 text-white font-medium">{formatPrice(o.totalAmount)}</td>
                                                <td className="px-5 py-3 text-gray-500 text-xs">
                                                    {new Date(o.createdAt).toLocaleDateString('en-IN')}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${cfg.color}`}>
                                                        <Icon size={10} /> {cfg.label}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <Link href={`/orders/${o._id}`} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                                        View →
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
