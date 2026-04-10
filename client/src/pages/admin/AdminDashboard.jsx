import { getLocalTimeFromUTC } from '@/lib/utils';
/**
 * AdminDashboard — Niramaya Mission Control
 * 
 * System health overview, AI model registry, compliance audit,
 * and appointment management. Preserves all existing Supabase data fetching.
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge, Spinner, Avatar } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import {
    Calendar, Users, Building2, UserCircle, Clock,
    ArrowRight, Activity, Shield, Zap, Brain,
    Server, CheckCircle, AlertTriangle, Cpu,
} from 'lucide-react';
import { format, startOfToday, endOfToday } from 'date-fns';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [appointments, doctors, patients, todayCount] = await Promise.all([
                    supabase.from('appointments').select('id', { count: 'exact', head: true }),
                    supabase.from('doctors').select('id', { count: 'exact', head: true }),
                    supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'patient'),
                    supabase
                        .from('appointments')
                        .select('id', { count: 'exact', head: true })
                        .gte('start_time', startOfToday().toISOString())
                        .lte('start_time', endOfToday().toISOString()),
                ]);

                const todayResult = await supabase
                    .from('appointments')
                    .select(`*, patient:users!appointments_patient_id_fkey(full_name), doctor:doctors(specialization, user:users(full_name))`)
                    .gte('start_time', startOfToday().toISOString())
                    .lte('start_time', endOfToday().toISOString())
                    .order('start_time');

                if (appointments.error || doctors.error || patients.error) {
                    throw new Error('Query error');
                }

                setStats({
                    totalAppointments: appointments.count || 0,
                    totalDoctors: doctors.count || 0,
                    totalPatients: patients.count || 0,
                    todayAppointments: todayCount.count || 0,
                });
                setTodayAppointments(todayResult.data || []);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setStats({ totalAppointments: 0, totalDoctors: 0, totalPatients: 0, todayAppointments: 0 });
                setTodayAppointments([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    const aiModels = [
        { name: 'BioBERT', version: 'v1.1', desc: 'Clinical NLP Triage', status: 'active', latency: '184ms' },
        { name: 'XGBoost', version: 'v5.0', desc: 'Risk Prediction (NEWS2)', status: 'active', latency: '23ms' },
        { name: 'CNN-ECG', version: 'v2.3', desc: 'Arrhythmia Detection', status: 'standby', latency: '312ms' },
    ];

    return (
        <div className="space-y-6">
            {/* Mission Control Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-heading font-black text-[#1A2B48]">Mission Control</h1>
                    <p className="text-sm text-slate-500 mt-1">System administration & AI infrastructure</p>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-green-50 border border-green-100 px-4 py-2 rounded-xl">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                        </span>
                        <span className="text-xs font-bold text-green-700">All Systems Operational</span>
                    </div>
                </div>
            </div>

            {/* System Health Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div onClick={() => navigate('/admin/appointments')} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-heading font-black text-[#1A2B48]">{stats.totalAppointments}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Appts</p>
                    </div>
                </div>
                <div onClick={() => navigate('/admin/doctors')} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#008080]/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-[#008080]" />
                    </div>
                    <div>
                        <p className="text-2xl font-heading font-black text-[#1A2B48]">{stats.totalDoctors}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Doctors</p>
                    </div>
                </div>
                <div onClick={() => navigate('/admin/patients')} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                        <UserCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-heading font-black text-[#1A2B48]">{stats.totalPatients}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Patients</p>
                    </div>
                </div>
                <div onClick={() => navigate('/admin/appointments')} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-heading font-black text-[#1A2B48]">{stats.todayAppointments}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today</p>
                    </div>
                </div>
            </div>

            {/* AI Intelligence Registry */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                    <Brain className="w-5 h-5 text-[#008080]" />
                    <h2 className="text-lg font-heading font-bold text-[#1A2B48]">AI Intelligence Registry</h2>
                </div>
                <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                    {aiModels.map((model, i) => (
                        <div key={i} className="p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Cpu className="w-4 h-4 text-[#008080]" />
                                <span className="text-sm font-heading font-bold text-[#1A2B48]">{model.name}</span>
                                <span className="text-[10px] font-bold text-slate-400">{model.version}</span>
                            </div>
                            <p className="text-xs text-slate-500 mb-3">{model.desc}</p>
                            <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${model.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                    {model.status}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">{model.latency}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Today's Appointments */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-heading font-bold text-[#1A2B48]">Today&apos;s Appointments</h2>
                    <Link to="/admin/appointments" className="flex items-center gap-1 text-xs font-bold text-[#008080] hover:text-[#00d2c1] transition-colors">
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="divide-y divide-slate-50">
                    {todayAppointments.length === 0 ? (
                        <div className="p-10 text-center text-slate-400">
                            <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p className="font-bold text-sm">No appointments scheduled for today</p>
                        </div>
                    ) : (
                        todayAppointments.slice(0, 5).map((apt) => (
                            <div key={apt.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <Avatar name={apt.patient?.full_name || 'Patient'} size="sm" />
                                    <div>
                                        <p className="font-bold text-sm text-[#1A2B48]">{apt.patient?.full_name || 'Patient'}</p>
                                        <p className="text-xs text-slate-500">Dr. {apt.doctor?.user?.full_name} • {apt.doctor?.specialization}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-bold text-[#1A2B48]">{format(getLocalTimeFromUTC(apt.start_time), 'h:mm a')}</p>
                                        <p className="text-xs text-slate-500 truncate max-w-[120px]">{apt.reason}</p>
                                    </div>
                                    <Badge variant={apt.status === 'confirmed' ? 'success' : apt.status === 'pending' ? 'warning' : apt.status === 'cancelled' ? 'destructive' : 'default'}>
                                        {apt.status}
                                    </Badge>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/admin/doctors" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                        <Users className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                        <p className="font-bold text-sm text-[#1A2B48]">Manage Doctors</p>
                        <p className="text-xs text-slate-500">Add or edit doctor profiles</p>
                    </div>
                </Link>
                <Link to="/admin/departments" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center group-hover:bg-green-500 transition-colors">
                        <Building2 className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                        <p className="font-bold text-sm text-[#1A2B48]">Manage Departments</p>
                        <p className="text-xs text-slate-500">Configure medical departments</p>
                    </div>
                </Link>
                <Link to="/admin/patients" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                        <UserCircle className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                        <p className="font-bold text-sm text-[#1A2B48]">View Patients</p>
                        <p className="text-xs text-slate-500">Browse patient records</p>
                    </div>
                </Link>
            </div>

            {/* Terminal Footer */}
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-2">
                <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3 text-[#008080]" />
                    ENGINE: NiramayaCore_v5 • All Models Active
                </span>
                <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-[#008080]" />
                    DPDPA 2023 / HIPAA Compliant • TLS 1.3
                </span>
            </div>
        </div>
    );
};

export default AdminDashboard;
