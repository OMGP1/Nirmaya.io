/**
 * Admin Sidebar Navigation - Mobile Responsive
 * 
 * Collapsible sidebar with mobile hamburger menu support.
 */
import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    Users,
    Building2,
    UserCircle,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/admin/doctors', icon: Users, label: 'Doctors' },
    { to: '/admin/departments', icon: Building2, label: 'Departments' },
    { to: '/admin/patients', icon: UserCircle, label: 'Patients' },
];

const AdminSidebar = () => {
    const { signOut, profile } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    // Close sidebar on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') setIsMobileOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileOpen]);

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                    <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                        🏥 HealthBook
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
                </div>
                {/* Close button - mobile only */}
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    aria-label="Close menu"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 sm:p-4 overflow-y-auto">
                <ul className="space-y-1">
                    {navItems.map(({ to, icon: Icon, label, end }) => (
                        <li key={to}>
                            <NavLink
                                to={to}
                                end={end}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${isActive
                                        ? 'bg-primary-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`
                                }
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                <span className="truncate">{label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* User Section */}
            <div className="p-3 sm:p-4 border-t border-gray-800">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-600 flex items-center justify-center text-sm sm:text-base flex-shrink-0">
                        {profile?.full_name?.charAt(0) || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                            {profile?.full_name || 'Admin'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                            {profile?.email || 'admin@healthbook.com'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={signOut}
                    className="w-full flex items-center gap-2 px-3 sm:px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Header Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 text-white px-4 py-3 flex items-center justify-between shadow-lg">
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    aria-label="Open menu"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-bold flex items-center gap-2">
                    🏥 HealthBook
                </h1>
                <div className="w-10" /> {/* Spacer for centering */}
            </div>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar - Desktop: always visible, Mobile: slide in/out - Glass Effect */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-50
                    w-64 sm:w-72 lg:w-64
                    bg-gradient-to-b from-gray-900/95 to-gray-900/98 backdrop-blur-xl
                    text-white border-r border-white/10
                    flex flex-col min-h-screen
                    transform transition-transform duration-300 ease-in-out
                    shadow-2xl lg:shadow-none
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                <SidebarContent />
            </aside>
        </>
    );
};

export default AdminSidebar;
