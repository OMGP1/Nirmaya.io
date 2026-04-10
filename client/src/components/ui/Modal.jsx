/**
 * Modal Component
 * 
 * Accessible modal dialog with overlay and animations.
 */
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

const modalSizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw]',
};

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showClose = true,
    closeOnOverlay = true,
    className,
}) => {
    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 animate-fade-in"
                onClick={closeOnOverlay ? onClose : undefined}
            />

            {/* Modal */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                className={cn(
                    'relative w-full mx-4 bg-white rounded-xl shadow-xl animate-slide-up',
                    modalSizes[size],
                    className
                )}
            >
                {/* Header */}
                {(title || showClose) && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        {title && (
                            <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
                                {title}
                            </h2>
                        )}
                        {showClose && (
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

const ModalFooter = ({ children, className }) => (
    <div
        className={cn(
            'flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl',
            className
        )}
    >
        {children}
    </div>
);

Modal.Footer = ModalFooter;

export default Modal;
