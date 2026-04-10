/**
 * Skeleton Component
 * 
 * Loading placeholder to prevent layout shifts.
 */
import { cn } from '@/lib/utils';

const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={cn(
                'animate-pulse bg-gray-200 rounded',
                className
            )}
            {...props}
        />
    );
};

// Pre-built skeleton variants
const SkeletonText = ({ lines = 3, className }) => (
    <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
                key={i}
                className={cn(
                    'h-4',
                    i === lines - 1 && 'w-3/4' // Last line shorter
                )}
            />
        ))}
    </div>
);

const SkeletonCard = ({ className }) => (
    <div className={cn('bg-white rounded-xl shadow-card p-6', className)}>
        <div className="flex items-center gap-4 mb-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1">
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-3 w-1/4" />
            </div>
        </div>
        <SkeletonText lines={2} />
    </div>
);

const SkeletonAvatar = ({ size = 'md', className }) => {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    return <Skeleton className={cn('rounded-full', sizes[size], className)} />;
};

Skeleton.Text = SkeletonText;
Skeleton.Card = SkeletonCard;
Skeleton.Avatar = SkeletonAvatar;

export default Skeleton;
