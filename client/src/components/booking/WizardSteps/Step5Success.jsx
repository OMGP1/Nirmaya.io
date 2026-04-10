/**
 * Step 5: Booking Success
 */
import { format, parseISO } from 'date-fns';
import { getLocalTimeFromUTC } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useBooking } from '@/contexts/BookingContext';
import { Button, Card, Avatar } from '@/components/ui';
import { CheckCircle, Calendar, Clock, Download, Home } from 'lucide-react';

const Step5Success = () => {
    const { selection, reset } = useBooking();
    const appointmentTime = selection.timeSlot ? getLocalTimeFromUTC(selection.timeSlot) : null;

    return (
        <div className="max-w-lg mx-auto text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-secondary-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Appointment Booked!
            </h2>
            <p className="text-gray-600 mb-8">
                Your appointment has been scheduled successfully.
                A confirmation email has been sent to your inbox.
            </p>

            {/* Appointment Card */}
            <Card className="text-left mb-8">
                <Card.Content>
                    <div className="flex items-center gap-4 mb-4">
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

                    <div className="space-y-3 text-gray-600">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <span>
                                {selection.date && format(new Date(selection.date), 'EEEE, MMMM d, yyyy')}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <span>
                                {appointmentTime && format(appointmentTime, 'h:mm a')}
                            </span>
                        </div>
                    </div>

                    {selection.reason && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500">Reason for visit:</p>
                            <p className="text-gray-900">{selection.reason}</p>
                        </div>
                    )}
                </Card.Content>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/appointments" className="flex-1">
                    <Button variant="outline" className="w-full gap-2">
                        <Calendar className="w-4 h-4" />
                        View Appointments
                    </Button>
                </Link>
                <Link to="/dashboard" className="flex-1" onClick={reset}>
                    <Button className="w-full gap-2">
                        <Home className="w-4 h-4" />
                        Go to Dashboard
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default Step5Success;
