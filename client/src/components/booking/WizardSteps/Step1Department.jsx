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
            <h2 className="text-2xl font-heading font-black text-[#1A2B48] mb-2">
                Select Clinical Department
            </h2>
            <p className="text-slate-500 font-medium mb-6">
                Choose the medical specialty you need for your consultation.
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
                                'p-6 text-center cursor-pointer transition-all border border-slate-200',
                                isSelected ? 'ring-2 ring-[#008080] bg-[#008080]/5 shadow-md' : 'hover:border-[#008080]/30 hover:bg-slate-50'
                            )}
                        >
                            <div
                                className={cn(
                                    'w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 border',
                                    isSelected ? 'bg-white border-[#008080]/20 shadow-sm' : 'bg-slate-50 border-slate-100'
                                )}
                            >
                                <Icon
                                    className={cn(
                                        'w-7 h-7',
                                        isSelected ? 'text-[#008080]' : 'text-slate-400'
                                    )}
                                />
                            </div>
                            <h3 className="font-heading font-bold text-[#1A2B48]">{dept.name}</h3>
                            {dept.description && (
                                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
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
