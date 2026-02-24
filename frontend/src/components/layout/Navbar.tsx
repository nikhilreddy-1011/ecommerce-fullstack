'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Heart, User, Menu, X, Package } from 'lucide-react';
import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { logout } from '@/store/slices/authSlice';
import { clearCart } from '@/store/slices/cartSlice';
import { clearWishlist } from '@/store/slices/wishlistSlice';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const NAV_LINKS = [
    { href: '/products', label: 'Products' },
    { href: '/orders', label: 'My Orders', auth: true },
];

export default function Navbar() {
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const { user, isAuthenticated } = useAppSelector((s) => s.auth);
    const cartCount = useAppSelector((s) => s.cart.items.reduce((a, i) => a + i.quantity, 0));
    const wishlistCount = useAppSelector((s) => s.wishlist.items.length);

    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch { /* ignore */ }
        dispatch(logout());
        dispatch(clearCart());
        dispatch(clearWishlist());
        setUserMenuOpen(false);
        toast.success('Logged out');
    };

    return (
        <nav className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-900/50">
                        <Package size={16} className="text-white" />
                    </div>
                    <span className="text-base font-bold text-white hidden sm:block">
                        Nikhil <span className="text-indigo-400">Store</span>
                    </span>
                </Link>

                {/* Desktop nav links */}
                <div className="hidden md:flex items-center gap-1">
                    {NAV_LINKS.filter((l) => !l.auth || isAuthenticated).map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${pathname.startsWith(link.href)
                                    ? 'bg-indigo-600/20 text-indigo-300'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Right icons */}
                <div className="flex items-center gap-2">
                    {/* Wishlist */}
                    <Link
                        href="/wishlist"
                        className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                        <Heart size={18} />
                        {wishlistCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                                {wishlistCount > 9 ? '9+' : wishlistCount}
                            </span>
                        )}
                    </Link>

                    {/* Cart */}
                    <Link
                        href="/cart"
                        className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                        <ShoppingCart size={18} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                                {cartCount > 9 ? '9+' : cartCount}
                            </span>
                        )}
                    </Link>

                    {/* User menu */}
                    {isAuthenticated ? (
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="w-9 h-9 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-300 hover:bg-indigo-600/30 transition-colors"
                            >
                                <span className="text-xs font-bold">{user?.name.charAt(0).toUpperCase()}</span>
                            </button>
                            {userMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                                    <div className="absolute right-0 top-11 w-44 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl shadow-black/50 z-20 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-gray-800">
                                            <p className="text-xs font-semibold text-white line-clamp-1">{user?.name}</p>
                                            <p className="text-xs text-gray-500 line-clamp-1">{user?.email}</p>
                                        </div>
                                        <div className="py-1">
                                            <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">Profile</Link>
                                            <Link href="/orders" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">My Orders</Link>
                                            {user?.role === 'admin' && (
                                                <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">Admin Panel</Link>
                                            )}
                                            {user?.role === 'seller' && (
                                                <Link href="/seller" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">Seller Dashboard</Link>
                                            )}
                                            <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors">
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <Link
                            href="/auth/login"
                            className="hidden sm:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-3.5 py-2 rounded-xl transition-colors shadow-md shadow-indigo-900/40"
                        >
                            <User size={14} /> Sign In
                        </Link>
                    )}

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </div>

            {/* Mobile nav drawer */}
            {mobileOpen && (
                <div className="md:hidden border-t border-gray-800 bg-gray-900 px-4 py-3 space-y-1">
                    {NAV_LINKS.filter((l) => !l.auth || isAuthenticated).map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname.startsWith(link.href)
                                    ? 'bg-indigo-600/20 text-indigo-300'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    {!isAuthenticated && (
                        <Link
                            href="/auth/login"
                            onClick={() => setMobileOpen(false)}
                            className="block px-4 py-2.5 rounded-xl text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:bg-gray-800 transition-colors"
                        >
                            Sign In
                        </Link>
                    )}
                    {isAuthenticated && (
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-900/20 transition-colors"
                        >
                            Sign Out
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
}
