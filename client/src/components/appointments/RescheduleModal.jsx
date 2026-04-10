/**
 * Reschedule Appointment Modal
 */
import { useState, useEffect } from 'react';
import { format, addDays, startOfDay, parseISO } from 'date-fns';
import { Modal, Button, Alert, Calendar, Spinner } from '@/components/ui';
import { getDoctorAppointments } from '@/services/doctors';
import { rescheduleAppointment } from '@/services/appointments';
import { getAvailableSlots } from '@/services/timeSlotUtils';
import { useToast } from '@/components/ui/Toast';

const RescheduleModal = ({ isOpen, onClose, appointment, onSuccess }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [existingAppointments, setExistingAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { toast } = useToast();

    const doctor = appointment?.doctor;

    // Fetch doctor's appointments
    useEffect(() => {
        if (!isOpen || !doctor?.id) return;

        const fetchAppointments = async () => {
            try {
                const startDate = new Date().toISOString();
                const endDate = addDays(new Date(), 30).toISOString();
                const appointments = await getDoctorAppointments(
                    doctor.id,
                    startDate,
                    endDate
                );
                // Exclude current appointment from blockers
                setExistingAppointments(
                    appointments.filter((a) => a.id !== appointment.id)
                );
            } catch (err) {
                console.error('Failed to fetch appointments:', err);
            }
        };
        fetchAppointments();
    }, [isOpen, doctor?.id, appointment?.id]);

    // Calculate slots when date changes
    useEffect(() => {
        if (!selectedDate || !doctor) return;

        setSlotsLoading(true);
        setSelectedSlot(null);

        try {
            const slots = getAvailableSlots(
                selectedDate,
                doctor,
                existingAppointments
            );
            setAvailableSlots(slots);
        } catch (err) {
            setError('Failed to load available slots.');
        } finally {
            setSlotsLoading(false);
        }
    }, [selectedDate, doctor, existingAppointments]);

    const handleReschedule = async () => {
        if (!selectedSlot) {
            setError('Please select a new time slot.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await rescheduleAppointment(appointment.id, selectedSlot.isoString);
            toast.success('Appointment rescheduled successfully');
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to reschedule appointment');
            toast.error(err.message || 'Failed to reschedule');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedDate(null);
        setSelectedSlot(null);
        setError(null);
        onClose();
    };

    const disabledDays = {
        before: startOfDay(new Date()),
        after: addDays(new Date(), 30),
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Reschedule Appointment"
            size="lg"
        >
            <div className="space-y-4">
                {error && (
                    <Alert variant="error" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                <p className="text-gray-600">
                    Select a new date and time for your appointment with{' '}
                    <span className="font-medium">
                        Dr. {doctor?.user?.full_name}
                    </span>
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Calendar */}
                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">Select Date</h4>
                        <Calendar
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={disabledDays}
                        />
                    </div>

                    {/* Time Slots */}
                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                            {selectedDate
                                ? `Available Slots for ${format(selectedDate, 'MMM d')}`
                                : 'Select a date first'}
                        </h4>

                        {!selectedDate ? (
                            <div className="text-center py-8 text-gray-500">
                                Please select a date to see available slots.
                            </div>
                        ) : slotsLoading ? (
                            <div className="flex justify-center py-8">
                                <Spinner />
                            </div>
                        ) : availableSlots.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No slots available on this date.
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                                {availableSlots.map((slot) => (
                                    <Button
                                        key={slot.time}
                                        variant={selectedSlot?.time === slot.time ? 'primary' : 'outline'}
                                        size="sm"
                                        onClick={() => setSelectedSlot(slot)}
                                        className="justify-center"
                                    >
                                        {slot.label}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal.Footer>
                <Button variant="ghost" onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleReschedule}
                    isLoading={loading}
                    disabled={!selectedSlot}
                >
                    Reschedule
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default RescheduleModal;
