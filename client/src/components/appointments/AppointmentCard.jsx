/**
 * Appointment Card Component — Niramaya UI
 */
import { format, isPast } from 'date-fns';
import { Badge } from '@/components/ui';
import { Calendar, Clock, MoreVertical, Shield, User } from 'lucide-react';
import { useState } from 'react';
import { getLocalTimeFromUTC } from '@/lib/utils';
import { Link } from 'react-router-dom';

const statusConfig = {
    pending: { variant: 'warning', label: 'Pending' },
    confirmed: { variant: 'success', label: 'Confirmed' },
    cancelled: { variant: 'danger', label: 'Cancelled' },
    completed: { variant: 'default', label: 'Completed' },
};

const AppointmentCard = ({ appointment, onReschedule, onCancel }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    const appointmentTime = getLocalTimeFromUTC(appointment.start_time);
    const isPastAppointment = isPast(appointmentTime);
    const status = statusConfig[appointment.status] || statusConfig.pending;
    const doctor = appointment.doctor;
    const canModify = !isPastAppointment && appointment.status !== 'cancelled' && appointment.status !== 'completed';

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 relative group">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                
                {/* Doctor Info */}
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#008080]/10 flex items-center justify-center border border-[#008080]/20 shrink-0">
                        <User className="w-6 h-6 text-[#008080]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 mb-1">
                            <Shield className="w-3.5 h-3.5 text-[#008080]" />
                            <span className="text-[10px] font-bold text-[#008080] uppercase tracking-wider">Clinical Specialist</span>
                        </div>
                        <h3 className="font-heading font-black text-lg text-[#1A2B48]">
                            Dr. {doctor?.user?.full_name}
                        </h3>
                        <p className="text-sm font-medium text-slate-500">
                            {doctor?.specialization || doctor?.department?.name || 'Specialist'}
                        </p>
                    </div>
                </div>

                {/* Status & Options */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
                    <Badge variant={status.variant} className="px-3 py-1 font-bold tracking-wide shadow-sm">
                        {status.label}
                    </Badge>

                    {canModify && (
                        <div className="relative">
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:text-[#1A2B48] hover:bg-slate-100 flex items-center justify-center transition-colors"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 py-2 z-20 animate-fade-in origin-top-right">
                                    <button
                                        onClick={() => { setMenuOpen(false); onReschedule?.(appointment); }}
                                        className="w-full px-4 py-2 text-left text-sm font-bold text-slate-600 hover:text-[#008080] hover:bg-slate-50 transition-colors"
                                    >
                                        Reschedule
                                    </button>
                                    <button
                                        onClick={() => { setMenuOpen(false); onCancel?.(appointment); }}
                                        className="w-full px-4 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        Cancel Booking
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* DateTime Line */}
            <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl text-sm font-bold text-[#1A2B48] border border-slate-100 shadow-sm">
                    <Calendar className="w-4 h-4 text-[#008080]" />
                    {format(appointmentTime, 'EEE, MMM d, yyyy')}
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl text-sm font-bold text-[#1A2B48] border border-slate-100 shadow-sm">
                    <Clock className="w-4 h-4 text-[#008080]" />
                    {format(appointmentTime, 'h:mm a')}
                </div>
            </div>

            {/* Reason */}
            {appointment.reason && (
                <div className="mt-4 text-sm bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-600">
                    <span className="font-bold text-[#1A2B48] uppercase tracking-wider text-xs block mb-1">Visit Reason</span>
                    {appointment.reason}
                </div>
            )}

            {/* Cancel Reason */}
            {appointment.status === 'cancelled' && appointment.cancellation_reason && (
                <div className="mt-4 text-sm bg-red-50 border border-red-100 rounded-xl p-4 text-red-800">
                    <span className="font-bold text-red-900 uppercase tracking-wider text-xs block mb-1">Cancellation Reason</span>
                    {appointment.cancellation_reason}
                </div>
            )}
        </div>
    );
};

export default AppointmentCard;
