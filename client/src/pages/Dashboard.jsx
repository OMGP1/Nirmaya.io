import { getLocalTimeFromUTC } from '@/lib/utils';
/**
 * Dashboard Page — Niramaya Patient Portal
 * 
 * Tiered dashboard with live vitals monitoring, risk gauge,
 * appointment management, and clinical navigation.
 * Preserves all existing backend data fetching.
 */
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useNiramaya } from '@/hooks/useNiramaya';
import PatientSidebar from '@/components/layout/PatientSidebar';
import { Badge, Spinner } from '@/components/ui';
import {
  Activity, Heart, Droplets, Wind, Bell, User,
  Calendar, Clock, Plus, ArrowRight, CheckCircle, XCircle,
  Shield, Zap, AlertTriangle,
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { getMyAppointments } from '@/services/appointments';
import { formatDoctorName } from '@/utils/formatDoctorName';

const Dashboard = () => {
    const { user, profile, loading: authLoading } = useAuth();
    const { vitals, riskScore, riskState, riskHex, start, stop } = useNiramaya(true);

    // Redirect admin/doctor users
    if (!authLoading && profile?.role === 'admin') return <Navigate to="/admin" replace />;
    if (!authLoading && profile?.role === 'doctor') return <Navigate to="/doctor" replace />;

    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState({ upcoming: 0, completed: 0, cancelled: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;
            try {
                setLoading(true);
                const data = await getMyAppointments(user.id);
                const now = new Date();
                const upcomingCount = data.filter(apt =>
                    ['pending', 'confirmed'].includes(apt.status) &&
                    getLocalTimeFromUTC(apt.start_time) > now
                ).length;
                const completedCount = data.filter(apt => apt.status === 'completed').length;
                const cancelledCount = data.filter(apt => apt.status === 'cancelled').length;
                const upcomingAppointments = data
                    .filter(apt =>
                        ['pending', 'confirmed'].includes(apt.status) &&
                        getLocalTimeFromUTC(apt.start_time) > now
                    )
                    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
                    .slice(0, 5);
                setAppointments(upcomingAppointments);
                setStats({ upcoming: upcomingCount, completed: completedCount, cancelled: cancelledCount });
            } catch (err) {
                console.error('Failed to fetch appointments:', err);
                setError('Failed to load your appointments');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?.id]);

    const formatAppointmentDate = (dateString) => {
        try { return format(getLocalTimeFromUTC(dateString), 'MMM d, yyyy'); }
        catch { return dateString; }
    };

    const formatAppointmentTime = (dateString) => {
        try { return format(getLocalTimeFromUTC(dateString), 'h:mm a'); }
        catch { return ''; }
    };

    const gaugePercentage = Math.min(riskScore, 100);
    const circumference = 2 * Math.PI * 88;
    const dashOffset = circumference - (gaugePercentage / 100) * circumference;

    // Theme classes based on risk state
    const isAlert = riskState === 'anomaly';
    const isCritical = riskState === 'critical';

    if (loading && !vitals) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className={`h-screen w-full bg-slate-50 flex flex-row overflow-hidden relative ${isCritical ? 'theme-emergency' : ''}`}>
            <PatientSidebar />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
                {/* Top Bar */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 lg:hidden ml-10">
                        <span className="text-lg font-heading font-bold text-[#1A2B48]">Niramaya</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#008080]" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">DPDPA 2023 Compliant</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#1A2B48]">
                            <Bell className="w-5 h-5" />
                            {isCritical && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                            )}
                        </button>
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-[#1A2B48]">{profile?.full_name || 'Patient'}</p>
                                <p className="text-xs text-slate-500">Clinical Profile</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#1A2B48] border border-slate-200">
                                <User className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Alert Banner (Anomaly/Critical) */}
                {isAlert && (
                    <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <span className="text-sm font-bold text-amber-800">Anomaly Detected — Elevated risk parameters. Monitoring active.</span>
                    </div>
                )}
                {isCritical && (
                    <div className="bg-red-600 px-6 py-3 flex items-center gap-3 animate-pulse">
                        <AlertTriangle className="w-5 h-5 text-white" />
                        <span className="text-sm font-bold text-white">CRITICAL — Immediate intervention required. Emergency protocols active.</span>
                    </div>
                )}

                {/* Content */}
                <div className="p-6 md:p-8 max-w-6xl mx-auto w-full space-y-8">
                    {/* Welcome + Gauge Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Welcome + Stats */}
                        <div className="lg:col-span-8 space-y-6">
                            <div>
                                <h1 className="text-3xl font-heading font-black text-[#1A2B48]">
                                    Welcome, {profile?.full_name?.split(' ')[0] || 'Patient'}
                                </h1>
                                <p className="text-slate-500 mt-1">Your real-time health intelligence overview</p>
                            </div>

                            {/* Live Vitals Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Heart Rate */}
                                <div className={`p-5 rounded-2xl border shadow-sm ${isCritical ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-2 rounded-lg ${isCritical ? 'bg-red-100' : 'bg-red-50'}`}>
                                                <Heart className={`w-4 h-4 ${isCritical ? 'text-red-600' : 'text-red-500'}`} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Heart Rate</span>
                                        </div>
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span id="val-hr" className="text-3xl font-heading font-black text-[#1A2B48]">{vitals?.hr || '--'}</span>
                                        <span className="text-sm text-slate-400">bpm</span>
                                    </div>
                                </div>

                                {/* SpO2 */}
                                <div className={`p-5 rounded-2xl border shadow-sm ${isCritical ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-lg bg-cyan-50">
                                                <Droplets className="w-4 h-4 text-cyan-500" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">SpO2</span>
                                        </div>
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span id="val-spo2" className="text-3xl font-heading font-black text-[#1A2B48]">{vitals?.spo2 || '--'}</span>
                                        <span className="text-sm text-slate-400">%</span>
                                    </div>
                                </div>

                                {/* Respiratory */}
                                <div className={`p-5 rounded-2xl border shadow-sm ${isCritical ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-lg bg-blue-50">
                                                <Wind className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resp. Rate</span>
                                        </div>
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-heading font-black text-[#1A2B48]">{vitals?.rr || '--'}</span>
                                        <span className="text-sm text-slate-400">rpm</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Risk Gauge */}
                        <div className="lg:col-span-4 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Health Risk Index (NEWS2)</p>
                            <div className="relative w-44 h-44 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="88" cy="88" r="80" stroke="#e2e8f0" strokeWidth="10" fill="transparent" />
                                    <circle
                                        id="gauge-circle"
                                        cx="88" cy="88" r="80"
                                        stroke={riskHex}
                                        strokeWidth="10"
                                        fill="transparent"
                                        strokeDasharray={2 * Math.PI * 80}
                                        strokeDashoffset={2 * Math.PI * 80 - (gaugePercentage / 100) * 2 * Math.PI * 80}
                                        strokeLinecap="round"
                                        className="transition-all duration-500"
                                        style={isCritical ? { filter: `drop-shadow(0 0 8px ${riskHex})` } : {}}
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span id="val-risk" className="text-4xl font-heading font-black" style={{ color: riskHex }}>{riskScore}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        {riskState === 'stable' ? 'Stable' : riskState === 'anomaly' ? 'Alert' : 'Critical'}
                                    </span>
                                </div>
                            </div>
                            <div id="fill-risk" className="w-full mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${gaugePercentage}%`, backgroundColor: riskHex }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Appointment Stats */}
                    <div className="grid sm:grid-cols-3 gap-4">
                        <Link to="/appointments?status=pending" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#008080]/10 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-[#008080]" />
                            </div>
                            <div>
                                <p className="text-2xl font-heading font-black text-[#1A2B48]">{stats.upcoming}</p>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upcoming</p>
                            </div>
                        </Link>
                        <Link to="/appointments?status=completed" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-heading font-black text-[#1A2B48]">{stats.completed}</p>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed</p>
                            </div>
                        </Link>
                        <Link to="/appointments?status=cancelled" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-heading font-black text-[#1A2B48]">{stats.cancelled}</p>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cancelled</p>
                            </div>
                        </Link>
                    </div>

                    {/* Upcoming Appointments */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-lg font-heading font-bold text-[#1A2B48]">Upcoming Appointments</h2>
                            <Link
                                to="/book"
                                className="px-4 py-2 bg-[#008080] text-white text-sm font-bold rounded-xl shadow-sm hover:brightness-110 transition-all flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Book New
                            </Link>
                        </div>
                        <div>
                            {error ? (
                                <div className="p-8 text-center text-red-500">{error}</div>
                            ) : appointments.length > 0 ? (
                                <div className="divide-y divide-slate-50">
                                    {appointments.map((apt) => (
                                        <div key={apt.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-slate-500" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-[#1A2B48]">{formatDoctorName(apt.doctor?.user?.full_name)}</p>
                                                    <p className="text-xs text-slate-500">{apt.doctor?.specialization || apt.doctor?.department?.name || 'Specialist'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right hidden sm:block">
                                                <p className="text-sm font-bold text-[#1A2B48]">{formatAppointmentDate(apt.start_time)}</p>
                                                <p className="text-xs text-slate-500">{formatAppointmentTime(apt.start_time)}</p>
                                            </div>
                                            <Badge variant={apt.status === 'confirmed' ? 'success' : apt.status === 'pending' ? 'warning' : 'default'}>
                                                {apt.status}
                                            </Badge>
                                            <Link to="/appointments">
                                                <ArrowRight className="w-4 h-4 text-slate-400 hover:text-[#008080] transition-colors" />
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-10 text-center text-slate-400">
                                    <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                    <p className="font-bold text-sm">No upcoming appointments</p>
                                    <p className="text-xs mt-1">Book your first appointment to get started!</p>
                                    <Link
                                        to="/book"
                                        className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 bg-[#008080] text-white text-sm font-bold rounded-xl shadow-sm hover:brightness-110 transition-all"
                                    >
                                        <Plus className="w-4 h-4" /> Book Appointment
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Link to="/symptom-triage" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#008080]/10 flex items-center justify-center group-hover:bg-[#008080] group-hover:text-white transition-colors">
                                    <Zap className="w-5 h-5 text-[#008080] group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-[#1A2B48]">AI Symptom Triage</p>
                                    <p className="text-xs text-slate-500">Analyze symptoms with BioBERT</p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#008080] transition-colors" />
                        </Link>
                        <Link to="/doctors" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                                    <User className="w-5 h-5 text-purple-500 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-[#1A2B48]">Find Specialists</p>
                                    <p className="text-xs text-slate-500">Browse verified doctors</p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-purple-500 transition-colors" />
                        </Link>
                    </div>
                </div>

                {/* Terminal Footer */}
                <footer className="mt-auto p-4 bg-white border-t border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
                        <span className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: riskHex }} />
                            RISK_ENGINE: NEWS2_v5
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-[#008080] rounded-full" />
                            ENCRYPTION: AES-256
                        </span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        System Latency: 142ms
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default Dashboard;
