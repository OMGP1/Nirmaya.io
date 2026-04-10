/**
 * Patient Sidebar Navigation - Mobile Responsive with Glass Effects
 * 
 * Unified sidebar style matching admin portal.
 */
import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, Button } from '@/components/ui';
import {
    LayoutDashboard,
    Calendar,
    Stethoscope,
    Building2,
    Settings,
    LogOut,
    Menu,
    X,
    Heart,
    Activity,
    TrendingUp,
} from 'lucide-react';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/appointments', icon: Calendar, label: 'My Appointments' },
    { to: '/doctors', icon: Stethoscope, label: 'Find Doctors' },
    { to: '/departments', icon: Building2, label: 'Departments' },
    { to: '/risk-assessment', icon: Activity, label: 'Risk Assessment' },
    { to: '/vitals', icon: TrendingUp, label: 'Health Trends' },
    { to: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = ({ className }) => {
    const { signOut, profile } = useAuth();
    const navigate = useNavigate();
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

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="p-4 sm:p-6 border-b border-primary-600/20 flex items-center justify-between">
                <div>
                    <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-400" />
                        HealthBook
                    </h1>
                    <p className="text-xs text-primary-200 mt-1">Patient Portal</p>
                </div>
                {/* Close button - mobile only */}
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="lg:hidden p-2 text-primary-200 hover:text-white hover:bg-primary-700/50 rounded-lg transition-colors"
                    aria-label="Close menu"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 sm:p-4 overflow-y-auto">
                <div className="space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-white/20 text-white shadow-lg'
                                    : 'text-primary-100 hover:bg-white/10 hover:text-white'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* User section */}
            <div className="p-4 border-t border-primary-600/20">
                <div className="flex items-center gap-3 mb-3">
                    <Avatar name={profile?.full_name} size="sm" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {profile?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-primary-200 truncate">
                            {profile?.email}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm"
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
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-gradient-to-r from-primary-600 to-primary-700 backdrop-blur-xl flex items-center justify-between px-4 shadow-lg">
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="Open menu"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-bold text-white flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-300" />
                    HealthBook
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
                    bg-gradient-to-b from-primary-600/95 via-primary-700/95 to-primary-800/98 backdrop-blur-xl
                    text-white border-r border-white/10
                    flex flex-col min-h-screen
                    transform transition-transform duration-300 ease-in-out
                    shadow-2xl lg:shadow-none
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    ${className}
                `}
            >
                <SidebarContent />
            </aside>
        </>
    );
};

export default Sidebar;
