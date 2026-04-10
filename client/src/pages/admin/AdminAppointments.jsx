import { getLocalTimeFromUTC } from '@/lib/utils';
/**
 * Admin Appointments Page — Niramaya System Engine
 * 
 * View all appointments with filtering.
 * All Supabase backend logic preserved.
 */
import { useState, useEffect } from 'react';
import { Spinner } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { Search, CheckCircle, XCircle, Calendar, ChevronDown, Clock } from 'lucide-react';

const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

const statusColors = {
    confirmed: 'bg-[#0D9488] text-white',
    pending: 'bg-amber-500 text-white',
    completed: 'bg-slate-500 text-white',
    cancelled: 'bg-red-500 text-white',
};

const AdminAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        fetchAppointments();
    }, [statusFilter]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('appointments')
                .select(`
                    *,
                    patient:users!appointments_patient_id_fkey(full_name, email),
                    doctor:doctors(
                        specialization,
                        user:users(full_name)
                    )
                `)
                .order('start_time', { ascending: false });

            if (statusFilter) {
                query = query.eq('status', statusFilter);
            }

            const { data, error } = await query;

            if (error) throw error;
            setAppointments(data || []);
        } catch (err) {
            console.error('Error fetching appointments:', err);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (id) => {
        try {
            await supabase
                .from('appointments')
                .update({ status: 'confirmed' })
                .eq('id', id);
            fetchAppointments();
        } catch (err) {
            console.error('Failed to confirm:', err);
        }
    };

    const handleCancel = async (id) => {
        try {
            await supabase
                .from('appointments')
                .update({ status: 'cancelled' })
                .eq('id', id);
            fetchAppointments();
        } catch (err) {
            console.error('Failed to cancel:', err);
        }
    };

    const filteredAppointments = search
        ? appointments.filter(
            (apt) =>
                apt.patient?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                apt.doctor?.user?.full_name?.toLowerCase().includes(search.toLowerCase())
        )
        : appointments;

    const inputClasses = "w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-[#0B1120] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent transition-all";

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-[#0D9488]" />
                    <span className="text-[10px] font-black text-[#0D9488] uppercase tracking-widest">Dispatch Queue</span>
                </div>
                <h1 className="text-2xl font-heading font-black text-[#0B1120]">Appointments</h1>
                <p className="text-sm text-slate-500 mt-1">Manage all patient appointment records across the platform</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 max-w-md relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by patient or doctor..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`${inputClasses} pl-11`}
                    />
                </div>
                <div className="w-48">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={inputClasses}
                    >
                        {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Appointments */}
            {loading ? (
                <div className="p-8 flex justify-center">
                    <Spinner size="lg" />
                </div>
            ) : filteredAppointments.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 shadow-sm">
                    No appointments found.
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredAppointments.map((apt) => {
                        const isExpanded = expandedId === apt.id;
                        return (
                            <div key={apt.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                {/* Collapsed Header */}
                                <div
                                    className="p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                                    onClick={() => setExpandedId(isExpanded ? null : apt.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-[#0B1120] border border-slate-200 flex-shrink-0">
                                                {apt.patient?.full_name?.charAt(0) || 'P'}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-heading font-bold text-[#0B1120] truncate text-sm">
                                                    {apt.patient?.full_name}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate">
                                                    Dr. {apt.doctor?.user?.full_name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-1 text-[9px] font-black rounded uppercase ${statusColors[apt.status] || 'bg-slate-200 text-slate-500'}`}>
                                                {apt.status}
                                            </span>
                                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 pt-0 border-t border-slate-100 bg-slate-50/50 space-y-3">
                                        <div className="grid grid-cols-2 gap-4 pt-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                <span className="text-xs font-medium text-[#0B1120]">{format(getLocalTimeFromUTC(apt.start_time), 'MMM d, yyyy')}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="w-4 h-4 text-slate-400" />
                                                <span className="text-xs font-medium text-[#0B1120]">{format(getLocalTimeFromUTC(apt.start_time), 'h:mm a')}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Reason</p>
                                            <p className="text-sm text-[#0B1120]">{apt.reason || 'No reason provided'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Patient Email</p>
                                            <p className="text-sm font-mono text-[#0B1120]">{apt.patient?.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Doctor</p>
                                            <p className="text-sm text-[#0B1120]">Dr. {apt.doctor?.user?.full_name} — {apt.doctor?.specialization}</p>
                                        </div>

                                        {/* Actions */}
                                        {apt.status === 'pending' && (
                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleConfirm(apt.id); }}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2 border border-[#0D9488] text-[#0D9488] text-xs font-bold rounded-lg hover:bg-[#0D9488]/10 transition-colors"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleCancel(apt.id); }}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2 border border-red-300 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdminAppointments;
