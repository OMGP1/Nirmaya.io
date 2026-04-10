/**
 * UI Components Index
 * 
 * Central export for all UI components.
 * Includes both default and named exports for full compatibility.
 */

// Core Components
export { default as Button, buttonVariants } from './Button';
export { default as Input } from './Input';
export { default as Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
export { default as Badge, badgeVariants } from './Badge';

// Feedback Components
export { default as Spinner } from './Spinner';
export { default as Avatar } from './Avatar';
export { default as Alert } from './Alert';
export { default as Skeleton } from './Skeleton';

// Overlay Components
export { default as Modal } from './Modal';
export {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogClose,
} from './Dialog';

// Form Components
export { default as Label } from './Label';
export { default as Calendar } from './Calendar';
export { default as Select } from './Select';

// Layout Components
export { default as Separator } from './Separator';
export { default as Tabs } from './Tabs';
export { default as Table } from './Table';

// Toast
export { ToastProvider, useToast } from './Toast';
