/**
 * Input Component - Shadcn Style
 * 
 * Clean, minimal input with proper accessibility.
 */
import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef(
    ({ className, type, label, error, leftIcon, ...props }, ref) => {
        const id = props.id || props.name || React.useId();

        return (
            <div className="space-y-2">
                {label && (
                    <label
                        htmlFor={id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    id={id}
                    className={cn(
                        'flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base md:text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                        error && 'border-destructive focus-visible:ring-destructive',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <p className="text-xs text-destructive">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
export default Input;
