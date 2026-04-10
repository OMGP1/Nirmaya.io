/**
 * MobileNav - Bottom Navigation for Mobile Devices
 * 
 * Thumb-friendly navigation bar fixed at the bottom of the screen
 * Visible only on mobile (<768px), hidden on desktop
 */
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, PlusCircle, Users, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const MobileNav = () => {
    const location = useLocation();
    const { profile } = useAuth();

    // Navigation items based on user role
    const getNavItems = () => {
        const baseItems = [
            { path: '/dashboard', icon: Home, label: 'Home' },
            { path: '/appointments', icon: Calendar, label: 'Appointments' },
            { path: '/book', icon: PlusCircle, label: 'Book' },
            { path: '/doctors', icon: Users, label: 'Doctors' },
            { path: '/settings', icon: User, label: 'Profile' },
        ];

        // Admin gets different home path
        if (profile?.role === 'admin') {
            baseItems[0] = { path: '/admin', icon: Home, label: 'Home' };
        } else if (profile?.role === 'doctor') {
            baseItems[0] = { path: '/doctor', icon: Home, label: 'Home' };
        }

        return baseItems;
    };

    const navItems = getNavItems();

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map(({ path, icon: Icon, label }) => {
                    const active = isActive(path);
                    return (
                        <Link
                            key={path}
                            to={path}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${active
                                    ? 'text-primary'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Icon className={`h-6 w-6 ${active ? 'stroke-[2.5]' : 'stroke-2'}`} />
                            <span className={`text-xs mt-1 ${active ? 'font-semibold' : 'font-normal'}`}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileNav;
