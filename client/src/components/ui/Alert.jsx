/**
 * Alert Component
 * 
 * Static alerts for messages (not ephemeral like toasts).
 */
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

const alertVariants = {
    success: {
        container: 'bg-secondary-50 border-secondary-200',
        icon: 'text-secondary-500',
        title: 'text-secondary-800',
        message: 'text-secondary-700',
    },
    error: {
        container: 'bg-danger-50 border-danger-200',
        icon: 'text-danger-500',
        title: 'text-danger-800',
        message: 'text-danger-700',
    },
    warning: {
        container: 'bg-warning-50 border-warning-100',
        icon: 'text-warning-500',
        title: 'text-warning-800',
        message: 'text-warning-700',
    },
    info: {
        container: 'bg-blue-50 border-blue-200',
        icon: 'text-blue-500',
        title: 'text-blue-800',
        message: 'text-blue-700',
    },
};

const alertIcons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

const Alert = ({
    variant = 'info',
    title,
    children,
    onClose,
    className,
    ...props
}) => {
    const styles = alertVariants[variant];
    const Icon = alertIcons[variant];

    return (
        <div
            role="alert"
            className={cn(
                'flex gap-3 p-4 rounded-lg border',
                styles.container,
                className
            )}
            {...props}
        >
            <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', styles.icon)} />

            <div className="flex-1 min-w-0">
                {title && (
                    <h4 className={cn('font-semibold mb-1', styles.title)}>
                        {title}
                    </h4>
                )}
                <p className={cn('text-sm', styles.message)}>
                    {children}
                </p>
            </div>

            {onClose && (
                <button
                    onClick={onClose}
                    className={cn(
                        'flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors',
                        styles.icon
                    )}
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export default Alert;
