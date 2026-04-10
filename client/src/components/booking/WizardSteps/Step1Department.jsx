/**
 * Step 1: Department Selection
 */
import { useState, useEffect } from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { getDepartments } from '@/services/departments';
import { Card, Spinner, Alert } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
    Heart,
    Brain,
    Bone,
    Eye,
    Baby,
    Stethoscope,
    Activity,
    Pill,
} from 'lucide-react';

// Icon mapping for departments
const departmentIcons = {
    'cardiology': Heart,
    'neurology': Brain,
    'orthopedics': Bone,
    'ophthalmology': Eye,
    'pediatrics': Baby,
    'general medicine': Stethoscope,
    'internal medicine': Activity,
    'dermatology': Pill,
};

const getIcon = (name) => {
    const key = name?.toLowerCase();
    return departmentIcons[key] || Stethoscope;
};

const Step1Department = () => {
    const { selection, setDepartment, nextStep } = useBooking();
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const data = await getDepartments();
                setDepartments(data);
            } catch (err) {
                setError('Failed to load departments. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchDepartments();
    }, []);

    const handleSelect = (department) => {
        setDepartment(department);
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Select Department
            </h2>
            <p className="text-gray-600 mb-6">
                Choose the medical specialty you need.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {departments.map((dept) => {
                    const Icon = getIcon(dept.name);
                    const isSelected = selection.department?.id === dept.id;

                    return (
                        <Card
                            key={dept.id}
                            onClick={() => handleSelect(dept)}
                            hoverable
                            className={cn(
                                'p-6 text-center cursor-pointer transition-all',
                                isSelected && 'ring-2 ring-primary-500 bg-primary-50'
                            )}
                        >
                            <div
                                className={cn(
                                    'w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3',
                                    isSelected ? 'bg-primary-100' : 'bg-gray-100'
                                )}
                            >
                                <Icon
                                    className={cn(
                                        'w-7 h-7',
                                        isSelected ? 'text-primary-600' : 'text-gray-600'
                                    )}
                                />
                            </div>
                            <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                            {dept.description && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                    {dept.description}
                                </p>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default Step1Department;
