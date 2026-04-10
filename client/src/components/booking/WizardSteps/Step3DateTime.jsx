/**
 * Step 3: Date & Time Selection
 */
import { useState, useEffect } from 'react';
import { format, addDays, startOfDay } from 'date-fns';
import { useBooking } from '@/contexts/BookingContext';
import { getDoctorAppointments } from '@/services/doctors';
import { getAvailableSlots } from '@/services/timeSlotUtils';
import { Card, Spinner, Alert, Button, Calendar } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ArrowLeft, Clock } from 'lucide-react';

const Step3DateTime = () => {
    const { selection, setDateTime, nextStep, prevStep } = useBooking();
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [existingAppointments, setExistingAppointments] = useState([]);

    // Fetch existing appointments for the doctor
    useEffect(() => {
        const fetchAppointments = async () => {
            if (!selection.doctor?.id) return;

            try {
                const startDate = new Date().toISOString();
                const endDate = addDays(new Date(), 30).toISOString();
                const appointments = await getDoctorAppointments(
                    selection.doctor.id,
                    startDate,
                    endDate
                );
                setExistingAppointments(appointments);
            } catch (err) {
                console.error('Failed to fetch appointments:', err);
            }
        };
        fetchAppointments();
    }, [selection.doctor?.id]);

    // Calculate available slots when date changes
    useEffect(() => {
        if (!selectedDate || !selection.doctor) return;

        setLoading(true);
        setSelectedSlot(null);

        try {
            const slots = getAvailableSlots(
                selectedDate,
                selection.doctor,
                existingAppointments
            );
            setAvailableSlots(slots);

            if (slots.length === 0) {
                setError('No slots available on this date. Please try another day.');
            } else {
                setError(null);
            }
        } catch (err) {
            setError('Failed to load available slots.');
        } finally {
            setLoading(false);
        }
    }, [selectedDate, selection.doctor, existingAppointments]);

    const handleDateSelect = (date) => {
        setSelectedDate(date);
    };

    const handleSlotSelect = (slot) => {
        setSelectedSlot(slot);
    };

    const handleContinue = () => {
        if (selectedDate && selectedSlot) {
            setDateTime(format(selectedDate, 'yyyy-MM-dd'), selectedSlot.isoString);
            nextStep();
        }
    };

    // Disable past dates and dates more than 30 days ahead
    const disabledDays = {
        before: startOfDay(new Date()),
        after: addDays(new Date(), 30),
    };

    return (
        <div>
            {/* Header with Navigation */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={prevStep}
                    className="gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Doctor
                </Button>
                <div className="sm:text-right">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Select Date & Time
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">
                        Dr. {selection.doctor?.user?.full_name}
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Calendar */}
                <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Choose a Date</h3>
                    <Calendar
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={disabledDays}
                    />
                </div>

                {/* Time Slots */}
                <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                        {selectedDate
                            ? `Available Slots for ${format(selectedDate, 'MMMM d, yyyy')}`
                            : 'Select a date first'}
                    </h3>

                    {!selectedDate ? (
                        <Card className="p-8 text-center text-gray-500">
                            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            Please select a date to see available time slots.
                        </Card>
                    ) : loading ? (
                        <div className="flex justify-center py-8">
                            <Spinner />
                        </div>
                    ) : error ? (
                        <Alert variant="warning">{error}</Alert>
                    ) : (
                        <div className="grid grid-cols-3 gap-2">
                            {availableSlots.map((slot) => (
                                <Button
                                    key={slot.time}
                                    variant={selectedSlot?.time === slot.time ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleSlotSelect(slot)}
                                    className="justify-center"
                                >
                                    {slot.label}
                                </Button>
                            ))}
                        </div>
                    )}

                    {/* Continue Button */}
                    {selectedSlot && (
                        <div className="mt-6">
                            <Button onClick={handleContinue} className="w-full">
                                Continue with {selectedSlot.label}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Step3DateTime;
