'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setCredentials, setLoading } from '@/store/slices/authSlice';
import api from '@/lib/axios';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                dispatch(setLoading(false));
                router.replace('/login');
                return;
            }
            if (isAuthenticated) {
                dispatch(setLoading(false));
                return;
            }
            try {
                const { data } = await api.get('/auth/me');
                dispatch(setCredentials({ user: data.user, accessToken: token }));
            } catch {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                router.replace('/login');
            } finally {
                dispatch(setLoading(false));
            }
        };
        initAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="animate-spin text-indigo-500" />
                    <p className="text-gray-400 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    // Role-based access guard
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-6xl mb-4">🚫</p>
                    <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                    <p className="text-gray-400">You don&apos;t have permission to view this page.</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
