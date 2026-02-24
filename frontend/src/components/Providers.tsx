'use client';

import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#1f2937',
                        color: '#f9fafb',
                        border: '1px solid #374151',
                    },
                }}
            />
            {children}
        </Provider>
    );
}
