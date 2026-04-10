/**
 * Admin Layout — Niramaya System Engine
 * 
 * Layout wrapper for admin pages with sidebar navigation
 * and sticky infrastructure top bar.
 * Includes admin role check - redirects non-admins.
 * Mobile: has top padding for fixed header bar.
 */
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui';
import AdminSidebar from './AdminSidebar';
import { Activity, RefreshCw, Lock } from 'lucide-react';

const AdminLayout = () => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <Spinner size="lg" />
            </div>
        );
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Redirect if not admin
    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
            <AdminSidebar />
            {/* Main content */}
            <main className="flex-1 overflow-y-auto pt-16 lg:pt-0 flex flex-col h-screen">
                {/* Sticky Top Bar */}
                <header className="hidden lg:flex h-14 bg-white border-b border-slate-200 px-8 items-center justify-between sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center gap-4">
                        <h1 className="text-sm font-heading font-black text-[#0B1120]">Global Infrastructure Dashboard</h1>
                        <div className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase border border-slate-200">Production Environment</div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#0D9488]" />
                            <span className="text-[10px] font-black text-slate-500 uppercase">Gateway: Online</span>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-1.5 bg-[#0B1120] text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-md hover:brightness-110 transition-all">
                            Deploy Patch v4.2.1
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 sm:p-6 lg:p-8 flex-1">
                    <Outlet />
                </div>

                {/* Technical Footer */}
                <footer className="hidden lg:flex mt-auto px-8 py-3 bg-slate-100 border-t border-slate-200 items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5 text-[#0D9488]" />
                            <span className="text-[10px] font-black text-[#0B1120] uppercase tracking-tight">Engine Latency: 184ms</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Last Global Sync: T - 0.4s</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5 text-[#0D9488]" />
                            <span className="text-[10px] font-black text-[#0D9488] uppercase tracking-widest">TLS 1.3 Encryption Active</span>
                        </div>
                        <div className="h-4 w-px bg-slate-200" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Node: Cluster-India-01</span>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default AdminLayout;
