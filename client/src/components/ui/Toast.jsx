/**
 * Toast Context & Provider
 * 
 * Global toast notification system.
 */
import { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext({});

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const toastVariants = {
    success: {
        container: 'bg-secondary-50 border-secondary-200',
        icon: 'text-secondary-500',
        IconComponent: CheckCircle,
    },
    error: {
        container: 'bg-danger-50 border-danger-200',
        icon: 'text-danger-500',
        IconComponent: AlertCircle,
    },
    warning: {
        container: 'bg-warning-50 border-warning-100',
        icon: 'text-warning-500',
        IconComponent: AlertTriangle,
    },
    info: {
        container: 'bg-blue-50 border-blue-200',
        icon: 'text-blue-500',
        IconComponent: Info,
    },
};

const Toast = ({ id, message, variant = 'info', onClose }) => {
    const styles = toastVariants[variant];
    const Icon = styles.IconComponent;

    return (
        <div
            className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-slide-down',
                'min-w-[300px] max-w-md',
                styles.container
            )}
        >
            <Icon className={cn('w-5 h-5 flex-shrink-0', styles.icon)} />
            <p className="flex-1 text-sm font-medium text-gray-800">{message}</p>
            <button
                onClick={() => onClose(id)}
                className="p-1 rounded hover:bg-black/5 transition-colors text-gray-500"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, variant = 'info', duration = 5000) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, variant }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const toast = {
        success: (message, duration) => addToast(message, 'success', duration),
        error: (message, duration) => addToast(message, 'error', duration),
        warning: (message, duration) => addToast(message, 'warning', duration),
        info: (message, duration) => addToast(message, 'info', duration),
    };

    return (
        <ToastContext.Provider value={{ toast, addToast, removeToast }}>
            {children}
            {createPortal(
                <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
                    {toasts.map((t) => (
                        <Toast key={t.id} {...t} onClose={removeToast} />
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};

export default ToastProvider;
