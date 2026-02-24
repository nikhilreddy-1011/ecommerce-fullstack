'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, Smartphone, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

type LoginMode = 'email' | 'otp';

export default function LoginPage() {
    const { login, sendOtp, verifyOtp } = useAuth();

    const [mode, setMode] = useState<LoginMode>('email');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    // Email form
    const [emailForm, setEmailForm] = useState({ email: '', password: '' });
    // OTP form
    const [otpForm, setOtpForm] = useState({ phone: '', otp: '' });

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(emailForm);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err?.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otpForm.phone || otpForm.phone.length !== 10) {
            toast.error('Enter a valid 10-digit mobile number');
            return;
        }
        setIsLoading(true);
        try {
            await sendOtp(otpForm.phone);
            setOtpSent(true);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err?.response?.data?.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await verifyOtp(otpForm.phone, otpForm.otp);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err?.response?.data?.message || 'Invalid OTP');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            {/* Background gradient blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
                    {/* Logo / Brand */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-xl mb-4 shadow-lg shadow-indigo-500/30">
                            <span className="text-2xl font-black text-white">S</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
                        <p className="text-gray-400 text-sm mt-1">Sign in to your ShopX account</p>
                    </div>

                    {/* Mode toggle */}
                    <div className="flex rounded-xl bg-gray-800/60 p-1 mb-6">
                        <button
                            onClick={() => { setMode('email'); setOtpSent(false); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'email'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <Mail size={15} /> Email
                        </button>
                        <button
                            onClick={() => { setMode('otp'); setOtpSent(false); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'otp'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <Smartphone size={15} /> Phone OTP
                        </button>
                    </div>

                    {/* Email Login Form */}
                    {mode === 'email' && (
                        <form onSubmit={handleEmailLogin} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-300 block mb-1.5">Email address</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        value={emailForm.email}
                                        onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                                        required
                                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-600"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="text-sm font-medium text-gray-300">Password</label>
                                    <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        value={emailForm.password}
                                        onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
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
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 mt-2"
                            >
                                {isLoading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign In'}
                            </button>
                        </form>
                    )}

                    {/* OTP Login Form */}
                    {mode === 'otp' && (
                        <div className="space-y-4">
                            {!otpSent ? (
                                <form onSubmit={handleSendOtp} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-300 block mb-1.5">Mobile number</label>
                                        <div className="flex gap-2">
                                            <span className="flex items-center justify-center bg-gray-800 border border-gray-700 text-gray-400 rounded-xl px-3 text-sm font-medium">+91</span>
                                            <input
                                                type="tel"
                                                placeholder="9876543210"
                                                maxLength={10}
                                                value={otpForm.phone}
                                                onChange={(e) => setOtpForm({ ...otpForm, phone: e.target.value.replace(/\D/g, '') })}
                                                required
                                                className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-600"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-500/25"
                                    >
                                        {isLoading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : 'Send OTP'}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOtp} className="space-y-4">
                                    <p className="text-sm text-gray-400 text-center">
                                        OTP sent to <span className="text-white font-medium">+91 {otpForm.phone}</span>
                                    </p>
                                    <div>
                                        <label className="text-sm font-medium text-gray-300 block mb-1.5">Enter OTP</label>
                                        <input
                                            type="text"
                                            placeholder="6-digit OTP"
                                            maxLength={6}
                                            value={otpForm.otp}
                                            onChange={(e) => setOtpForm({ ...otpForm, otp: e.target.value.replace(/\D/g, '') })}
                                            required
                                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-600 placeholder:text-sm placeholder:font-sans placeholder:tracking-normal"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-500/25"
                                    >
                                        {isLoading ? <><Loader2 size={16} className="animate-spin" /> Verifying...</> : 'Verify & Login'}
                                    </button>
                                    <button type="button" onClick={() => setOtpSent(false)} className="w-full text-gray-500 hover:text-gray-300 text-sm transition-colors">
                                        Change number
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* Divider + Register link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                                Create one
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
