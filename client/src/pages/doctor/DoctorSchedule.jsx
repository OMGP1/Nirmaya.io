/**
 * Doctor Schedule — Weekly Operations Grid
 * 
 * Weekly calendar view of appointments with dark day headers.
 * All Supabase fetch + week navigation logic preserved.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui';
import { ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { getLocalTimeFromUTC } from '@/lib/utils';

const DoctorSchedule = () => {
    const { user } = useAuth();
    const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoading(true);
                if (!user) return;

                const { data: doctor, error: doctorError } = await supabase
                    .from('doctors')
                    .select('id')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (doctorError || !doctor) {
                    console.error('Doctor not found:', doctorError);
                    return;
                }

                const startDate = currentWeek.toISOString();
                const endDate = addDays(currentWeek, 7).toISOString();

                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005';
                const { data: { session } } = await supabase.auth.getSession();
                
                if (!session?.access_token) {
                    throw new Error("Not authenticated");
                }

                const url = new URL(`${API_URL}/api/doctor/appointments`);
                url.searchParams.append('start_date', startDate);
                url.searchParams.append('end_date', endDate);

                const res = await fetch(url.toString(), {
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                });

                const json = await res.json();

                if (!res.ok) {
                    throw new Error(json.error?.message || 'Failed to fetch schedule');
                }

                setAppointments(json.data?.appointments || []);
            } catch (err) {
                console.error('Failed to fetch schedule:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchAppointments();
        }
    }, [user, currentWeek]);

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

    const getAppointmentsForDay = (date) => {
        return appointments.filter((apt) => isSameDay(getLocalTimeFromUTC(apt.start_time), date));
    };

    const statusConfig = {
        pending: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-400' },
        confirmed: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', dot: 'bg-green-400' },
        completed: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', dot: 'bg-slate-400' },
        cancelled: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', dot: 'bg-red-400' },
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-xl font-heading font-black text-[#0B1120] tracking-tight">Weekly Operations Grid</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-[#1F2937]/60 uppercase tracking-wider">
                            {format(currentWeek, 'MMMM d')} — {format(addDays(currentWeek, 6), 'MMMM d, yyyy')}
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
                        className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
                    >
                        <ChevronLeft className="w-4 h-4 text-[#1F2937]" />
                    </button>
                    <button
                        onClick={() => setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all text-xs font-black text-[#1F2937] uppercase"
                    >
                        Today
                    </button>
                    <button
                        onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
                        className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
                    >
                        <ChevronRight className="w-4 h-4 text-[#1F2937]" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                </div>
            ) : (
                <div className="overflow-x-auto -mx-4 px-4 pb-4">
                    <div className="grid grid-cols-7 gap-2 min-w-[700px]">
                        {/* Day Headers */}
                        {weekDays.map((day) => {
                            const isToday = isSameDay(day, new Date());
                            return (
                                <div
                                    key={day.toISOString()}
                                    className={`text-center p-3 rounded-t-xl ${
                                        isToday
                                            ? 'bg-[#0B1120] text-white'
                                            : 'bg-slate-50 text-[#1F2937] border border-slate-200'
                                    }`}
                                >
                                    <p className="text-[10px] font-black uppercase tracking-widest">{format(day, 'EEE')}</p>
                                    <p className="text-xl font-heading font-black">{format(day, 'd')}</p>
                                </div>
                            );
                        })}

                        {/* Day Columns */}
                        {weekDays.map((day) => {
                            const dayAppointments = getAppointmentsForDay(day);
                            return (
                                <div
                                    key={day.toISOString() + '-content'}
                                    className="min-h-[200px] bg-white rounded-b-xl p-2 space-y-2 border border-t-0 border-slate-200"
                                >
                                    {dayAppointments.length === 0 ? (
                                        <p className="text-[10px] text-slate-400 text-center py-6 font-medium">No appts</p>
                                    ) : (
                                        dayAppointments.map((apt) => {
                                            const sc = statusConfig[apt.status] || statusConfig.pending;
                                            return (
                                                <Link
                                                    key={apt.id}
                                                    to={`/doctor/appointments/${apt.id}`}
                                                    className={`block p-2.5 rounded-xl border text-xs transition-all hover:shadow-md hover:-translate-y-0.5 ${sc.bg} ${sc.border}`}
                                                >
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                                        <p className={`font-black ${sc.text}`}>
                                                            {format(getLocalTimeFromUTC(apt.start_time), 'h:mm a')}
                                                        </p>
                                                    </div>
                                                    <p className="text-[#1F2937] font-bold truncate">{apt.patient?.full_name?.split(' ')[0]}</p>
                                                </Link>
                                            );
                                        })
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs">
                {Object.entries(statusConfig).map(([status, sc]) => (
                    <div key={status} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${sc.dot}`} />
                        <span className="font-bold text-[#1F2937] capitalize">{status}</span>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-[10px] pt-2">
                <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-[#0D9488]" />
                    <span className="font-black text-[#1F2937] uppercase tracking-tighter">Schedule Engine: Synced</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                    <span className="font-black text-[#10b981] uppercase">Real-time</span>
                </div>
            </div>
        </div>
    );
};

export default DoctorSchedule;
