'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, Store, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

type Role = 'customer' | 'seller';

export default function RegisterPage() {
    const { register } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'customer' as Role,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        setIsLoading(true);
        try {
            await register(form);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err?.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-xl mb-4 shadow-lg shadow-indigo-500/30">
                            <span className="text-2xl font-black text-white">S</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white">Create account</h1>
                        <p className="text-gray-400 text-sm mt-1">Join thousands of shoppers on ShopX</p>
                    </div>

                    {/* Role Selector */}
                    <div className="flex rounded-xl bg-gray-800/60 p-1 mb-6">
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, role: 'customer' })}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${form.role === 'customer'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <User size={15} /> Customer
                        </button>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, role: 'seller' })}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${form.role === 'seller'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <Store size={15} /> Seller
                        </button>
                    </div>

                    {form.role === 'seller' && (
                        <div className="mb-5 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                            <p className="text-amber-400 text-xs">
                                🔔 Seller accounts require admin approval before you can list products.
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="text-sm font-medium text-gray-300 block mb-1.5">Full name</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    autoComplete="name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-sm font-medium text-gray-300 block mb-1.5">Email address</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    required
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-sm font-medium text-gray-300 block mb-1.5">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                                    autoComplete="new-password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-600"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {/* Password strength indicator */}
                            <div className="flex gap-1 mt-2">
                                {[1, 2, 3, 4].map((level) => (
                                    <div
                                        key={level}
                                        className={`h-1 flex-1 rounded-full transition-all ${form.password.length >= level * 2
                                                ? form.password.length >= 8 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password)
                                                    ? 'bg-green-500'
                                                    : 'bg-amber-500'
                                                : 'bg-gray-700'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 mt-2"
                        >
                            {isLoading
                                ? <><Loader2 size={16} className="animate-spin" /> Creating account...</>
                                : form.role === 'seller' ? 'Apply as Seller' : 'Create Account'
                            }
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
