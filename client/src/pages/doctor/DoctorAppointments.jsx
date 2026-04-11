import { getLocalTimeFromUTC } from '@/lib/utils';
/**
 * Doctor Appointments — Patient Queue
 * 
 * Filterable appointment list with AI risk alerts.
 * All Supabase fetch + status update logic preserved.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui';
import {
    Search, ChevronRight, Calendar, Check, X, AlertCircle,
    Brain, Activity, Clock, Users,
} from 'lucide-react';

const DoctorAppointments = () => {
    const { user } = useAuth();
    const [doctorId, setDoctorId] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [riskData, setRiskData] = useState({});

    useEffect(() => {
        const getDoctorId = async () => {
            if (!user) return;

            const { data: doctor, error } = await supabase
                .from('doctors')
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) {
                console.error('Error getting doctor ID:', error);
                setError('Doctor profile not found');
                setLoading(false);
                return;
            }

            setDoctorId(doctor.id);
        };

        getDoctorId();
    }, [user]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            setError(null);

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005';
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session?.access_token) {
                throw new Error("Not authenticated");
            }

            const url = new URL(`${API_URL}/api/doctor/appointments`);
            if (filter !== 'all') {
                url.searchParams.append('status', filter);
            }

            const res = await fetch(url.toString(), {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.error?.message || 'Failed to fetch tracking data');
            }

            setAppointments(json.data?.appointments || []);
        } catch (err) {
            console.error('Failed to fetch appointments:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchAppointments();
        }
    }, [user, filter]);

    useEffect(() => {
        const fetchRisks = async () => {
            if (!appointments.length) return;
            const patientIds = [...new Set(appointments.map((a) => a.patient?.id).filter(Boolean))];
            if (!patientIds.length) return;

            const { data } = await supabase
                .from('health_assessments')
                .select('*')
                .in('patient_id', patientIds)
                .order('created_at', { ascending: false });

            if (data) {
                const map = {};
                data.forEach((r) => {
                    if (!map[r.patient_id]) map[r.patient_id] = r;
                });
                setRiskData(map);
            }
        };
        fetchRisks();
    }, [appointments]);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            setActionLoading(id);

            const { error } = await supabase
                .from('appointments')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) {
                throw error;
            }

            await fetchAppointments();
        } catch (err) {
            console.error('Status update error:', err);
            alert('Failed to update appointment status');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredAppointments = appointments.filter((apt) => {
        if (!search) return true;
        const query = search.toLowerCase();
        return (
            apt.patient?.full_name?.toLowerCase().includes(query) ||
            apt.reason?.toLowerCase().includes(query)
        );
    });

    const statusColors = {
        pending: 'text-amber-700 bg-amber-50 border-amber-200',
        confirmed: 'text-green-700 bg-green-50 border-green-200',
        completed: 'text-slate-700 bg-slate-50 border-slate-200',
        cancelled: 'text-red-700 bg-red-50 border-red-200',
    };

    const filters = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

    if (loading && !appointments.length) {
        return (
            <div className="flex justify-center py-12">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-xl font-heading font-black text-[#0B1120] tracking-tight">Patient Queue</h1>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-[#1F2937]/60 uppercase tracking-wider">Appointment Management</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        placeholder="Search by patient name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pl-10 text-sm text-[#1F2937] placeholder:text-slate-400 focus:ring-2 focus:ring-[#0D9488] focus:border-transparent outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {filters.map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg border transition-all capitalize ${
                                filter === status
                                    ? 'bg-[#0B1120] text-white border-[#0B1120]'
                                    : 'bg-white text-[#1F2937] border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Appointments List */}
            {error ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center text-red-600">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-bold">{error}</p>
                </div>
            ) : filteredAppointments.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-bold text-sm text-[#1F2937]">No appointments found</p>
                    <p className="text-xs text-slate-500 mt-1">Try adjusting your filters</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredAppointments.map((apt) => {
                        const risk = riskData[apt.patient?.id];
                        const hasRisk = risk && risk.risk_level !== 'low';
                        const isHigh = risk?.risk_level === 'high';

                        return (
                            <div key={apt.id} className="bg-white rounded-[16px] border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
                                <div className="p-5 space-y-3">
                                    {/* Main row */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-sm font-bold text-[#0B1120] border border-slate-200 shrink-0">
                                            {apt.patient?.full_name?.charAt(0) || 'P'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-heading font-bold text-sm text-[#1F2937] truncate">{apt.patient?.full_name}</p>
                                            <p className="text-xs text-slate-500 truncate">{apt.reason || 'No reason provided'}</p>
                                        </div>
                                        <Link to={`/doctor/appointments/${apt.id}`} className="p-2 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200">
                                            <ChevronRight className="w-5 h-5 text-slate-400" />
                                        </Link>
                                    </div>

                                    {/* AI Risk Alert */}
                                    {hasRisk && (
                                        <div className={`flex items-start gap-3 p-3 rounded-xl border ${
                                            isHigh ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                                        }`}>
                                            <Brain className={`w-5 h-5 mt-0.5 shrink-0 ${isHigh ? 'text-red-500' : 'text-amber-500'}`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-xs font-black uppercase ${isHigh ? 'text-red-700' : 'text-amber-700'}`}>
                                                        AI Alert: {isHigh ? 'High' : 'Moderate'} Cardiovascular Risk
                                                    </span>
                                                    <span className={`px-2 py-0.5 text-[9px] font-black rounded border ${
                                                        isHigh ? 'text-red-700 bg-red-100 border-red-200' : 'text-amber-700 bg-amber-100 border-amber-200'
                                                    }`}>
                                                        {Number(risk.risk_score).toFixed(0)}%
                                                    </span>
                                                </div>
                                                {risk.recommendations?.slice(0, 2).map((rec, i) => (
                                                    <p key={i} className="text-xs text-slate-600">• {rec}</p>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Bottom row */}
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="text-xs">
                                                <p className="font-bold text-[#1F2937]">{format(getLocalTimeFromUTC(apt.start_time), 'MMM d, yyyy')}</p>
                                                <p className="text-slate-500 font-mono">{format(getLocalTimeFromUTC(apt.start_time), 'h:mm a')}</p>
                                            </div>
                                            <span className={`px-2.5 py-1 text-[9px] font-black rounded-lg border uppercase ${statusColors[apt.status] || statusColors.pending}`}>
                                                {apt.status}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            {apt.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(apt.id, 'confirmed')}
                                                        disabled={actionLoading === apt.id}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-all uppercase disabled:opacity-40"
                                                    >
                                                        <Check className="w-3.5 h-3.5" /> Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(apt.id, 'cancelled')}
                                                        disabled={actionLoading === apt.id}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all uppercase disabled:opacity-40"
                                                    >
                                                        <X className="w-3.5 h-3.5" /> Reject
                                                    </button>
                                                </>
                                            )}
                                            {apt.status === 'confirmed' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(apt.id, 'completed')}
                                                    disabled={actionLoading === apt.id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-white bg-[#0D9488] rounded-lg shadow-sm hover:brightness-110 transition-all uppercase disabled:opacity-40"
                                                >
                                                    <Check className="w-3.5 h-3.5" /> Complete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DoctorAppointments;
