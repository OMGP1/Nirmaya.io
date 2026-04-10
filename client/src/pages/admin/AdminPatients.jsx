/**
 * Admin Patients Page — Niramaya System Engine
 * All Supabase backend logic preserved.
 */
import { useState, useEffect } from 'react';
import { Spinner } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { Search, Mail, Phone, Calendar, ChevronDown, UserCircle } from 'lucide-react';
import { format } from 'date-fns';

const AdminPatients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'patient')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPatients(data || []);
        } catch (err) {
            console.error('Error fetching patients:', err);
            setPatients([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = search
        ? patients.filter(
            (p) =>
                p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                p.email?.toLowerCase().includes(search.toLowerCase())
        )
        : patients;

    const inputClasses = "w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-[#0B1120] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent transition-all";

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-1">
                    <UserCircle className="w-4 h-4 text-[#0D9488]" />
                    <span className="text-[10px] font-black text-[#0D9488] uppercase tracking-widest">Patient Registry</span>
                </div>
                <h1 className="text-2xl font-heading font-black text-[#0B1120]">Patients</h1>
                <p className="text-sm text-slate-500 mt-1">View registered patient records and profiles</p>
            </div>

            {/* Search */}
            <div className="mb-6 max-w-md">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`${inputClasses} pl-11`}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                </div>
            ) : filteredPatients.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 shadow-sm">
                    No patients found.
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredPatients.map((patient) => {
                        const isExpanded = expandedId === patient.id;
                        return (
                            <div key={patient.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                {/* Collapsed Header */}
                                <div
                                    className="p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                                    onClick={() => setExpandedId(isExpanded ? null : patient.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-sm font-bold text-purple-600 border border-purple-100 flex-shrink-0">
                                                {patient.full_name?.charAt(0) || 'P'}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-heading font-bold text-[#0B1120] truncate text-sm">
                                                    {patient.full_name}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate">
                                                    {patient.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="px-2 py-1 text-[9px] font-black rounded uppercase bg-[#0D9488] text-white">Active</span>
                                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 pt-0 border-t border-slate-100 bg-slate-50/50 space-y-3">
                                        <div className="pt-3">
                                            <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Patient ID</p>
                                            <p className="text-sm font-mono text-[#0B1120]">{patient.id}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="w-4 h-4 text-slate-400" />
                                            <span className="text-xs text-[#0B1120]">{patient.email}</span>
                                        </div>
                                        {patient.phone && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="w-4 h-4 text-slate-400" />
                                                <span className="text-xs text-[#0B1120]">{patient.phone}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span className="text-xs text-[#0B1120]">Joined {format(new Date(patient.created_at), 'MMM d, yyyy')}</span>
                                        </div>
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

export default AdminPatients;
