/**
 * Departments Page
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LandingLayout } from '@/components/layout';
import { getDepartments } from '@/services/departments';
import { Card, Button, Spinner, Alert } from '@/components/ui';
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
    ArrowRight,
} from 'lucide-react';

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

const departmentColors = {
    'cardiology': 'bg-red-100 text-red-600',
    'neurology': 'bg-purple-100 text-purple-600',
    'orthopedics': 'bg-blue-100 text-blue-600',
    'ophthalmology': 'bg-cyan-100 text-cyan-600',
    'pediatrics': 'bg-pink-100 text-pink-600',
    'general medicine': 'bg-green-100 text-green-600',
    'internal medicine': 'bg-orange-100 text-orange-600',
    'dermatology': 'bg-yellow-100 text-yellow-600',
};

const getIcon = (name) => {
    const key = name?.toLowerCase();
    return departmentIcons[key] || Stethoscope;
};

const getColor = (name) => {
    const key = name?.toLowerCase();
    return departmentColors[key] || 'bg-gray-100 text-gray-600';
};

const Departments = () => {
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

    return (
        <LandingLayout>
            <div className="container-app py-12">
                <div className="text-center mb-12 animate-slide-up">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Medical Departments
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Explore our comprehensive range of medical specialties and
                        find the right care for your needs.
                    </p>
                </div>

                {error && (
                    <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Spinner size="lg" />
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {departments.map((dept) => {
                            const Icon = getIcon(dept.name);
                            const colorClass = getColor(dept.name);

                            return (
                                <Card key={dept.id} hoverable className="p-6">
                                    <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center mb-4', colorClass)}>
                                        <Icon className="w-7 h-7" />
                                    </div>

                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        {dept.name}
                                    </h3>

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {dept.description || 'Comprehensive care and treatment for all your medical needs.'}
                                    </p>

                                    <Link to={`/doctors?department=${dept.id}`}>
                                        <Button variant="ghost" className="group -ml-2">
                                            View Doctors
                                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </LandingLayout>
    );
};

export default Departments;
