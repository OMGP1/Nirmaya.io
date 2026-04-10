import { getLocalTimeFromUTC } from '@/lib/utils';
/**
 * Doctor Dashboard
 * 
 * Overview page for doctors showing today's appointments and stats.
 * Now uses Supabase directly to avoid CORS issues.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardContent, CardTitle, Badge, Button, Spinner, Avatar } from '@/components/ui';
import {
    Calendar,
    Clock,
    Users,
    CheckCircle,
    AlertCircle,
    ChevronRight,
} from 'lucide-react';

const DoctorDashboard = () => {
    const { user, profile } = useAuth();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                if (!user) {
                    throw new Error('Not authenticated');
                }

                // Get doctor record for current user
                const { data: doctor, error: doctorError } = await supabase
                    .from('doctors')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                if (doctorError || !doctor) {
                    throw new Error('Doctor profile not found');
                }

                const today = new Date();
                const todayStart = startOfDay(today).toISOString();
                const todayEnd = endOfDay(today).toISOString();

                // Fetch today's appointments
                const { data: todayAppointments, error: todayError } = await supabase
                    .from('appointments')
                    .select(`
                        *,
                        patient:users!appointments_patient_id_fkey(id, full_name, email)
                    `)
                    .eq('doctor_id', doctor.id)
                    .gte('start_time', todayStart)
                    .lte('start_time', todayEnd)
                    .neq('status', 'cancelled')
                    .order('start_time', { ascending: true });

                if (todayError) {
                    console.error('Error fetching today appointments:', todayError);
                }

                // Fetch stats
                const { data: pendingAppointments } = await supabase
                    .from('appointments')
                    .select('id')
                    .eq('doctor_id', doctor.id)
                    .eq('status', 'pending');

                const { data: upcomingAppointments } = await supabase
                    .from('appointments')
                    .select('id')
                    .eq('doctor_id', doctor.id)
                    .gte('start_time', new Date().toISOString())
                    .neq('status', 'cancelled');

                setSummary({
                    todayAppointments: todayAppointments || [],
                    stats: {
                        todayTotal: todayAppointments?.length || 0,
                        pending: pendingAppointments?.length || 0,
                        upcoming: upcomingAppointments?.length || 0,
                    }
                });

            } catch (err) {
                console.error('Dashboard fetch error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);


    const getStatusBadge = (status) => {
        const variants = {
            pending: 'warning',
            confirmed: 'success',
            completed: 'default',
            cancelled: 'destructive',
        };
        return <Badge variant={variants[status]}>{status}</Badge>;
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <Card className="bg-red-50 border-red-200">
                <CardContent className="p-6 text-center text-red-600">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3" />
                    <p>{error}</p>
                </CardContent>
            </Card>
        );
    }

    const stats = summary?.stats || {};
    const todayAppointments = summary?.todayAppointments || [];

    return (
        <div className="space-y-6">
            {/* Stats Grid - Animated & Clickable */}
            <div className="grid sm:grid-cols-3 gap-4">
                <Link to="/doctor/appointments?filter=today">
                    <Card className="animate-jelly-pop cursor-pointer hover:bg-muted/50 transition-colors" style={{ animationDelay: '0ms' }}>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center animate-jelly-bounce" style={{ animationDelay: '300ms' }}>
                                    <Calendar className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.todayTotal || 0}</p>
                                    <p className="text-sm text-muted-foreground">Today's Patients</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link to="/doctor/appointments?filter=pending">
                    <Card className="animate-jelly-pop cursor-pointer hover:bg-muted/50 transition-colors" style={{ animationDelay: '100ms' }}>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center animate-jelly-bounce" style={{ animationDelay: '400ms' }}>
                                    <Clock className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.pending || 0}</p>
                                    <p className="text-sm text-muted-foreground">Pending Requests</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link to="/doctor/appointments?filter=upcoming">
                    <Card className="animate-jelly-pop cursor-pointer hover:bg-muted/50 transition-colors" style={{ animationDelay: '200ms' }}>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center animate-jelly-bounce" style={{ animationDelay: '500ms' }}>
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.upcoming || 0}</p>
                                    <p className="text-sm text-muted-foreground">Upcoming</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Today's Appointments */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-lg">Today's Appointments</CardTitle>
                    <Link to="/doctor/appointments">
                        <Button variant="outline" size="sm" className="gap-1">
                            View All
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent className="p-0">
                    {todayAppointments.length > 0 ? (
                        <div className="divide-y">
                            {todayAppointments.map((apt) => (
                                <Link
                                    key={apt.id}
                                    to={`/doctor/appointments/${apt.id}`}
                                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <Avatar name={apt.patient?.full_name} size="md" />
                                        <div>
                                            <p className="font-medium">{apt.patient?.full_name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {apt.reason || 'No reason provided'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">
                                            {format(getLocalTimeFromUTC(apt.start_time), 'h:mm a')}
                                        </p>
                                        {getStatusBadge(apt.status)}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-muted-foreground">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No appointments scheduled for today</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-2 gap-4">
                <Link to="/doctor/schedule">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">View Schedule</p>
                                <p className="text-sm text-muted-foreground">See your weekly calendar</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link to="/doctor/availability">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium">Manage Availability</p>
                                <p className="text-sm text-muted-foreground">Set your working hours</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
};

export default DoctorDashboard;
