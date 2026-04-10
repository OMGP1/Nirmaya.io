/**
 * PatientSidebar — Niramaya Patient Portal Navigation
 * 
 * Reusable sidebar for all patient pages with navigation,
 * engine status, and logout. Matches reference sidebar design.
 */
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Activity,
  LayoutDashboard,
  Grid3x3,
  Filter,
  Users,
  Calendar,
  Settings,
  LogOut,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Appointments', href: '/appointments', icon: Calendar },
  { label: 'Specialists', href: '/doctors', icon: Grid3x3 },
  { label: 'Symptom Triage', href: '/symptom-triage', icon: Filter },
  { label: 'Care Circle', href: '/care-circle', icon: Users },
  { label: 'Health Vault', href: '/medical-vault', icon: ShieldCheck },
  { label: 'Settings', href: '/settings', icon: Settings },
];

const PatientSidebar = () => {
  const { pathname } = useLocation();
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on navigation change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    }
  }, [sidebarOpen]);

  return (
    <>
      {/* Mobile Hamburger Toggle (Floating) */}
      <button 
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-3 left-4 z-40 p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-[#1A2B48] flex items-center justify-center hover:bg-slate-50 transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-[#0B1120]/50 backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        flex flex-col w-64 bg-[#1A2B48] text-white p-6 gap-8 shrink-0 h-screen overflow-y-auto
        transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo and Mobile Close */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#008080] rounded-xl flex items-center justify-center shadow-lg shadow-[#008080]/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-heading font-bold tracking-tight text-white">Niramaya.io</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-white/50 hover:text-white rounded-lg bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === '/appointments' && pathname.startsWith('/book'));
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-all ${
                isActive
                  ? 'bg-white/10 font-bold text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-5 h-5 text-white" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <button
          onClick={signOut}
          className="mt-4 flex items-center gap-3 p-3 hover:bg-white/5 text-white/70 hover:text-white rounded-xl font-medium transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-bold">Logout</span>
        </button>
      </nav>

      {/* Engine Status */}
      <div className="mt-auto pt-6 border-t border-white/10">
        <p className="text-xs font-bold text-[#008080] uppercase mb-2 tracking-wider">Engine Status</p>
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008080] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#008080]" />
          </span>
          <p className="text-sm font-medium text-white">BioBERT Online</p>
        </div>
      </div>
    </aside>
    </>
  );
};

export default PatientSidebar;
