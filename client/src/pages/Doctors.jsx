/**
 * Doctors Listing Page
 */
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout';
import { getDoctors } from '@/services/doctors';
import { getDepartments } from '@/services/departments';
import { Card, Avatar, Badge, Button, Input, Select, Spinner, Alert } from '@/components/ui';
import { Search, Star, Clock, Calendar } from 'lucide-react';

const Doctors = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [search, setSearch] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState(
        searchParams.get('department') || ''
    );

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [doctorsData, deptsData] = await Promise.all([
                    getDoctors({ departmentId: departmentFilter || undefined }),
                    getDepartments(),
                ]);
                setDoctors(doctorsData);
                setDepartments(deptsData);
            } catch (err) {
                setError('Failed to load doctors. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [departmentFilter]);

    const filteredDoctors = search
        ? doctors.filter(
            (doc) =>
                doc.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                doc.specialization?.toLowerCase().includes(search.toLowerCase())
        )
        : doctors;

    const departmentOptions = [
        { value: '', label: 'All Departments' },
        ...departments.map((d) => ({ value: d.id, label: d.name })),
    ];

    return (
        <DashboardLayout>
            <div className="container-app py-12">
                <div className="text-center mb-12 animate-slide-up">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Find a Doctor
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Browse our network of qualified healthcare professionals
                        and book an appointment that fits your schedule.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1">
                        <Input
                            placeholder="Search by name or specialization..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            leftIcon={<Search className="w-5 h-5" />}
                        />
                    </div>
                    <div className="md:w-64">
                        <Select
                            options={departmentOptions}
                            value={departmentFilter}
                            onChange={(val) => {
                                setDepartmentFilter(val);
                                if (val) {
                                    setSearchParams({ department: val });
                                } else {
                                    setSearchParams({});
                                }
                            }}
                            placeholder="Filter by department"
                        />
                    </div>
                </div>

                {error && (
                    <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Doctor List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Spinner size="lg" />
                    </div>
                ) : filteredDoctors.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No doctors found matching your criteria.
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDoctors.map((doctor) => (
                            <Card key={doctor.id} hoverable className="p-6">
                                <div className="flex items-start gap-4">
                                    <Avatar name={doctor.user?.full_name} size="lg" />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900">
                                            Dr. {doctor.user?.full_name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {doctor.specialization}
                                        </p>
                                        <p className="text-xs text-primary-600 mt-1">
                                            {doctor.department?.name}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                                    {doctor.experience_years && (
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {doctor.experience_years}y exp
                                        </span>
                                    )}
                                    {doctor.average_rating && (
                                        <span className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-500" />
                                            {doctor.average_rating.toFixed(1)}
                                        </span>
                                    )}
                                </div>

                                {doctor.consultation_fee && (
                                    <p className="mt-3 font-semibold text-gray-900">
                                        ₹{doctor.consultation_fee} <span className="font-normal text-sm text-gray-500">/ visit</span>
                                    </p>
                                )}

                                <Link to={`/book?doctorId=${doctor.id}`} className="block mt-4">
                                    <Button className="w-full" leftIcon={<Calendar className="w-4 h-4" />}>
                                        Book Appointment
                                    </Button>
                                </Link>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Doctors;
