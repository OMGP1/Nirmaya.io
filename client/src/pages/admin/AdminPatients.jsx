/**
 * Admin Patients Page
 */
import { useState, useEffect } from 'react';
import { Card, Spinner, Input, Avatar, Badge } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { Search, Mail, Phone, Calendar, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

const AdminPatients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'patient')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPatients(data || []);
        } catch (err) {
            console.error('Error fetching patients:', err);
            setPatients([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = search
        ? patients.filter(
            (p) =>
                p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                p.email?.toLowerCase().includes(search.toLowerCase())
        )
        : patients;

    return (
        <div>
            <div className="mb-8 animate-slide-up">
                <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
                <p className="text-gray-500 mt-1">View registered patients</p>
            </div>

            {/* Search */}
            <div className="mb-6">
                <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    leftIcon={<Search className="w-5 h-5" />}
                    className="max-w-md"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                </div>
            ) : filteredPatients.length === 0 ? (
                <Card className="p-8 text-center text-gray-500">
                    No patients found.
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredPatients.map((patient) => {
                        const isExpanded = expandedId === patient.id;
                        return (
                            <Card key={patient.id} className="overflow-hidden">
                                {/* Collapsed Header */}
                                <div
                                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => setExpandedId(isExpanded ? null : patient.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <Avatar name={patient.full_name} size="md" />
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-gray-900 truncate">
                                                    {patient.full_name}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {patient.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="success">Active</Badge>
                                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 pt-0 border-t bg-gray-50 space-y-3">
                                        <div className="pt-3">
                                            <p className="text-xs text-gray-500 uppercase mb-1">Patient ID</p>
                                            <p className="text-sm text-gray-900 font-mono">{patient.id}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span>{patient.email}</span>
                                        </div>
                                        {patient.phone && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <span>{patient.phone}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span>Joined {format(new Date(patient.created_at), 'MMM d, yyyy')}</span>
                                        </div>
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

export default AdminPatients;
