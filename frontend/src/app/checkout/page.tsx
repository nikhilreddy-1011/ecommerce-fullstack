'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, CreditCard, ShoppingBag, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { clearCart } from '@/store/slices/cartSlice';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface ShippingForm {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
}

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Razorpay: new (options: Record<string, unknown>) => { open: () => void };
    }
}

export default function CheckoutPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { items } = useAppSelector((s) => s.cart);
    const { user } = useAppSelector((s) => s.auth);

    const [form, setForm] = useState<ShippingForm>({
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
    });
    const [step, setStep] = useState<'address' | 'payment' | 'success'>('address');
    const [isLoading, setIsLoading] = useState(false);

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const delivery = subtotal >= 499 ? 0 : 49;
    const total = subtotal + delivery;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const loadRazorpayScript = (): Promise<boolean> =>
        new Promise((resolve) => {
            if (document.querySelector('script[src*="razorpay"]')) { resolve(true); return; }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });

    const handlePlaceOrder = async () => {
        if (!form.street || !form.city || !form.state || !form.pincode) {
            toast.error('Please fill all address fields');
            return;
        }
        setIsLoading(true);

        try {
            const loaded = await loadRazorpayScript();
            if (!loaded) { toast.error('Razorpay failed to load. Check your connection.'); return; }

            // Create Razorpay order on backend
            const { data } = await api.post('/orders/create', { shippingAddress: form });
            const { orderId, razorpayOrderId, amount, currency, key } = data.data;

            const options = {
                key,
                amount,
                currency,
                name: 'Nikhil E-Commerce',
                description: 'Order Payment',
                order_id: razorpayOrderId,
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: user?.phone || '',
                },
                theme: { color: '#6366f1' },
                handler: async (response: {
                    razorpay_order_id: string;
                    razorpay_payment_id: string;
                    razorpay_signature: string;
                }) => {
                    try {
                        await api.post('/orders/verify', {
                            orderId,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        });
                        dispatch(clearCart());
                        setStep('success');
                        toast.success('Payment successful! 🎉');
                    } catch {
                        toast.error('Payment verification failed. Contact support.');
                    }
                },
                modal: {
                    ondismiss: () => {
                        setIsLoading(false);
                        toast.error('Payment cancelled');
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err: unknown) {
            toast.error((err as Error).message || 'Failed to initiate payment');
        } finally {
            setIsLoading(false);
        }
    };

    if (items.length === 0 && step !== 'success') {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 text-center">
                <ShoppingBag size={48} className="text-gray-600 mb-4" />
                <h1 className="text-xl font-bold text-white mb-2">Nothing to checkout</h1>
                <Link href="/products" className="text-indigo-400 hover:underline text-sm">Browse products</Link>
            </div>
        );
    }

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 text-center">
                <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle size={36} className="text-green-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Order Placed! 🎉</h1>
                <p className="text-gray-400 text-sm mb-2">Thank you for your purchase, {user?.name}.</p>
                <p className="text-gray-500 text-xs mb-8">You&apos;ll receive a confirmation email shortly.</p>
                <div className="flex gap-3 flex-wrap justify-center">
                    <Link
                        href="/orders"
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-900/40"
                    >
                        View My Orders
                    </Link>
                    <Link
                        href="/products"
                        className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/cart" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-4 w-fit transition-colors">
                        <ArrowLeft size={15} /> Back to Cart
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Checkout</h1>

                    {/* Steps */}
                    <div className="flex items-center gap-3 mt-4">
                        {(['address', 'payment'] as const).map((s, i) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === s ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-500'
                                    }`}>
                                    {i + 1}
                                </div>
                                <span className={`text-sm capitalize ${step === s ? 'text-white' : 'text-gray-500'}`}>{s}</span>
                                {i < 1 && <div className="w-8 h-px bg-gray-800 mx-1" />}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ── Left — Address Form ─────────────────────────────────── */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-5">
                                <MapPin size={18} className="text-indigo-400" />
                                <h2 className="text-base font-bold text-white">Shipping Address</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1.5 block">Street Address *</label>
                                    <input
                                        name="street"
                                        value={form.street}
                                        onChange={handleChange}
                                        placeholder="123 Main Street, Apartment 4B"
                                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-600"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1.5 block">City *</label>
                                        <input
                                            name="city"
                                            value={form.city}
                                            onChange={handleChange}
                                            placeholder="Hyderabad"
                                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1.5 block">State *</label>
                                        <input
                                            name="state"
                                            value={form.state}
                                            onChange={handleChange}
                                            placeholder="Telangana"
                                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-600"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1.5 block">Pincode *</label>
                                        <input
                                            name="pincode"
                                            value={form.pincode}
                                            onChange={handleChange}
                                            placeholder="500001"
                                            maxLength={6}
                                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1.5 block">Country</label>
                                        <select
                                            name="country"
                                            value={form.country}
                                            onChange={handleChange}
                                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="India">India</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment info */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mt-4 flex items-center gap-3">
                            <div className="w-9 h-9 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center">
                                <CreditCard size={16} className="text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">Secure Payment via Razorpay</p>
                                <p className="text-xs text-gray-500">UPI, Cards, Net Banking, Wallets accepted</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Right — Order Summary ───────────────────────────────── */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sticky top-20">
                            <h2 className="text-base font-bold text-white mb-4">Order Summary</h2>

                            {/* Items */}
                            <div className="space-y-2.5 mb-4 max-h-52 overflow-y-auto pr-1">
                                {items.map((item) => (
                                    <div key={item.productId} className="flex justify-between items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-300 line-clamp-1">{item.name}</p>
                                            <p className="text-xs text-gray-600">× {item.quantity}</p>
                                        </div>
                                        <span className="text-xs text-white font-medium flex-shrink-0">
                                            {formatPrice(item.price * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-800 pt-3 space-y-2 mb-4">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Subtotal</span>
                                    <span className="text-white">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Delivery</span>
                                    <span className={delivery === 0 ? 'text-green-400' : 'text-white'}>
                                        {delivery === 0 ? 'FREE' : formatPrice(delivery)}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-gray-700 pt-3 mb-5">
                                <div className="flex justify-between">
                                    <span className="text-white font-bold">Total</span>
                                    <span className="text-xl font-extrabold text-white">{formatPrice(total)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-900/40"
                            >
                                {isLoading ? (
                                    <><Loader2 size={16} className="animate-spin" /> Processing...</>
                                ) : (
                                    <><CreditCard size={16} /> Pay {formatPrice(total)}</>
                                )}
                            </button>

                            <p className="text-xs text-center text-gray-600 mt-3">
                                🔒 Secured by Razorpay
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
