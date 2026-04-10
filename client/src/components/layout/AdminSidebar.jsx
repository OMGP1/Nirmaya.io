/**
 * Admin Sidebar — Niramaya System Engine Console
 * 
 * Deep navy sidebar with teal accents, grouped nav,
 * system status panel, and admin user card.
 * Mobile responsive with slide-in/out + overlay.
 */
import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    Activity, Database, Brain, ShieldCheck,
    Calendar, Users, Building2, UserCircle,
    LogOut, Menu, X, Terminal,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
    { to: '/admin', icon: Activity, label: 'Health Monitor', end: true },
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
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0D9488] rounded-lg flex items-center justify-center shadow-lg shadow-[#0D9488]/20">
                        <Terminal className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-heading font-black tracking-tight text-white">System Engine</span>
                        <span className="text-[9px] font-bold text-[#0D9488] uppercase tracking-widest opacity-80">Admin Console v4.2</span>
                    </div>
                </div>
                {/* Close button - mobile only */}
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="lg:hidden p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="Close menu"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 overflow-y-auto">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3 px-4">Core Infrastructure</p>
                <div className="space-y-1">
                    {navItems.map(({ to, icon: Icon, label, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${isActive
                                    ? 'bg-white/10 font-bold text-white border border-white/5 shadow-sm'
                                    : 'font-medium text-white/50 hover:bg-white/5 hover:text-white/80'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-[#0D9488]' : ''}`} />
                                    <span className="truncate">{label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto p-4 space-y-4">
                {/* System Status */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">System Status</span>
                        <div className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-mono text-white/40">
                            <span>Uptime:</span>
                            <span>99.98%</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-white/40">
                            <span>API Load:</span>
                            <span>2.4k req/m</span>
                        </div>
                    </div>
                </div>
                
                {/* Admin User Card */}
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="w-8 h-8 rounded-full bg-[#0D9488]/20 flex items-center justify-center border border-white/10 text-[#0D9488] text-xs font-bold flex-shrink-0">
                        {profile?.full_name?.charAt(0) || 'A'}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{profile?.full_name || 'Admin Root'}</p>
                        <p className="text-[9px] text-white/30 truncate">{profile?.email || 'System Architect'}</p>
                    </div>
                </div>

                {/* Sign Out */}
                <button
                    onClick={signOut}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-400/80 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors"
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
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0B1120] text-white px-4 py-3 flex items-center justify-between shadow-lg border-b border-white/5">
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="Open menu"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-heading font-black flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-[#0D9488]" />
                    System Engine
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

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-50
                    w-64
                    bg-[#0B1120]
                    text-white border-r border-white/5
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
