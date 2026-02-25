'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    Users, Package, ShoppingBag, DollarSign, Shield,
    Check, Ban, ToggleLeft, ToggleRight, Loader2, Search,
} from 'lucide-react';
import api from '@/lib/axios';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';

interface DashStats {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    pendingSellers: number;
}

interface AdminUser {
    _id: string;
    name: string;
    email: string;
    role: string;
    isApproved: boolean;
    isBlocked: boolean;
    createdAt: string;
}

interface AdminProduct {
    _id: string;
    name: string;
    images: string[];
    price: number;
    stock: number;
    isActive: boolean;
    seller: { name: string; email: string };
    category: { name: string };
}

type Tab = 'overview' | 'users' | 'products';

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

export default function AdminDashboard() {
    const [tab, setTab] = useState<Tab>('overview');
    const [stats, setStats] = useState<DashStats | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        const { data } = await api.get('/admin/stats');
        setStats(data.data);
    }, []);

    const fetchUsers = useCallback(async () => {
        const s = search ? `&search=${encodeURIComponent(search)}` : '';
        const { data } = await api.get(`/admin/users?limit=20${s}`);
        setUsers(data.users);
    }, [search]);

    const fetchProducts = useCallback(async () => {
        const { data } = await api.get('/admin/products?limit=20');
        setProducts(data.data.products);
    }, []);

    useEffect(() => {
        setIsLoading(true);
        Promise.all([fetchStats(), fetchUsers(), fetchProducts()]).finally(() => setIsLoading(false));
    }, [fetchStats, fetchUsers, fetchProducts]);

    const handleApproveSeller = async (id: string) => {
        await api.patch(`/admin/users/${id}/approve`);
        setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isApproved: true } : u));
    };

    const handleToggleBlock = async (id: string) => {
        await api.patch(`/admin/users/${id}/block`);
        setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isBlocked: !u.isBlocked } : u));
    };

    const handleToggleProduct = async (id: string) => {
        await api.patch(`/admin/products/${id}/toggle`);
        setProducts((prev) => prev.map((p) => p._id === id ? { ...p, isActive: !p.isActive } : p));
    };

    if (isLoading) {
        return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><Loader2 size={32} className="animate-spin text-indigo-500" /></div>;
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center">
                        <Shield size={20} className="text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                        <p className="text-gray-500 text-sm">Manage users, products & orders</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-2xl p-1 mb-6 w-fit">
                    {(['overview', 'users', 'products'] as Tab[]).map((t) => (
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

                {/* ── OVERVIEW ─────────────────────────────────────────────────────── */}
                {tab === 'overview' && stats && (
                    <div>
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                            <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="bg-blue-600" />
                            <StatCard icon={Package} label="Active Products" value={stats.totalProducts} color="bg-purple-600" />
                            <StatCard icon={ShoppingBag} label="Total Orders" value={stats.totalOrders} color="bg-green-600" />
                            <StatCard icon={DollarSign} label="Revenue" value={formatPrice(stats.totalRevenue)} color="bg-yellow-600" />
                            <StatCard icon={Shield} label="Pending Sellers" value={stats.pendingSellers} color="bg-red-600" />
                        </div>

                        {/* Pending sellers quick action */}
                        {stats.pendingSellers > 0 && (
                            <div className="bg-amber-900/20 border border-amber-700/30 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
                                <p className="text-amber-300 text-sm">
                                    <span className="font-bold">{stats.pendingSellers}</span> seller{stats.pendingSellers > 1 ? 's' : ''} awaiting approval
                                </p>
                                <button
                                    onClick={() => setTab('users')}
                                    className="text-xs bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-xl transition-colors"
                                >
                                    Review
                                </button>
                            </div>
                        )}

                        {/* Quick stats table of top sellers will be shown in users tab */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                            <p className="text-sm font-semibold text-white mb-3">Quick Actions</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {[
                                    { label: 'Manage Users', fn: () => setTab('users') },
                                    { label: 'Manage Products', fn: () => setTab('products') },
                                ].map(({ label, fn }) => (
                                    <button
                                        key={label}
                                        onClick={fn}
                                        className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-xl transition-colors"
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── USERS ────────────────────────────────────────────────────────── */}
                {tab === 'users' && (
                    <div>
                        <div className="flex gap-3 mb-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search users…"
                                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-600"
                                />
                            </div>
                        </div>
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-800 bg-gray-900/60">
                                            <th className="text-left px-5 py-3 text-gray-400 font-medium">User</th>
                                            <th className="text-left px-5 py-3 text-gray-400 font-medium">Role</th>
                                            <th className="text-left px-5 py-3 text-gray-400 font-medium">Status</th>
                                            <th className="text-left px-5 py-3 text-gray-400 font-medium">Joined</th>
                                            <th className="text-right px-5 py-3 text-gray-400 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 bg-indigo-600/20 border border-indigo-500/20 rounded-full flex items-center justify-center text-indigo-300 text-xs font-bold">
                                                            {u.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-medium">{u.name}</p>
                                                            <p className="text-gray-500 text-xs">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.role === 'admin' ? 'bg-purple-900/30 text-purple-400' :
                                                            u.role === 'seller' ? 'bg-blue-900/30 text-blue-400' :
                                                                'bg-gray-800 text-gray-400'
                                                        }`}>{u.role}</span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    {u.isBlocked ? (
                                                        <span className="text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded-full">Blocked</span>
                                                    ) : u.role === 'seller' && !u.isApproved ? (
                                                        <span className="text-xs text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded-full">Pending</span>
                                                    ) : (
                                                        <span className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded-full">Active</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3 text-gray-500 text-xs">
                                                    {new Date(u.createdAt).toLocaleDateString('en-IN')}
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {u.role === 'seller' && !u.isApproved && (
                                                            <button
                                                                onClick={() => handleApproveSeller(u._id)}
                                                                className="text-xs flex items-center gap-1 bg-green-900/30 text-green-400 hover:bg-green-900/50 px-2.5 py-1.5 rounded-lg transition-colors"
                                                            >
                                                                <Check size={11} /> Approve
                                                            </button>
                                                        )}
                                                        {u.role !== 'admin' && (
                                                            <button
                                                                onClick={() => handleToggleBlock(u._id)}
                                                                className={`text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors ${u.isBlocked
                                                                        ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50'
                                                                        : 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                                                                    }`}
                                                            >
                                                                {u.isBlocked ? <><ToggleRight size={11} /> Unblock</> : <><Ban size={11} /> Block</>}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── PRODUCTS ─────────────────────────────────────────────────────── */}
                {tab === 'products' && (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-800 bg-gray-900/60">
                                        <th className="text-left px-5 py-3 text-gray-400 font-medium">Product</th>
                                        <th className="text-left px-5 py-3 text-gray-400 font-medium">Seller</th>
                                        <th className="text-left px-5 py-3 text-gray-400 font-medium">Price</th>
                                        <th className="text-left px-5 py-3 text-gray-400 font-medium">Stock</th>
                                        <th className="text-left px-5 py-3 text-gray-400 font-medium">Status</th>
                                        <th className="text-right px-5 py-3 text-gray-400 font-medium">Action</th>
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
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-base">📦</div>
                                                        )}
                                                    </div>
                                                    <p className="text-white max-w-[180px] truncate">{p.name}</p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-gray-400 text-xs">{p.seller?.name}</td>
                                            <td className="px-5 py-3 text-white">{formatPrice(p.price)}</td>
                                            <td className="px-5 py-3">
                                                <span className={`text-xs ${p.stock < 5 ? 'text-red-400' : 'text-gray-300'}`}>{p.stock}</span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.isActive ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-500'
                                                    }`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <button
                                                    onClick={() => handleToggleProduct(p._id)}
                                                    className={`text-xs flex items-center gap-1 ml-auto px-2.5 py-1.5 rounded-lg transition-colors ${p.isActive
                                                            ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                                                            : 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                                                        }`}
                                                >
                                                    {p.isActive ? <><ToggleLeft size={11} /> Deactivate</> : <><ToggleRight size={11} /> Activate</>}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
