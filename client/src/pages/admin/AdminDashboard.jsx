import { getLocalTimeFromUTC } from '@/lib/utils';
/**
 * Admin Dashboard Page
 * 
 * Overview stats and today's appointments.
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Spinner, Badge, Button, Avatar } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import {
    Calendar,
    Users,
    Building2,
    UserCircle,
    TrendingUp,
    Clock,
    ArrowRight,
} from 'lucide-react';
import { format, startOfToday, endOfToday } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, color, trend, to }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (to) navigate(to);
    };

    return (
        <Card
            className={`p-3 sm:p-6 transition-transform duration-200 isolate ${to ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''}`}
            onClick={handleClick}
        >
            <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1 truncate">{title}</p>
                    <p className="text-xl sm:text-3xl font-bold text-gray-900">{value}</p>
                    {trend && (
                        <p className="text-xs sm:text-sm text-green-600 flex items-center gap-1 mt-0.5 sm:mt-1">
                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate hidden sm:inline">{trend}</span>
                        </p>
                    )}
                </div>
                <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
            </div>
        </Card>
    );
};

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch stats without timeout race - let queries complete
                const [appointments, doctors, patients, todayCount] = await Promise.all([
                    supabase.from('appointments').select('id', { count: 'exact', head: true }),
                    supabase.from('doctors').select('id', { count: 'exact', head: true }),
                    supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'patient'),
                    supabase
                        .from('appointments')
                        .select('id', { count: 'exact', head: true })
                        .gte('start_time', startOfToday().toISOString())
                        .lte('start_time', endOfToday().toISOString()),
                ]);

                console.log('Stats fetched:', { appointments, doctors, patients, todayCount });

                const todayResult = await supabase
                    .from('appointments')
                    .select(`
                        *,
                        patient:users!appointments_patient_id_fkey(full_name),
                        doctor:doctors(
                            specialization,
                            user:users(full_name)
                        )
                    `)
                    .gte('start_time', startOfToday().toISOString())
                    .lte('start_time', endOfToday().toISOString())
                    .order('start_time');

                console.log("Today's appointments fetched:", todayResult);

                // Check for errors
                if (appointments.error || doctors.error || patients.error) {
                    throw new Error('Query error: ' + JSON.stringify({
                        appointments: appointments.error,
                        doctors: doctors.error,
                        patients: patients.error
                    }));
                }

                setStats({
                    totalAppointments: appointments.count || 0,
                    totalDoctors: doctors.count || 0,
                    totalPatients: patients.count || 0,
                    todayAppointments: todayCount.count || 0,
                });

                setTodayAppointments(todayResult.data || []);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setStats({
                    totalAppointments: 0,
                    totalDoctors: 0,
                    totalPatients: 0,
                    todayAppointments: 0,
                });
                setTodayAppointments([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div>
            {/* Header - Animated */}
            <div className="mb-6 sm:mb-8 animate-slide-up">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm sm:text-base text-gray-500 mt-1">
                    Welcome back! Here's what's happening today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                <StatCard
                    title="Total Appointments"
                    value={stats.totalAppointments}
                    icon={Calendar}
                    color="bg-primary-500"
                    trend="+12% from last month"
                    to="/admin/appointments"
                />
                <StatCard
                    title="Active Doctors"
                    value={stats.totalDoctors}
                    icon={Users}
                    color="bg-secondary-500"
                    to="/admin/doctors"
                />
                <StatCard
                    title="Registered Patients"
                    value={stats.totalPatients}
                    icon={UserCircle}
                    color="bg-purple-500"
                    trend="+8% from last month"
                    to="/admin/patients"
                />
                <StatCard
                    title="Today's Appointments"
                    value={stats.todayAppointments}
                    icon={Clock}
                    color="bg-orange-500"
                    to="/admin/appointments"
                />
            </div>

            {/* Today's Appointments */}
            <Card>
                <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                        Today's Appointments
                    </h2>
                    <Link to="/admin/appointments">
                        <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                            View All
                        </Button>
                    </Link>
                </div>
                <div className="divide-y divide-gray-100">
                    {todayAppointments.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No appointments scheduled for today.
                        </div>
                    ) : (
                        todayAppointments.slice(0, 5).map((apt) => (
                            <div key={apt.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <Avatar name={apt.patient?.full_name || 'Patient'} size="md" />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                                            {apt.patient?.full_name || 'Patient'}
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                                            Dr. {apt.doctor?.user?.full_name} • {apt.doctor?.specialization}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 ml-11 sm:ml-0">
                                    <div className="text-left sm:text-right">
                                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                                            {format(getLocalTimeFromUTC(apt.start_time), 'h:mm a')}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate max-w-[120px]">{apt.reason}</p>
                                    </div>
                                    <Badge
                                        variant={
                                            apt.status === 'confirmed' ? 'success' :
                                                apt.status === 'pending' ? 'warning' :
                                                    apt.status === 'cancelled' ? 'danger' : 'default'
                                        }
                                    >
                                        {apt.status}
                                    </Badge>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/admin/doctors">
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Manage Doctors</p>
                                <p className="text-sm text-gray-500">Add or edit doctor profiles</p>
                            </div>
                        </div>
                    </Card>
                </Link>
                <Link to="/admin/departments">
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Manage Departments</p>
                                <p className="text-sm text-gray-500">Configure medical departments</p>
                            </div>
                        </div>
                    </Card>
                </Link>
                <Link to="/admin/patients">
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                <UserCircle className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">View Patients</p>
                                <p className="text-sm text-gray-500">Browse patient records</p>
                            </div>
                        </div>
                    </Card>
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboard;
