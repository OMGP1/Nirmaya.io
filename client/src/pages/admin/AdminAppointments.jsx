import { getLocalTimeFromUTC } from '@/lib/utils';
/**
 * Admin Appointments Page
 * 
 * View all appointments with filtering.
 */
import { useState, useEffect } from 'react';
import { Card, Spinner, Badge, Button, Input, Select, Avatar } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { format, parseISO } from 'date-fns';
import { Search, Filter, CheckCircle, XCircle, Calendar, ChevronDown, Clock, User } from 'lucide-react';

const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

const AdminAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        fetchAppointments();
    }, [statusFilter]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('appointments')
                .select(`
                    *,
                    patient:users!appointments_patient_id_fkey(full_name, email),
                    doctor:doctors(
                        specialization,
                        user:users(full_name)
                    )
                `)
                .order('start_time', { ascending: false });

            if (statusFilter) {
                query = query.eq('status', statusFilter);
            }

            const { data, error } = await query;

            if (error) throw error;
            setAppointments(data || []);
        } catch (err) {
            console.error('Error fetching appointments:', err);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (id) => {
        try {
            await supabase
                .from('appointments')
                .update({ status: 'confirmed' })
                .eq('id', id);
            fetchAppointments();
        } catch (err) {
            console.error('Failed to confirm:', err);
        }
    };

    const handleCancel = async (id) => {
        try {
            await supabase
                .from('appointments')
                .update({ status: 'cancelled' })
                .eq('id', id);
            fetchAppointments();
        } catch (err) {
            console.error('Failed to cancel:', err);
        }
    };

    const filteredAppointments = search
        ? appointments.filter(
            (apt) =>
                apt.patient?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                apt.doctor?.user?.full_name?.toLowerCase().includes(search.toLowerCase())
        )
        : appointments;

    return (
        <div>
            <div className="mb-8 animate-slide-up">
                <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
                <p className="text-gray-500 mt-1">Manage all patient appointments</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <Input
                        placeholder="Search by patient or doctor..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        leftIcon={<Search className="w-5 h-5" />}
                    />
                </div>
                <div className="w-48">
                    <Select
                        options={statusOptions}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        placeholder="Filter by status"
                    />
                </div>
            </div>

            {/* Appointments - Mobile Cards */}
            {loading ? (
                <div className="p-8 flex justify-center">
                    <Spinner size="lg" />
                </div>
            ) : filteredAppointments.length === 0 ? (
                <Card className="p-8 text-center text-gray-500">
                    No appointments found.
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredAppointments.map((apt) => {
                        const isExpanded = expandedId === apt.id;
                        return (
                            <Card key={apt.id} className="overflow-hidden">
                                {/* Collapsed Header - Always visible */}
                                <div
                                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => setExpandedId(isExpanded ? null : apt.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <Avatar name={apt.patient?.full_name} size="md" />
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-gray-900 truncate">
                                                    {apt.patient?.full_name}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    Dr. {apt.doctor?.user?.full_name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge
                                                variant={
                                                    apt.status === 'confirmed' ? 'success' :
                                                        apt.status === 'pending' ? 'warning' :
                                                            apt.status === 'completed' ? 'default' :
                                                                'danger'
                                                }
                                            >
                                                {apt.status}
                                            </Badge>
                                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 pt-0 border-t bg-gray-50 space-y-3">
                                        <div className="grid grid-cols-2 gap-4 pt-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span>{format(getLocalTimeFromUTC(apt.start_time), 'MMM d, yyyy')}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <span>{format(getLocalTimeFromUTC(apt.start_time), 'h:mm a')}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase mb-1">Reason</p>
                                            <p className="text-sm text-gray-900">{apt.reason || 'No reason provided'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase mb-1">Patient Email</p>
                                            <p className="text-sm text-gray-900">{apt.patient?.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase mb-1">Doctor</p>
                                            <p className="text-sm text-gray-900">Dr. {apt.doctor?.user?.full_name} - {apt.doctor?.specialization}</p>
                                        </div>

                                        {/* Actions */}
                                        {apt.status === 'pending' && (
                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => { e.stopPropagation(); handleConfirm(apt.id); }}
                                                    className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    Confirm
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => { e.stopPropagation(); handleCancel(apt.id); }}
                                                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                                                >
                                                    <XCircle className="w-4 h-4 mr-1" />
                                                    Cancel
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdminAppointments;
