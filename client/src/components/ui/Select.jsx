/**
 * Select Component
 * 
 * Custom dropdown select with options.
 */
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';

const Select = ({
    value,
    onChange,
    options = [],
    placeholder = 'Select an option',
    label,
    error,
    disabled = false,
    className,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (selectRef.current && !selectRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.value === value);

    return (
        <div ref={selectRef} className={cn('relative', className)}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={cn(
                    'w-full px-4 py-3 text-left border rounded-lg transition-all',
                    'flex items-center justify-between gap-2',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500',
                    error
                        ? 'border-danger-500'
                        : 'border-gray-300 hover:border-gray-400',
                    disabled && 'bg-gray-50 cursor-not-allowed opacity-60'
                )}
            >
                <span className={cn(!selectedOption && 'text-gray-400')}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    className={cn(
                        'w-5 h-5 text-gray-400 transition-transform',
                        isOpen && 'rotate-180'
                    )}
                />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg animate-slide-down overflow-hidden">
                    <ul className="py-1 max-h-60 overflow-auto">
                        {options.map((option) => (
                            <li key={option.value}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        'w-full px-4 py-2.5 text-left flex items-center justify-between',
                                        'hover:bg-gray-50 transition-colors',
                                        value === option.value && 'bg-primary-50 text-primary-700'
                                    )}
                                >
                                    <span>{option.label}</span>
                                    {value === option.value && (
                                        <Check className="w-4 h-4 text-primary-600" />
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {error && (
                <p className="mt-1.5 text-sm text-danger-500">{error}</p>
            )}
        </div>
    );
};

export default Select;
