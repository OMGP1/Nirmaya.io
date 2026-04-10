/**
 * Appointment Card Component
 */
import { format, parseISO, isPast } from 'date-fns';
import { Card, Badge, Avatar, Button } from '@/components/ui';
import { Calendar, Clock, MapPin, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { cn, getLocalTimeFromUTC } from '@/lib/utils';

const statusConfig = {
    pending: { variant: 'warning', label: 'Pending' },
    confirmed: { variant: 'success', label: 'Confirmed' },
    cancelled: { variant: 'danger', label: 'Cancelled' },
    completed: { variant: 'default', label: 'Completed' },
};

const AppointmentCard = ({ appointment, onReschedule, onCancel }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    // Use start_time column (database schema)
    const appointmentTime = getLocalTimeFromUTC(appointment.start_time);
    const isPastAppointment = isPast(appointmentTime);
    const status = statusConfig[appointment.status] || statusConfig.pending;
    const doctor = appointment.doctor;
    const canModify = !isPastAppointment && appointment.status !== 'cancelled';

    return (
        <Card className="p-4">
            <div className="flex items-start justify-between">
                {/* Doctor Info */}
                <div className="flex items-center gap-4">
                    <Avatar name={doctor?.user?.full_name} size="lg" />
                    <div>
                        <h3 className="font-semibold text-gray-900">
                            Dr. {doctor?.user?.full_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {doctor?.specialization}
                        </p>
                        <p className="text-xs text-gray-400">
                            {doctor?.department?.name}
                        </p>
                    </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-2">
                    <Badge variant={status.variant} dot>
                        {status.label}
                    </Badge>

                    {canModify && (
                        <div className="relative">
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <MoreVertical className="w-5 h-5 text-gray-500" />
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                                    <button
                                        onClick={() => {
                                            setMenuOpen(false);
                                            onReschedule?.(appointment);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        Reschedule
                                    </button>
                                    <button
                                        onClick={() => {
                                            setMenuOpen(false);
                                            onCancel?.(appointment);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-danger-500 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Details */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {format(appointmentTime, 'EEE, MMM d, yyyy')}
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {format(appointmentTime, 'h:mm a')}
                </div>
            </div>

            {/* Reason */}
            {appointment.reason && (
                <div className="mt-3 text-sm">
                    <span className="text-gray-500">Reason: </span>
                    <span className="text-gray-700">{appointment.reason}</span>
                </div>
            )}

            {/* Cancellation reason */}
            {appointment.status === 'cancelled' && appointment.cancellation_reason && (
                <div className="mt-3 text-sm bg-gray-50 p-2 rounded">
                    <span className="text-gray-500">Cancelled: </span>
                    <span className="text-gray-700">{appointment.cancellation_reason}</span>
                </div>
            )}
        </Card>
    );
};

export default AppointmentCard;
