/**
 * Animated Page Wrapper Component
 * 
 * Wraps pages with smooth enter/exit animations using Framer Motion.
 */
import { motion } from 'framer-motion';

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: {
            duration: 0.2,
        },
    },
};

export function AnimatedPage({ children, className = '' }) {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Staggered children animation
const containerVariants = {
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

export function AnimatedList({ children, className = '' }) {
    return (
        <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function AnimatedItem({ children, className = '' }) {
    return (
        <motion.div variants={itemVariants} className={className}>
            {children}
        </motion.div>
    );
}

// Card with hover animation
export function AnimatedCard({ children, className = '', onClick }) {
    return (
        <motion.div
            whileHover={{
                y: -4,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={className}
            onClick={onClick}
        >
            {children}
        </motion.div>
    );
}

// Button with scale animation
export function AnimatedButton({ children, className = '', onClick, disabled }) {
    return (
        <motion.button
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            transition={{ duration: 0.15 }}
            className={className}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </motion.button>
    );
}

// Fade in on scroll
export function FadeInOnScroll({ children, className = '' }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Scale in animation
export function ScaleIn({ children, className = '', delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                duration: 0.3,
                delay,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Slide in from side
export function SlideIn({ children, className = '', direction = 'left', delay = 0 }) {
    const xOffset = direction === 'left' ? -30 : 30;

    return (
        <motion.div
            initial={{ opacity: 0, x: xOffset }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
                duration: 0.4,
                delay,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
