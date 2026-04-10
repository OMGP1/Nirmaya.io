import { getLocalTimeFromUTC } from '@/lib/utils';
/**
 * Doctor Appointments Page
 * 
 * List all appointments with filtering and actions.
 * Uses Supabase directly to avoid CORS issues.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardContent, CardTitle, Badge, Button, Spinner, Avatar, Input } from '@/components/ui';
import {
    Search,
    Filter,
    ChevronRight,
    Calendar,
    Check,
    X,
    AlertCircle,
    Brain,
    Activity,
    Mic,
} from 'lucide-react';

const DoctorAppointments = () => {
    const { user } = useAuth();
    const [doctorId, setDoctorId] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [riskData, setRiskData] = useState({});  // { patientId: assessment }

    // Get doctor ID on mount
    useEffect(() => {
        const getDoctorId = async () => {
            if (!user) return;

            const { data: doctor, error } = await supabase
                .from('doctors')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (error) {
                console.error('Error getting doctor ID:', error);
                setError('Doctor profile not found');
                setLoading(false);
                return;
            }

            setDoctorId(doctor.id);
        };

        getDoctorId();
    }, [user]);

    const fetchAppointments = async () => {
        if (!doctorId) return;

        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('appointments')
                .select(`
                    *,
                    patient:users!appointments_patient_id_fkey(id, full_name, email)
                `)
                .eq('doctor_id', doctorId)
                .order('start_time', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) {
                throw fetchError;
            }

            setAppointments(data || []);
        } catch (err) {
            console.error('Failed to fetch appointments:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (doctorId) {
            fetchAppointments();
        }
    }, [doctorId, filter]);

    // Fetch risk assessments for all patients in view
    useEffect(() => {
        const fetchRisks = async () => {
            if (!appointments.length) return;
            const patientIds = [...new Set(appointments.map((a) => a.patient?.id).filter(Boolean))];
            if (!patientIds.length) return;

            const { data } = await supabase
                .from('health_assessments')
                .select('*')
                .in('patient_id', patientIds)
                .order('created_at', { ascending: false });

            if (data) {
                const map = {};
                data.forEach((r) => {
                    if (!map[r.patient_id]) map[r.patient_id] = r; // keep latest
                });
                setRiskData(map);
            }
        };
        fetchRisks();
    }, [appointments]);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            setActionLoading(id);

            const { error } = await supabase
                .from('appointments')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) {
                throw error;
            }

            // Refresh appointments
            await fetchAppointments();
        } catch (err) {
            console.error('Status update error:', err);
            alert('Failed to update appointment status');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            pending: 'warning',
            confirmed: 'success',
            completed: 'default',
            cancelled: 'destructive',
        };
        return <Badge variant={variants[status]}>{status}</Badge>;
    };

    // Filter by search
    const filteredAppointments = appointments.filter((apt) => {
        if (!search) return true;
        const query = search.toLowerCase();
        return (
            apt.patient?.full_name?.toLowerCase().includes(query) ||
            apt.reason?.toLowerCase().includes(query)
        );
    });

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Appointments</h1>
                    <p className="text-muted-foreground">Manage patient appointments</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by patient name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                        <Button
                            key={status}
                            variant={filter === status ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setFilter(status)}
                            className="capitalize"
                        >
                            {status}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Appointments List */}
            {error ? (
                <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-6 text-center text-red-600">
                        <AlertCircle className="w-12 h-12 mx-auto mb-3" />
                        <p>{error}</p>
                    </CardContent>
                </Card>
            ) : filteredAppointments.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No appointments found</p>
                        <p className="text-sm">Try adjusting your filters</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredAppointments.map((apt) => (
                        <Card key={apt.id} className="overflow-hidden">
                            <div className="p-4 space-y-3">
                                {/* Main row - patient info */}
                                <div className="flex items-center gap-3">
                                    <Avatar name={apt.patient?.full_name} size="md" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{apt.patient?.full_name}</p>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {apt.reason || 'No reason provided'}
                                        </p>
                                    </div>
                                    <Link to={`/doctor/appointments/${apt.id}`}>
                                        <Button variant="ghost" size="icon">
                                            <ChevronRight className="w-5 h-5" />
                                        </Button>
                                    </Link>
                                </div>

                                {/* AI Risk Alert */}
                                {(() => {
                                    const risk = riskData[apt.patient?.id];
                                    if (!risk || risk.risk_level === 'low') return null;
                                    const isHigh = risk.risk_level === 'high';
                                    return (
                                        <div className={`flex items-start gap-3 p-3 rounded-lg border ${
                                            isHigh
                                                ? 'bg-red-50 border-red-200'
                                                : 'bg-amber-50 border-amber-200'
                                        }`}>
                                            <Brain className={`w-5 h-5 mt-0.5 shrink-0 ${
                                                isHigh ? 'text-red-500' : 'text-amber-500'
                                            }`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-sm font-semibold ${
                                                        isHigh ? 'text-red-700' : 'text-amber-700'
                                                    }`}>
                                                        AI Alert: {risk.risk_level === 'high' ? 'High' : 'Moderate'} Cardiovascular Risk
                                                    </span>
                                                    <Badge variant={isHigh ? 'destructive' : 'warning'}>
                                                        {Number(risk.risk_score).toFixed(0)}%
                                                    </Badge>
                                                </div>
                                                {risk.recommendations?.slice(0, 2).map((rec, i) => (
                                                    <p key={i} className="text-xs text-gray-600">• {rec}</p>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Second row - date, status, actions */}
                                <div className="flex items-center justify-between pt-2 border-t">
                                    <div className="flex items-center gap-3">
                                        <div className="text-sm">
                                            <p className="font-medium text-muted-foreground">
                                                {format(getLocalTimeFromUTC(apt.start_time), 'MMM d, yyyy')}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {format(getLocalTimeFromUTC(apt.start_time), 'h:mm a')}
                                            </p>
                                        </div>
                                        {getStatusBadge(apt.status)}
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex gap-2">
                                        {apt.status === 'pending' && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-1 text-green-600 border-green-200 hover:bg-green-50"
                                                    onClick={() => handleStatusUpdate(apt.id, 'confirmed')}
                                                    disabled={actionLoading === apt.id}
                                                >
                                                    <Check className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Accept</span>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
                                                    onClick={() => handleStatusUpdate(apt.id, 'cancelled')}
                                                    disabled={actionLoading === apt.id}
                                                >
                                                    <X className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Reject</span>
                                                </Button>
                                            </>
                                        )}

                                        {apt.status === 'confirmed' && (
                                            <Button
                                                size="sm"
                                                className="gap-1"
                                                onClick={() => handleStatusUpdate(apt.id, 'completed')}
                                                disabled={actionLoading === apt.id}
                                            >
                                                <Check className="w-4 h-4" />
                                                <span className="hidden sm:inline">Complete</span>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DoctorAppointments;
