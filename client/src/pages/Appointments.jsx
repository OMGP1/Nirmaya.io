/**
 * Appointments Page
 * 
 * List of user's appointments with reschedule/cancel modals.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { getUpcomingAppointments, getPastAppointments } from '@/services/appointments';
import { AppointmentCard, RescheduleModal, CancelModal } from '@/components/appointments';
import { Button, Spinner, Tabs, Alert, Skeleton } from '@/components/ui';
import { Plus, Calendar } from 'lucide-react';

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
        <DashboardLayout>
            {/* Header */}
            <div className="flex items-center justify-between mb-6 animate-slide-up">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
                    <p className="text-gray-600">Manage your healthcare appointments</p>
                </div>
                <Link to="/book">
                    <Button leftIcon={<Plus className="w-4 h-4" />}>
                        Book New
                    </Button>
                </Link>
            </div>

            {error && (
                <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === 'upcoming' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Upcoming ({upcomingAppointments.length})
                    {activeTab === 'upcoming' && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('past')}
                    className={`px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === 'past' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Past ({pastAppointments.length})
                    {activeTab === 'past' && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
                    )}
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="space-y-4">
                    <Skeleton.Card />
                    <Skeleton.Card />
                </div>
            ) : appointments.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No {activeTab} appointments
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {activeTab === 'upcoming'
                            ? "You don't have any upcoming appointments."
                            : "You don't have any past appointments."}
                    </p>
                    {activeTab === 'upcoming' && (
                        <Link to="/book">
                            <Button>Book an Appointment</Button>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
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
        </DashboardLayout>
    );
};

export default Appointments;
