/**
 * Avatar Component
 * 
 * User avatar with image support and fallback initials.
 */
import { cn } from '@/lib/utils';

const avatarSizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
};

const Avatar = ({
    src,
    alt = '',
    name,
    size = 'md',
    className,
    ...props
}) => {
    // Generate initials from name
    const getInitials = (name) => {
        if (!name) return '?';
        const cleanName = name.replace(/^Dr\.?\s+/i, '');
        const parts = cleanName.trim().split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return parts[0].substring(0, 2).toUpperCase();
    };

    // Generate consistent color from name
    const getColor = (name) => {
        if (!name) return 'bg-gray-400';
        const colors = [
            'bg-[#0D9488]', // niramaya-teal
            'bg-[#008080]', // dark teal
            'bg-[#1A2B48]', // niramaya-navy
            'bg-[#0B1120]', // deep navy
            'bg-teal-700',
            'bg-slate-800',
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <div
            className={cn(
                'relative inline-flex items-center justify-center rounded-full overflow-hidden',
                avatarSizes[size],
                !src && getColor(name),
                className
            )}
            {...props}
        >
            {src ? (
                <img
                    src={src}
                    alt={alt || name}
                    className="w-full h-full object-cover"
                />
            ) : (
                <span className="font-medium text-white">
                    {getInitials(name)}
                </span>
            )}
        </div>
    );
};

export default Avatar;
