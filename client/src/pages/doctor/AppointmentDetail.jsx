import { getLocalTimeFromUTC } from '@/lib/utils';
/**
 * Appointment Detail Page
 * 
 * View and manage a single appointment with clinical notes.
 * Uses Supabase directly to avoid CORS issues.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardContent, CardTitle, Badge, Button, Spinner, Avatar, Alert } from '@/components/ui';
import {
    ArrowLeft,
    User,
    Calendar,
    Clock,
    Phone,
    Mail,
    FileText,
    Check,
    X,
    Save,
} from 'lucide-react';

const AppointmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchAppointment = async () => {
            try {
                if (!user || !id) return;

                const { data, error: fetchError } = await supabase
                    .from('appointments')
                    .select(`
                        *,
                        patient:users!appointments_patient_id_fkey(id, full_name, email, phone)
                    `)
                    .eq('id', id)
                    .single();

                if (fetchError) {
                    throw fetchError;
                }

                setAppointment(data);
                setNotes(data.clinical_notes || '');
            } catch (err) {
                console.error('Error fetching appointment:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (user && id) {
            fetchAppointment();
        }
    }, [user, id]);

    const handleStatusUpdate = async (newStatus) => {
        try {
            setActionLoading(true);

            const { data, error } = await supabase
                .from('appointments')
                .update({ status: newStatus })
                .eq('id', id)
                .select(`
                    *,
                    patient:users!appointments_patient_id_fkey(id, full_name, email, phone)
                `)
                .single();

            if (error) {
                throw error;
            }

            setAppointment(data);
        } catch (err) {
            console.error('Status update error:', err);
            alert('Failed to update appointment status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveNotes = async () => {
        try {
            setSaving(true);

            const { data, error } = await supabase
                .from('appointments')
                .update({ clinical_notes: notes })
                .eq('id', id)
                .select(`
                    *,
                    patient:users!appointments_patient_id_fkey(id, full_name, email, phone)
                `)
                .single();

            if (error) {
                throw error;
            }

            setAppointment(data);
            alert('Notes saved successfully!');
        } catch (err) {
            console.error('Save notes error:', err);
            alert('Failed to save notes');
        } finally {
            setSaving(false);
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            pending: 'warning',
            confirmed: 'success',
            completed: 'default',
            cancelled: 'destructive',
        };
        return <Badge variant={variants[status]} className="text-sm">{status}</Badge>;
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error || !appointment) {
        return (
            <div className="space-y-4">
                <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <Alert variant="error">{error || 'Appointment not found'}</Alert>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Appointments
                </Button>
                {getStatusBadge(appointment.status)}
            </div>

            {/* Patient Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Patient Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-4">
                        <Avatar name={appointment.patient?.full_name} size="lg" />
                        <div className="flex-1 grid sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-medium">{appointment.patient?.full_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    {appointment.patient?.email}
                                </p>
                            </div>
                            {appointment.patient?.phone && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        {appointment.patient?.phone}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Appointment Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Appointment Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Date</p>
                            <p className="font-medium">
                                {format(getLocalTimeFromUTC(appointment.start_time), 'EEEE, MMMM d, yyyy')}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Time</p>
                            <p className="font-medium flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {format(getLocalTimeFromUTC(appointment.start_time), 'h:mm a')}
                            </p>
                        </div>
                        <div className="sm:col-span-2">
                            <p className="text-sm text-muted-foreground">Reason for Visit</p>
                            <p className="font-medium">{appointment.reason || 'Not specified'}</p>
                        </div>
                        {appointment.notes && (
                            <div className="sm:col-span-2">
                                <p className="text-sm text-muted-foreground">Patient Notes</p>
                                <p className="text-gray-700">{appointment.notes}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Clinical Notes */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Clinical Notes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <textarea
                        className="w-full h-40 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter clinical notes, diagnosis, prescriptions..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                    <div className="mt-4 flex justify-end">
                        <Button onClick={handleSaveNotes} disabled={saving} className="gap-2">
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save Notes'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            {appointment.status === 'pending' && (
                                <>
                                    <Button
                                        className="gap-2"
                                        onClick={() => handleStatusUpdate('confirmed')}
                                        disabled={actionLoading}
                                    >
                                        <Check className="w-4 h-4" />
                                        Accept Appointment
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="gap-2"
                                        onClick={() => handleStatusUpdate('cancelled')}
                                        disabled={actionLoading}
                                    >
                                        <X className="w-4 h-4" />
                                        Reject Appointment
                                    </Button>
                                </>
                            )}
                            {appointment.status === 'confirmed' && (
                                <Button
                                    className="gap-2"
                                    onClick={() => handleStatusUpdate('completed')}
                                    disabled={actionLoading}
                                >
                                    <Check className="w-4 h-4" />
                                    Mark as Completed
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default AppointmentDetail;
