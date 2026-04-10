/**
 * Appointments Page — Niramaya UI
 * 
 * List of user's appointments with reschedule/cancel modals.
 * Replaces old DashboardLayout with PatientSidebar layout.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import PatientSidebar from '@/components/layout/PatientSidebar';
import { getUpcomingAppointments, getPastAppointments } from '@/services/appointments';
import { AppointmentCard, RescheduleModal, CancelModal } from '@/components/appointments';
import { Spinner, Skeleton } from '@/components/ui';
import { Plus, Calendar, Activity } from 'lucide-react';

const Appointments = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('upcoming');
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [pastAppointments, setPastAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [rescheduleModal, setRescheduleModal] = useState({ open: false, appointment: null });
    const [cancelModal, setCancelModal] = useState({ open: false, appointment: null });

    const fetchAppointments = async () => {
        if (!user?.id) return;

        setLoading(true);
        setError(null);

        try {
            const [upcoming, past] = await Promise.all([
                getUpcomingAppointments(user.id),
                getPastAppointments(user.id),
            ]);
            setUpcomingAppointments(upcoming);
            setPastAppointments(past);
        } catch (err) {
            setError('Failed to load appointments. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [user?.id]);

    const handleReschedule = (appointment) => {
        setRescheduleModal({ open: true, appointment });
    };

    const handleCancel = (appointment) => {
        setCancelModal({ open: true, appointment });
    };

    const handleModalSuccess = () => {
        fetchAppointments(); // Refresh list
    };

    const appointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

    return (
        <div className="h-screen w-full bg-slate-50 flex flex-row overflow-hidden relative">
            <PatientSidebar />
            
            <main className="flex-1 flex flex-col h-screen overflow-y-auto relative w-full">
                {/* Header / Banner */}
                <div className="bg-white border-b border-slate-200 px-6 pt-16 pb-8 sm:py-8 sm:px-12 flex flex-col space-y-4 sm:flex-row sm:items-end justify-between shrink-0">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-[#008080]/10 rounded-xl flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-[#008080]" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-[#008080]" />
                                <span className="text-xs font-bold text-[#008080] uppercase tracking-wider">Clinical Schedule</span>
                            </div>
                        </div>
                        <h1 className="text-3xl font-heading font-black text-[#1A2B48]">
                            My Appointments
                        </h1>
                        <p className="text-sm text-slate-500 mt-2 max-w-2xl">
                            Manage your healthcare appointments, reschedule visits, or book new consultations with specialists.
                        </p>
                    </div>
                    
                    <Link to="/book" className="flex-shrink-0">
                        <button className="px-6 py-3 bg-[#008080] text-white text-sm font-bold rounded-xl shadow-sm hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,128,128,0.3)] transition-all flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Book New Visit
                        </button>
                    </Link>
                </div>

                <div className="p-6 md:p-8 max-w-5xl mx-auto w-full flex-1">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-red-600 flex items-center justify-between mb-6">
                            <span>{error}</span>
                            <button onClick={() => setError(null)} className="hover:text-red-800">Dismiss</button>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex gap-4 border-b border-slate-200 mb-8">
                        <button
                            onClick={() => setActiveTab('upcoming')}
                            className={`pb-4 px-2 text-sm font-bold font-heading uppercase tracking-wider transition-colors relative ${
                                activeTab === 'upcoming' ? 'text-[#008080]' : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            Upcoming ({upcomingAppointments.length})
                            {activeTab === 'upcoming' && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#008080] rounded-t-full shadow-[0_0_8px_rgba(0,128,128,0.5)]" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('past')}
                            className={`pb-4 px-2 text-sm font-bold font-heading uppercase tracking-wider transition-colors relative ${
                                activeTab === 'past' ? 'text-[#008080]' : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            Past ({pastAppointments.length})
                            {activeTab === 'past' && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#008080] rounded-t-full shadow-[0_0_8px_rgba(0,128,128,0.5)]" />
                            )}
                        </button>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton.Card />
                            <Skeleton.Card />
                            <Skeleton.Card />
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <Calendar className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-heading font-black text-[#1A2B48] mb-2">
                                No {activeTab} appointments
                            </h3>
                            <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm">
                                {activeTab === 'upcoming'
                                    ? "You don't have any upcoming clinical visits scheduled in your calendar."
                                    : "You don't have any historical clinical visits in your records."}
                            </p>
                            {activeTab === 'upcoming' && (
                                <Link to="/book">
                                    <button className="px-6 py-3 bg-[#1A2B48] text-white text-sm font-bold rounded-xl shadow-sm hover:bg-[#253d66] transition-colors">
                                        Book an Appointment
                                    </button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {appointments.map((appointment) => (
                                <AppointmentCard
                                    key={appointment.id}
                                    appointment={appointment}
                                    onReschedule={handleReschedule}
                                    onCancel={handleCancel}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Modals */}
                <RescheduleModal
                    isOpen={rescheduleModal.open}
                    onClose={() => setRescheduleModal({ open: false, appointment: null })}
                    appointment={rescheduleModal.appointment}
                    onSuccess={handleModalSuccess}
                />

                <CancelModal
                    isOpen={cancelModal.open}
                    onClose={() => setCancelModal({ open: false, appointment: null })}
                    appointment={cancelModal.appointment}
                    onSuccess={handleModalSuccess}
                />
            </main>
        </div>
    );
};

export default Appointments;
