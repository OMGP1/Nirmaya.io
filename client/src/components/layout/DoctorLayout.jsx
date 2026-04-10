/**
 * Doctor Layout - Glass Effect with Mobile Hamburger Menu
 * 
 * Dashboard layout for doctor portal with unified sidebar navigation.
 */
import { useState, useEffect } from 'react';
import { Outlet, NavLink, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, Button, Spinner } from '@/components/ui';
import {
    LayoutDashboard,
    Calendar,
    ClipboardList,
    Clock,
    Settings,
    LogOut,
    Menu,
    X,
    Stethoscope,
} from 'lucide-react';

const navItems = [
    { to: '/doctor', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/doctor/schedule', icon: Calendar, label: 'My Schedule' },
    { to: '/doctor/appointments', icon: ClipboardList, label: 'Appointments' },
    { to: '/doctor/availability', icon: Clock, label: 'Availability' },
    { to: '/doctor/settings', icon: Settings, label: 'Settings' },
];

const DoctorLayout = () => {
    const { user, profile, role, loading, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    // Close sidebar on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') setSidebarOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [sidebarOpen]);

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Spinner size="lg" />
            </div>
        );
    }

    // Redirect if not authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Redirect if not a doctor
    if (role !== 'doctor' && role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                    <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-teal-400" />
                        HealthBook
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">Doctor Portal</p>
                </div>
                {/* Close button - mobile only */}
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
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
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-teal-500/20 text-teal-400 shadow-lg'
                                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
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
            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3 mb-3">
                    <Avatar name={profile?.full_name} size="sm" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            Dr. {profile?.full_name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
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
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Mobile Header Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-gradient-to-r from-gray-800 to-gray-900 backdrop-blur-xl flex items-center justify-between px-4 shadow-lg flex-shrink-0">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="Open menu"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-bold text-white flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-teal-400" />
                    Doctor Portal
                </h1>
                <div className="w-10" /> {/* Spacer for centering */}
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Glass Effect */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-50
                    w-64 sm:w-72 lg:w-64
                    bg-gradient-to-b from-gray-800/95 via-gray-900/95 to-gray-900/98 backdrop-blur-xl
                    text-white border-r border-white/10
                    flex flex-col min-h-screen
                    transform transition-transform duration-300 ease-in-out
                    shadow-2xl lg:shadow-none flex-shrink-0
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                <SidebarContent />
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
                {/* Spacer for mobile header */}
                <div className="lg:hidden h-16 shrink-0" />

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6 w-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DoctorLayout;
