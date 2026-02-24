'use client';

import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { setCredentials } from '@/store/slices/authSlice';
import { User, Lock, Bell, Save, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

type Tab = 'profile' | 'security';

export default function ProfilePage() {
    const dispatch = useAppDispatch();
    const { user, accessToken } = useAppSelector((s) => s.auth);

    const [tab, setTab] = useState<Tab>('profile');

    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
    });
    const [savingProfile, setSavingProfile] = useState(false);

    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [savingPw, setSavingPw] = useState(false);

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const { data } = await api.patch('/users/me', profileForm);
            dispatch(setCredentials({ user: data.data.user, accessToken: accessToken! }));
            toast.success('Profile updated!');
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(msg || 'Failed to update profile');
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setSavingPw(true);
        try {
            await api.patch('/users/me/password', {
                currentPassword: pwForm.currentPassword,
                newPassword: pwForm.newPassword,
            });
            toast.success('Password updated!');
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(msg || 'Failed to update password');
        } finally {
            setSavingPw(false);
        }
    };

    const inputCls = 'w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-600 transition-all';
    const labelCls = 'block text-xs font-medium text-gray-400 mb-1.5';

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="max-w-2xl mx-auto px-4 py-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-14 h-14 bg-indigo-600/20 border-2 border-indigo-500/30 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-300">
                        {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white">{user?.name}</h1>
                        <p className="text-gray-400 text-sm">{user?.email}</p>
                        <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full mt-1 ${user?.role === 'admin' ? 'bg-purple-900/40 text-purple-400' :
                                user?.role === 'seller' ? 'bg-blue-900/40 text-blue-400' :
                                    'bg-gray-800 text-gray-400'
                            }`}>{user?.role}</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-2xl p-1 mb-6 w-fit">
                    {([
                        { id: 'profile', icon: User, label: 'Profile' },
                        { id: 'security', icon: Lock, label: 'Security' },
                    ] as const).map(({ id, icon: Icon, label }) => (
                        <button
                            key={id}
                            onClick={() => setTab(id)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === id ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <Icon size={13} /> {label}
                        </button>
                    ))}
                </div>

                {/* ── PROFILE ── */}
                {tab === 'profile' && (
                    <form onSubmit={handleProfileSave} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                        <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                            <User size={14} className="text-indigo-400" /> Personal Information
                        </h2>

                        <div>
                            <label className={labelCls}>Full Name</label>
                            <input
                                className={inputCls}
                                value={profileForm.name}
                                onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                                placeholder="Your full name"
                            />
                        </div>

                        <div>
                            <label className={labelCls}>Email Address</label>
                            <input
                                className={`${inputCls} opacity-50 cursor-not-allowed`}
                                value={user?.email}
                                disabled
                            />
                            <p className="text-[11px] text-gray-600 mt-1">Email cannot be changed</p>
                        </div>

                        <div>
                            <label className={labelCls}>Phone Number</label>
                            <input
                                className={inputCls}
                                value={profileForm.phone}
                                onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                                placeholder="+91 XXXXX XXXXX"
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={savingProfile}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                            >
                                {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                )}

                {/* ── SECURITY ── */}
                {tab === 'security' && (
                    <form onSubmit={handlePasswordSave} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                        <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                            <Lock size={14} className="text-indigo-400" /> Change Password
                        </h2>

                        {[
                            { key: 'currentPassword', label: 'Current Password', placeholder: 'Enter current password' },
                            { key: 'newPassword', label: 'New Password', placeholder: 'Min 8 characters' },
                            { key: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Repeat new password' },
                        ].map(({ key, label, placeholder }) => (
                            <div key={key}>
                                <label className={labelCls}>{label}</label>
                                <input
                                    type="password"
                                    className={inputCls}
                                    value={pwForm[key as keyof typeof pwForm]}
                                    onChange={(e) => setPwForm((p) => ({ ...p, [key]: e.target.value }))}
                                    placeholder={placeholder}
                                    required
                                />
                            </div>
                        ))}

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={savingPw}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                            >
                                {savingPw ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                Update Password
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
