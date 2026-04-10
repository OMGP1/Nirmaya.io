/**
 * Step 2: Doctor Selection
 */
import { useState, useEffect } from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { getDoctorsByDepartment } from '@/services/doctors';
import { Card, Spinner, Alert, Avatar, Badge, Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import { Search, Star, Clock, ArrowLeft } from 'lucide-react';

const Step2Doctor = () => {
    const { selection, setDoctor, nextStep, prevStep } = useBooking();
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchDoctors = async () => {
            if (!selection.department?.id) return;

            try {
                setLoading(true);
                const data = await getDoctorsByDepartment(selection.department.id);
                setDoctors(data);
                setFilteredDoctors(data);
            } catch (err) {
                setError('Failed to load doctors. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, [selection.department?.id]);

    // Filter doctors by search
    useEffect(() => {
        if (!search) {
            setFilteredDoctors(doctors);
            return;
        }

        const query = search.toLowerCase();
        const filtered = doctors.filter(
            (doc) =>
                doc.user?.full_name?.toLowerCase().includes(query) ||
                doc.specialization?.toLowerCase().includes(query)
        );
        setFilteredDoctors(filtered);
    }, [search, doctors]);

    const handleSelect = (doctor) => {
        setDoctor(doctor);
        nextStep();
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error) {
        return <Alert variant="error">{error}</Alert>;
    }

    return (
        <div>
            {/* Header with Navigation */}
            <div className="flex items-center justify-between mb-6">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={prevStep}
                    className="gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Department
                </Button>
                <div className="text-right">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Choose a Doctor
                    </h2>
                    <p className="text-gray-600">
                        {selection.department?.name} Department
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6">
                <Input
                    placeholder="Search by name or specialization..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    leftIcon={<Search className="w-5 h-5" />}
                />
            </div>

            {/* Doctor List */}
            {filteredDoctors.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    No doctors found matching your criteria.
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredDoctors.map((doctor) => {
                        const isSelected = selection.doctor?.id === doctor.id;

                        return (
                            <Card
                                key={doctor.id}
                                onClick={() => handleSelect(doctor)}
                                hoverable
                                className={cn(
                                    'p-4 cursor-pointer transition-all',
                                    isSelected && 'ring-2 ring-primary-500 bg-primary-50'
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <Avatar
                                        name={doctor.user?.full_name}
                                        size="lg"
                                    />

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900">
                                                Dr. {doctor.user?.full_name}
                                            </h3>
                                            {doctor.is_available && (
                                                <Badge variant="success" size="sm">Available</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {doctor.specialization}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                            {doctor.experience_years && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {doctor.experience_years} years exp.
                                                </span>
                                            )}
                                            {doctor.average_rating && (
                                                <span className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-yellow-500" />
                                                    {doctor.average_rating.toFixed(1)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        {doctor.consultation_fee && (
                                            <p className="font-semibold text-gray-900">
                                                ₹{doctor.consultation_fee}
                                            </p>
                                        )}
                                        <Button
                                            size="sm"
                                            variant={isSelected ? 'primary' : 'outline'}
                                            className="mt-2"
                                        >
                                            {isSelected ? 'Selected' : 'Select'}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Step2Doctor;
