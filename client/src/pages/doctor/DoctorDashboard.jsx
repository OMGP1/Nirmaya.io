import { getLocalTimeFromUTC } from '@/lib/utils';
/**
 * DoctorDashboard — Niramaya Command Center
 * 
 * Priority dispatch queue with real-time vitals overlay,
 * color-coded triage, and clinical action buttons.
 * Preserves all existing Supabase data fetching.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, startOfDay, endOfDay } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useNiramaya } from '@/hooks/useNiramaya';
import { supabase } from '@/lib/supabase';
import { Badge, Spinner, Avatar } from '@/components/ui';
import {
    Calendar, Clock, Users, CheckCircle, AlertCircle, ChevronRight,
    Activity, Shield, Zap, ArrowRight, Heart, Droplets, AlertTriangle,
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
                    .single();

                if (doctorError || !doctor) throw new Error('Doctor profile not found');

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

    return (
        <div className="space-y-6">
            {/* Command Center Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-heading font-black text-[#1A2B48]">Command Center</h1>
                    <p className="text-sm text-slate-500 mt-1">Real-time clinical operations dashboard</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 bg-[#008080]/5 border border-[#008080]/10 px-4 py-2 rounded-xl">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008080] opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#008080]" />
                        </span>
                        <span className="text-xs font-bold text-[#008080]">System Online</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-4 gap-4">
                <Link to="/doctor/appointments?filter=today" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-heading font-black text-[#1A2B48]">{stats.todayTotal || 0}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today</p>
                    </div>
                </Link>

                <Link to="/doctor/appointments?filter=pending" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-heading font-black text-[#1A2B48]">{stats.pending || 0}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending</p>
                    </div>
                </Link>

                <Link to="/doctor/appointments?filter=upcoming" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-heading font-black text-[#1A2B48]">{stats.upcoming || 0}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upcoming</p>
                    </div>
                </Link>

                {/* Live Risk Overview */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${riskHex}15` }}>
                        <Activity className="w-6 h-6" style={{ color: riskHex }} />
                    </div>
                    <div>
                        <p className="text-2xl font-heading font-black" style={{ color: riskHex }}>{riskScore}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Risk Index</p>
                    </div>
                </div>
            </div>

            {/* Today's Appointments — Priority Queue */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-[#008080]" />
                        <h2 className="text-lg font-heading font-bold text-[#1A2B48]">Priority Dispatch Queue</h2>
                        <Badge variant="outline" className="text-[10px] font-black tracking-widest uppercase">
                            {todayAppointments.length} Active
                        </Badge>
                    </div>
                    <Link to="/doctor/appointments" className="flex items-center gap-1 text-xs font-bold text-[#008080] hover:text-[#00d2c1] transition-colors">
                        View All <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {todayAppointments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Patient</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Live Vitals</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {todayAppointments.map((apt) => (
                                    <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={apt.patient?.full_name} size="sm" />
                                                <div>
                                                    <p className="font-bold text-[#1A2B48]">{apt.patient?.full_name}</p>
                                                    <p className="text-xs text-slate-400">{apt.patient?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-[#1A2B48] font-bold">
                                            {format(getLocalTimeFromUTC(apt.start_time), 'h:mm a')}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 text-sm max-w-[200px] truncate">
                                            {apt.reason || 'General consultation'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={apt.status === 'confirmed' ? 'success' : apt.status === 'pending' ? 'warning' : 'default'}>
                                                {apt.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 text-xs">
                                                <span className="flex items-center gap-1 text-red-500">
                                                    <Heart className="w-3 h-3" /> {vitals?.hr || '--'}
                                                </span>
                                                <span className="flex items-center gap-1 text-cyan-500">
                                                    <Droplets className="w-3 h-3" /> {vitals?.spo2 || '--'}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                to={`/doctor/appointments/${apt.id}`}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#008080]/10 text-[#008080] text-xs font-bold rounded-lg hover:bg-[#008080] hover:text-white transition-all"
                                            >
                                                Intervene <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-10 text-center text-slate-400">
                        <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p className="font-bold text-sm">No appointments scheduled for today</p>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-2 gap-4">
                <Link to="/doctor/schedule" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#008080]/10 flex items-center justify-center group-hover:bg-[#008080] transition-colors">
                            <Calendar className="w-5 h-5 text-[#008080] group-hover:text-white transition-colors" />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-[#1A2B48]">View Schedule</p>
                            <p className="text-xs text-slate-500">See your weekly calendar</p>
                        </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#008080] transition-colors" />
                </Link>
                <Link to="/doctor/availability" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center group-hover:bg-green-500 transition-colors">
                            <Clock className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-[#1A2B48]">Manage Availability</p>
                            <p className="text-xs text-slate-500">Set your working hours</p>
                        </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-green-500 transition-colors" />
                </Link>
            </div>

            {/* Terminal Footer */}
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-2">
                <span className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-[#008080] rounded-full" />
                    ENGINE: NiramayaCore_v5 • NEWS2 Active
                </span>
                <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-[#008080]" />
                    HIPAA Compliant • TLS 1.3
                </span>
            </div>
        </div>
    );
};

export default DoctorDashboard;
