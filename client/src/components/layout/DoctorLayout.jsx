/**
 * Doctor Layout — Niramaya System Engine Console
 * 
 * Deep navy sidebar with System Engine panel, grouped navigation,
 * and specialist profile card. Mobile responsive with slide-in overlay.
 * All auth/role logic preserved.
 */
import { useState, useEffect } from 'react';
import { Outlet, NavLink, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui';
import {
    Bell,
    CalendarDays,
    ClipboardList,
    Clock,
    Settings,
    LogOut,
    Menu,
    X,
    Activity,
} from 'lucide-react';

const navItems = [
    { to: '/doctor', icon: Bell, label: 'Emergency Queue', end: true },
    { to: '/doctor/schedule', icon: CalendarDays, label: 'Schedules' },
    { to: '/doctor/appointments', icon: ClipboardList, label: 'Patient History' },
    { to: '/doctor/availability', icon: Clock, label: 'Shift Planner' },
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
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
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
            {/* Branding */}
            <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0D9488] rounded-lg flex items-center justify-center shadow-lg shadow-[#0D9488]/20">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="text-lg font-bold tracking-tight text-white">Niramaya.io</span>
                        <p className="text-[9px] font-bold text-[#0D9488] uppercase tracking-widest">Command Center</p>
                    </div>
                </div>
                {/* Close button - mobile only */}
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="Close menu"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-2 overflow-y-auto">
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 px-3">Operations</p>
                <div className="space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-white/10 text-white font-bold border border-white/5 shadow-sm'
                                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                                    <span>{item.label}</span>
                                    {item.label === 'Emergency Queue' && (
                                        <span className="ml-auto bg-[#ef4444] text-white text-[9px] px-1.5 py-0.5 rounded-full animate-pulse font-black">!</span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="mt-4 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-bold">Logout</span>
                </button>
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto p-4 flex flex-col gap-3">
                {/* System Engine Panel */}
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest">System Engine</p>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#0D9488] animate-pulse" />
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-medium text-white/70">
                            <span>HL7 FHIR R4</span>
                            <span className="text-[#0D9488]">Active</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-medium text-white/70">
                            <span>AI Inference</span>
                            <span className="text-[#0D9488]">184ms</span>
                        </div>
                    </div>
                </div>

                {/* Doctor Profile Card */}
                <div className="flex items-center gap-3 p-2.5 bg-white/5 rounded-xl border border-white/10">
                    <div className="w-8 h-8 rounded-full bg-[#0D9488]/20 flex items-center justify-center border border-[#0D9488]/30 text-[#0D9488] font-bold text-xs flex-shrink-0">
                        {profile?.full_name?.charAt(0) || 'D'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white leading-tight truncate">
                            Dr. {profile?.full_name}
                        </p>
                        <p className="text-[9px] text-white/50 uppercase truncate">
                            Specialist
                        </p>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
            {/* Mobile Header Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-[#0B1120] flex items-center justify-between px-4 shadow-lg flex-shrink-0">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="Open menu"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#0D9488]" />
                    Command Center
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

            {/* Sidebar — Deep Navy */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-50
                    w-64 sm:w-72 lg:w-64
                    bg-[#0B1120]
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
