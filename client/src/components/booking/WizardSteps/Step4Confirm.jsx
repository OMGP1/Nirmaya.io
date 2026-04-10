/**
 * Step 4: Confirm Booking
 */
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { getLocalTimeFromUTC } from '@/lib/utils';
import { useBooking } from '@/contexts/BookingContext';
import { useAuth } from '@/hooks/useAuth';
import { bookAppointment } from '@/services/appointments';
import { Card, Button, Input, Alert, Avatar } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, Calendar, Clock, User, MapPin } from 'lucide-react';

const Step4Confirm = () => {
    const { selection, setSelection, setError, error, isSubmitting, setSubmitting, nextStep, prevStep } = useBooking();
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const [reason, setReason] = useState(selection.reason || '');
    const [notes, setNotes] = useState(selection.notes || '');

    const appointmentTime = selection.timeSlot ? getLocalTimeFromUTC(selection.timeSlot) : null;

    const handleSubmit = async () => {
        if (!reason.trim()) {
            setError('Please provide a reason for your visit.');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            // Get department ID from selection or doctor's department
            const departmentId = selection.department?.id || selection.doctor?.department_id;

            await bookAppointment({
                patientId: user.id,
                doctorId: selection.doctor.id,
                departmentId: departmentId,
                appointmentTime: selection.timeSlot,
                reason: reason.trim(),
                notes: notes.trim(),
            });

            // Store reason/notes for success screen
            setSelection({ reason, notes });

            toast.success('Appointment booked successfully!');
            nextStep();
        } catch (err) {
            // Handle slot no longer available
            setError(err.message || 'Failed to book appointment. Please try again.');
            toast.error(err.message || 'Booking failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            {/* Header with Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4 order-2 sm:order-1">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={prevStep}
                        className="gap-2 w-full sm:w-auto"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Date & Time
                    </Button>
                </div>
                <div className="text-left sm:text-right order-1 sm:order-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Confirm Appointment
                    </h2>
                    <p className="text-gray-600">
                        Review your booking details
                    </p>
                </div>
            </div>

            {error && (
                <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                {/* Appointment Summary */}
                <Card>
                    <Card.Header>
                        <Card.Title>Appointment Details</Card.Title>
                    </Card.Header>
                    <Card.Content className="space-y-4">
                        {/* Doctor */}
                        <div className="flex items-center gap-4">
                            <Avatar name={selection.doctor?.user?.full_name} size="lg" />
                            <div>
                                <p className="font-semibold text-gray-900">
                                    Dr. {selection.doctor?.user?.full_name}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {selection.doctor?.specialization}
                                </p>
                            </div>
                        </div>

                        <hr />

                        {/* Department */}
                        <div className="flex items-center gap-3 text-gray-600">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <span>{selection.department?.name} Department</span>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-3 text-gray-600">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <span>
                                {selection.date && format(new Date(selection.date), 'EEEE, MMMM d, yyyy')}
                            </span>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-3 text-gray-600">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <span>
                                {appointmentTime && format(appointmentTime, 'h:mm a')}
                            </span>
                        </div>

                        {/* Patient */}
                        <hr />
                        <div className="flex items-center gap-3 text-gray-600">
                            <User className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="font-medium text-gray-900">{profile?.full_name}</p>
                                <p className="text-sm">{user?.email}</p>
                            </div>
                        </div>
                    </Card.Content>
                </Card>

                {/* Reason & Notes */}
                <div className="space-y-4">
                    <Input
                        label="Reason for Visit *"
                        placeholder="e.g., Annual checkup, Follow-up, etc."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        error={!reason && error ? 'Required' : ''}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Additional Notes (Optional)
                        </label>
                        <textarea
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                            rows={4}
                            placeholder="Any additional information for the doctor..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <Button
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                        className="w-full"
                        size="lg"
                    >
                        Confirm Appointment
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                        By confirming, you agree to our cancellation policy.
                        Free cancellation up to 24 hours before the appointment.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Step4Confirm;
