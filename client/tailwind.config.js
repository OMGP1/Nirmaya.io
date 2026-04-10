/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Niramaya Clinical Design System
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                // Niramaya Clinical State Colors
                tertiary: 'var(--tertiary)',
                'niramaya-navy': {
                    DEFAULT: '#0B1120',
                    dark: '#0A0F1E',
                    sidebar: '#0F172A',
                },
                'niramaya-teal': {
                    DEFAULT: '#008080',
                    light: '#00d2c1',
                    glow: 'rgba(0, 210, 193, 0.3)',
                    accent: '#0D9488',
                },
                'niramaya-cyan': {
                    DEFAULT: '#00F5FF',
                },
                clinical: {
                    stable: '#00d2c1',
                    anomaly: '#ff9f1c',
                    critical: '#e71d36',
                    bg: '#f8fafc',
                },
                danger: {
                    50: '#FEF2F2',
                    100: '#FEE2E2',
                    500: '#EF4444',
                    600: '#DC2626',
                    700: '#B91C1C',
                },
                warning: {
                    50: '#FFFBEB',
                    100: '#FEF3C7',
                    500: '#F59E0B',
                    600: '#D97706',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                heading: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
                jakarta: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
                code: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            boxShadow: {
                'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
                'card': '0 0 0 1px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
                'clinical': '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                'teal-glow': '0 0 15px rgba(0, 210, 193, 0.3)',
                'cyan-glow': '0 0 15px rgba(0, 245, 255, 0.3)',
                'red-glow': '0 0 15px rgba(231, 29, 54, 0.3)',
                'amber-glow': '0 0 15px rgba(255, 159, 28, 0.3)',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'pulse-red': 'pulseRed 2s infinite',
                'pulse-teal': 'pulseTeal 2s infinite',
                'spin-slow': 'spin 3s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                pulseRed: {
                    '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(231, 29, 54, 0.7)' },
                    '70%': { transform: 'scale(1)', boxShadow: '0 0 0 20px rgba(231, 29, 54, 0)' },
                    '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(231, 29, 54, 0)' },
                },
                pulseTeal: {
                    '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(0, 128, 128, 0.7)' },
                    '70%': { transform: 'scale(1)', boxShadow: '0 0 0 20px rgba(0, 128, 128, 0)' },
                    '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(0, 128, 128, 0)' },
                },
            },
        },
    },
    plugins: [],
};
