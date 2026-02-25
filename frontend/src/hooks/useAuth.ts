import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setCredentials, logout as logoutAction } from '@/store/slices/authSlice';
import api from '@/lib/axios';
import { LoginCredentials, RegisterPayload, IUser } from '@/types';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

    const register = async (payload: RegisterPayload) => {
        const { data } = await api.post('/auth/register', payload);
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        dispatch(setCredentials({ user: data.user as IUser, accessToken: data.accessToken }));
        toast.success('Account created successfully!');
        router.push('/');
    };

    const login = async (credentials: LoginCredentials) => {
        const { data } = await api.post('/auth/login', credentials);
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        dispatch(setCredentials({ user: data.user as IUser, accessToken: data.accessToken }));
        toast.success(`Welcome back, ${data.user.name}!`);
        // Role-based redirect
        if (data.user.role === 'admin') router.push('/admin');
        else if (data.user.role === 'seller') router.push('/seller');
        else router.push('/');
    };

    const logout = async () => {
        try {
            await api.post('logout');
        } catch { /* ignore */ }
        dispatch(logoutAction());
        router.push('/auth/login');
        toast.success('Logged out successfully');
    };

    const sendOtp = async (phone: string) => {
        await api.post('/auth/login/otp/send', { phone });
        toast.success('OTP sent to your mobile number');
    };

    const verifyOtp = async (phone: string, otp: string, name?: string) => {
        const { data } = await api.post('/auth/login/otp/verify', { phone, otp, name });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        dispatch(setCredentials({ user: data.user as IUser, accessToken: data.accessToken }));
        toast.success('Login successful!');
        router.push('/');
    };

    const forgotPassword = async (email: string) => {
        await api.post('/auth/forgot-password', { email });
        toast.success('Check your email for the reset link');
    };

    const resetPassword = async (token: string, password: string) => {
        await api.post('/auth/reset-password', { token, password });
        toast.success('Password reset successfully. Please log in.');
        router.push('/auth/login');
    };

    return {
        user,
        isAuthenticated,
        isLoading,
        register,
        login,
        logout,
        sendOtp,
        verifyOtp,
        forgotPassword,
        resetPassword,
    };
};
