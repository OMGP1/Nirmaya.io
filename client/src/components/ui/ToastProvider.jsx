/**
 * Toast Provider Component
 * 
 * Provides beautiful toast notifications throughout the app.
 * Uses react-hot-toast for smooth, customizable notifications.
 */
import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            gutter={8}
            containerClassName=""
            containerStyle={{}}
            toastOptions={{
                // Default options for all toasts
                duration: 4000,
                style: {
                    background: '#fff',
                    color: '#363636',
                    padding: '16px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
                    fontSize: '14px',
                    fontWeight: '500',
                },
                // Custom styles for different toast types
                success: {
                    duration: 3000,
                    style: {
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        color: '#fff',
                    },
                    iconTheme: {
                        primary: '#fff',
                        secondary: '#10B981',
                    },
                },
                error: {
                    duration: 5000,
                    style: {
                        background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                        color: '#fff',
                    },
                    iconTheme: {
                        primary: '#fff',
                        secondary: '#EF4444',
                    },
                },
                loading: {
                    style: {
                        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                        color: '#fff',
                    },
                },
            }}
        />
    );
}
