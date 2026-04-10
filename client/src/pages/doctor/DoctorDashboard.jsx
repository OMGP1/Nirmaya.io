import { getLocalTimeFromUTC } from '@/lib/utils';
/**
 * DoctorDashboard — Niramaya Command Center
 * 
 * Priority Dispatch Queue with real-time vitals overlay,
 * color-coded triage table, and clinical action buttons.
 * Preserves all existing Supabase data fetching.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, startOfDay, endOfDay } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useNiramaya } from '@/hooks/useNiramaya';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui';
import {
    AlertCircle, Heart, Droplets, Activity, Clock,
    Users, ChevronRight, Zap, ArrowRight, Shield,
} from 'lucide-react';

const DoctorDashboard = () => {
    const { user, profile } = useAuth();
    const { vitals, riskScore, riskState, riskHex } = useNiramaya(true);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                if (!user) throw new Error('Not authenticated');

                const { data: doctor, error: doctorError } = await supabase
                    .from('doctors')
                    .select('id')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (doctorError || !doctor) throw new Error('Doctor profile not found. Please contact admin to set up your doctor profile.');

                const today = new Date();
                const todayStart = startOfDay(today).toISOString();
                const todayEnd = endOfDay(today).toISOString();

                const { data: todayAppointments, error: todayError } = await supabase
                    .from('appointments')
                    .select(`*, patient:users!appointments_patient_id_fkey(id, full_name, email)`)
                    .eq('doctor_id', doctor.id)
                    .gte('start_time', todayStart)
                    .lte('start_time', todayEnd)
                    .neq('status', 'cancelled')
                    .order('start_time', { ascending: true });

                if (todayError) console.error('Error fetching today appointments:', todayError);

                const { data: pendingAppointments } = await supabase
                    .from('appointments')
                    .select('id')
                    .eq('doctor_id', doctor.id)
                    .eq('status', 'pending');

                const { data: upcomingAppointments } = await supabase
                    .from('appointments')
                    .select('id')
                    .eq('doctor_id', doctor.id)
                    .gte('start_time', new Date().toISOString())
                    .neq('status', 'cancelled');

                setSummary({
                    todayAppointments: todayAppointments || [],
                    stats: {
                        todayTotal: todayAppointments?.length || 0,
                        pending: pendingAppointments?.length || 0,
                        upcoming: upcomingAppointments?.length || 0,
                    }
                });
            } catch (err) {
                console.error('Dashboard fetch error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchDashboardData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center text-red-600 m-6">
                <AlertCircle className="w-12 h-12 mx-auto mb-3" />
                <p>{error}</p>
            </div>
        );
    }

    const stats = summary?.stats || {};
    const todayAppointments = summary?.todayAppointments || [];
    const criticalCount = stats.pending || 0;

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* Command Center Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-heading font-black text-[#0B1120] tracking-tight">Priority Dispatch Queue</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-[#1F2937]/60 uppercase tracking-wider">Clinical Triage Feed</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {criticalCount > 0 && (
                        <div className="hidden sm:flex items-center gap-2 bg-[#0B1120] px-3 py-1.5 rounded-lg border border-white/10">
                            <AlertCircle className="w-4 h-4 text-[#ef4444] animate-pulse" />
                            <span className="text-[10px] font-black text-white uppercase tracking-wider">{criticalCount} Pending</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Link to="/doctor/appointments?filter=today" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                        <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-heading font-black text-[#0B1120]">{stats.todayTotal || 0}</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Today</p>
                    </div>
                </Link>

                <Link to="/doctor/appointments?filter=pending" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
                        <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-heading font-black text-[#0B1120]">{stats.pending || 0}</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Pending</p>
                    </div>
                </Link>

                <Link to="/doctor/appointments?filter=upcoming" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center border border-green-100">
                        <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-heading font-black text-[#0B1120]">{stats.upcoming || 0}</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Upcoming</p>
                    </div>
                </Link>

                {/* Live Risk Overview */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ backgroundColor: `${riskHex}10`, borderColor: `${riskHex}30` }}>
                        <Activity className="w-5 h-5" style={{ color: riskHex }} />
                    </div>
                    <div>
                        <p className="text-2xl font-heading font-black" style={{ color: riskHex }}>{riskScore}</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Risk Index</p>
                    </div>
                </div>
            </div>

            {/* Priority Queue Table */}
            <div className="bg-white rounded-[16px] shadow-xl shadow-slate-200/40 border border-slate-200 overflow-hidden">
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Zap className="w-4 h-4 text-[#0D9488]" />
                        <h2 className="text-sm font-heading font-black text-[#1F2937] uppercase tracking-widest">Today's Queue</h2>
                        <span className="px-2 py-0.5 bg-[#0D9488]/10 text-[#0D9488] text-[9px] font-black rounded uppercase border border-[#0D9488]/20">
                            {todayAppointments.length} Active
                        </span>
                    </div>
                    <Link to="/doctor/appointments" className="flex items-center gap-1 text-xs font-bold text-[#0D9488] hover:text-[#0b7a6f] transition-colors">
                        View All <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {todayAppointments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-5 py-3 text-[10px] font-black text-[#1F2937] uppercase tracking-widest">Patient Details</th>
                                    <th className="px-5 py-3 text-[10px] font-black text-[#1F2937] uppercase tracking-widest">Time</th>
                                    <th className="px-5 py-3 text-[10px] font-black text-[#1F2937] uppercase tracking-widest">Reason</th>
                                    <th className="px-5 py-3 text-[10px] font-black text-[#1F2937] uppercase tracking-widest">Heart Rate</th>
                                    <th className="px-5 py-3 text-[10px] font-black text-[#1F2937] uppercase tracking-widest">SpO2</th>
                                    <th className="px-5 py-3 text-[10px] font-black text-[#1F2937] uppercase tracking-widest">Risk Vector</th>
                                    <th className="px-5 py-3 text-[10px] font-black text-[#1F2937] uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {todayAppointments.map((apt, idx) => {
                                    const isUrgent = apt.status === 'pending';
                                    const riskVal = riskScore || 0;
                                    return (
                                        <tr key={apt.id} className={`group transition-all relative ${isUrgent ? 'bg-red-50/30' : 'hover:bg-slate-50'}`}>
                                            <td className={`px-5 py-4 ${isUrgent ? 'border-l-4 border-[#ef4444]' : 'border-l-4 border-transparent'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative shrink-0">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold border-2 ${
                                                            isUrgent ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-100 text-[#0B1120] border-slate-200'
                                                        }`}>
                                                            {apt.patient?.full_name?.charAt(0) || 'P'}
                                                        </div>
                                                        {isUrgent && (
                                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#ef4444] rounded-full border-2 border-white animate-pulse" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className={`font-heading font-bold text-sm ${isUrgent ? 'text-[#ef4444]' : 'text-[#1F2937]'}`}>
                                                            {apt.patient?.full_name}
                                                        </p>
                                                        <p className="text-[9px] text-[#1F2937]/50 font-bold uppercase tracking-tight">
                                                            {apt.patient?.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-sm font-bold text-[#1F2937] font-mono">
                                                {format(getLocalTimeFromUTC(apt.start_time), 'h:mm a')}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-[#1F2937]/70 max-w-[180px] truncate">
                                                {apt.reason || 'General consultation'}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="flex items-center gap-1 text-sm font-bold text-red-500">
                                                    <Heart className="w-3.5 h-3.5" /> {vitals?.hr || '--'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="flex items-center gap-1 text-sm font-bold text-cyan-500">
                                                    <Droplets className="w-3.5 h-3.5" /> {vitals?.spo2 || '--'}%
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500"
                                                            style={{
                                                                width: `${Math.min(riskVal, 100)}%`,
                                                                backgroundColor: riskHex,
                                                                boxShadow: riskVal > 70 ? `0 0 8px ${riskHex}` : 'none',
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-black" style={{ color: riskHex }}>{riskVal}%</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <Link
                                                    to={`/doctor/appointments/${apt.id}`}
                                                    className="px-3 py-2 bg-[#0D9488] text-white text-[10px] font-black rounded-lg shadow-md hover:brightness-110 transition-all uppercase tracking-wider inline-flex items-center gap-1"
                                                >
                                                    Intervene <ArrowRight className="w-3 h-3" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-10 text-center text-slate-400">
                        <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p className="font-bold text-sm">No appointments scheduled for today</p>
                        <p className="text-xs text-slate-400 mt-1">Queue is clear — no active dispatches</p>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-2 gap-4">
                <Link to="/doctor/schedule" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#0D9488]/10 flex items-center justify-center group-hover:bg-[#0D9488] transition-colors border border-[#0D9488]/20">
                            <Zap className="w-5 h-5 text-[#0D9488] group-hover:text-white transition-colors" />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-[#0B1120]">View Schedule</p>
                            <p className="text-xs text-slate-500">See your weekly calendar</p>
                        </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#0D9488] transition-colors" />
                </Link>
                <Link to="/doctor/availability" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center group-hover:bg-green-500 transition-colors border border-green-100">
                            <Clock className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-[#0B1120]">Shift Planner</p>
                            <p className="text-xs text-slate-500">Configure availability</p>
                        </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-green-500 transition-colors" />
                </Link>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-2">
                <span className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-[#0D9488]" />
                    <span className="font-black text-[#1F2937] uppercase">Queue Pressure: Normal</span>
                </span>
                <span className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-[#0D9488]" />
                    <span className="font-black text-[#0D9488] uppercase">Real-time Telemetry Active</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                </span>
            </div>
        </div>
    );
};

export default DoctorDashboard;
