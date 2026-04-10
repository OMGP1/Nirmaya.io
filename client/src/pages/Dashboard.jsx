import { getLocalTimeFromUTC } from '@/lib/utils';
/**
 * Dashboard Page - Real Data Integration
 * 
 * User dashboard with real appointments from the database.
 * Redirects admin and doctor users to their respective portals.
 */
import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent, CardTitle, Badge, Button, Spinner } from '@/components/ui';
import { Calendar, Clock, User, Plus, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { getMyAppointments } from '@/services/appointments';
import { formatDoctorName } from '@/utils/formatDoctorName';

const Dashboard = () => {
    const { user, profile, loading: authLoading } = useAuth();

    // Redirect admin users to admin portal
    if (!authLoading && profile?.role === 'admin') {
        return <Navigate to="/admin" replace />;
    }

    // Redirect doctor users to doctor portal
    if (!authLoading && profile?.role === 'doctor') {
        return <Navigate to="/doctor" replace />;
    }

    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState({
        upcoming: 0,
        completed: 0,
        cancelled: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch real appointments for this user
    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;

            try {
                setLoading(true);
                const data = await getMyAppointments(user.id);

                // Calculate stats
                const now = new Date();
                const upcomingCount = data.filter(apt =>
                    ['pending', 'confirmed'].includes(apt.status) &&
                    getLocalTimeFromUTC(apt.start_time) > now
                ).length;
                const completedCount = data.filter(apt => apt.status === 'completed').length;
                const cancelledCount = data.filter(apt => apt.status === 'cancelled').length;

                // Get upcoming appointments (future + pending/confirmed)
                const upcomingAppointments = data
                    .filter(apt =>
                        ['pending', 'confirmed'].includes(apt.status) &&
                        getLocalTimeFromUTC(apt.start_time) > now
                    )
                    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
                    .slice(0, 5); // Show max 5 upcoming

                setAppointments(upcomingAppointments);
                setStats({
                    upcoming: upcomingCount,
                    completed: completedCount,
                    cancelled: cancelledCount,
                });
            } catch (err) {
                console.error('Failed to fetch appointments:', err);
                setError('Failed to load your appointments');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.id]);

    const getStatusBadge = (status) => {
        const variants = {
            confirmed: 'success',
            pending: 'warning',
            cancelled: 'destructive',
            completed: 'default',
        };
        return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
    };

    const formatAppointmentDate = (dateString) => {
        try {
            return format(getLocalTimeFromUTC(dateString), 'MMM d, yyyy');
        } catch {
            return dateString;
        }
    };

    const formatAppointmentTime = (dateString) => {
        try {
            return format(getLocalTimeFromUTC(dateString), 'h:mm a');
        } catch {
            return '';
        }
    };

    const statCards = [
        { icon: Calendar, label: 'Upcoming', value: stats.upcoming, color: 'text-primary', link: '/appointments?status=pending' },
        { icon: CheckCircle, label: 'Completed', value: stats.completed, color: 'text-green-600', link: '/appointments?status=completed' },
        { icon: XCircle, label: 'Cancelled', value: stats.cancelled, color: 'text-red-500', link: '/appointments?status=cancelled' },
    ];

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center py-20">
                    <Spinner size="lg" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Welcome Section */}
                <div className="space-y-1 animate-slide-up">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!
                    </h1>
                    <p className="text-muted-foreground">
                        Here's an overview of your healthcare activity.
                    </p>
                </div>

                {/* Stats Grid - Animated & Clickable */}
                <div className="grid sm:grid-cols-3 gap-4">
                    {statCards.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <Link key={i} to={stat.link}>
                                <Card
                                    className={`animate-jelly-pop cursor-pointer hover:bg-muted/50 transition-colors h-full`}
                                    style={{ animationDelay: `${i * 100}ms` }}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center animate-jelly-bounce" style={{ animationDelay: `${i * 150 + 300}ms` }}>
                                                <Icon className={`w-6 h-6 ${stat.color}`} />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold">{stat.value}</p>
                                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>

                {/* Upcoming Appointments */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-lg font-medium">Upcoming Appointments</CardTitle>
                        <Link to="/book">
                            <Button size="sm" className="gap-1">
                                <Plus className="w-4 h-4" />
                                Book New
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        {error ? (
                            <div className="p-8 text-center text-red-500">
                                {error}
                            </div>
                        ) : appointments.length > 0 ? (
                            <div className="divide-y">
                                {appointments.map((apt) => (
                                    <div
                                        key={apt.id}
                                        className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                                <User className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {formatDoctorName(apt.doctor?.user?.full_name)}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {apt.doctor?.specialization || apt.doctor?.department?.name || 'Specialist'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">{formatAppointmentDate(apt.start_time)}</p>
                                            <p className="text-sm text-muted-foreground">{formatAppointmentTime(apt.start_time)}</p>
                                        </div>
                                        <div>
                                            {getStatusBadge(apt.status)}
                                        </div>
                                        <Link to="/appointments">
                                            <Button variant="ghost" size="icon">
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-muted-foreground">
                                <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                                <p className="font-medium">No upcoming appointments</p>
                                <p className="text-sm mt-1">Book your first appointment to get started!</p>
                                <Link to="/book">
                                    <Button className="mt-4 gap-2">
                                        <Plus className="w-4 h-4" />
                                        Book Appointment
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <Link to="/appointments">
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">View All Appointments</p>
                                        <p className="text-sm text-muted-foreground">Manage your bookings</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                            </CardContent>
                        </Card>
                    </Link>
                    <Link to="/doctors">
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                        <User className="w-5 h-5 text-purple-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Find Doctors</p>
                                        <p className="text-sm text-muted-foreground">Browse our specialists</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
