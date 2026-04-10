/**
 * Admin Doctors Page
 * 
 * Manage doctors - promote users to doctors.
 */
import { useState, useEffect } from 'react';
import { Card, Spinner, Badge, Button, Input, Avatar, Modal } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { Search, Plus, Edit2, UserPlus, Mail, Building2 } from 'lucide-react';

const AdminDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    // Form state for promoting user to doctor
    const [formData, setFormData] = useState({
        email: '',
        department_id: '',
        specialization: '',
        experience_years: '',
        consultation_fee: '',
    });
    const [searchingUser, setSearchingUser] = useState(false);
    const [foundUser, setFoundUser] = useState(null);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [doctorsRes, deptsRes] = await Promise.all([
                supabase
                    .from('doctors')
                    .select(`
                        *,
                        department:departments(name),
                        user:users(full_name, email)
                    `)
                    .order('created_at', { ascending: false }),
                supabase.from('departments').select('*').eq('is_active', true).order('name'),
            ]);

            setDoctors(doctorsRes.data || []);
            setDepartments(deptsRes.data || []);
        } catch (err) {
            console.error('Error fetching data:', err);
            setDoctors([]);
            setDepartments([]);
        } finally {
            setLoading(false);
        }
    };

    const searchUser = async () => {
        if (!formData.email) return;

        setSearchingUser(true);
        setFoundUser(null);
        setFormError('');

        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', formData.email)
                .single();

            if (error || !data) {
                setFormError('User not found. Make sure they have signed up first.');
                return;
            }

            if (data.role === 'doctor') {
                setFormError('This user is already a doctor.');
                return;
            }

            setFoundUser(data);
        } catch (err) {
            setFormError('Error searching for user.');
        } finally {
            setSearchingUser(false);
        }
    };

    const promoteToDoctor = async () => {
        if (!foundUser) return;

        try {
            // Create doctor record
            const { error: doctorError } = await supabase
                .from('doctors')
                .insert({
                    user_id: foundUser.id,
                    department_id: formData.department_id,
                    specialization: formData.specialization,
                    experience_years: parseInt(formData.experience_years) || 0,
                    consultation_fee: parseFloat(formData.consultation_fee) || 0,
                    is_active: true,
                });

            if (doctorError) throw doctorError;

            // Update user role
            const { error: userError } = await supabase
                .from('users')
                .update({ role: 'doctor' })
                .eq('id', foundUser.id);

            if (userError) throw userError;

            setShowModal(false);
            resetForm();
            fetchData();
        } catch (err) {
            setFormError('Failed to promote user to doctor: ' + err.message);
        }
    };

    const toggleActive = async (doctor) => {
        try {
            await supabase
                .from('doctors')
                .update({ is_active: !doctor.is_active })
                .eq('id', doctor.id);
            fetchData();
        } catch (err) {
            console.error('Failed to toggle status:', err);
        }
    };

    const resetForm = () => {
        setFormData({
            email: '',
            department_id: '',
            specialization: '',
            experience_years: '',
            consultation_fee: '',
        });
        setFoundUser(null);
        setFormError('');
    };

    const filteredDoctors = search
        ? doctors.filter(
            (doc) =>
                doc.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                doc.specialization?.toLowerCase().includes(search.toLowerCase())
        )
        : doctors;

    return (
        <div>
            <div className="flex items-center justify-between mb-8 animate-slide-up">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Doctors</h1>
                    <p className="text-gray-500 mt-1">Manage doctor profiles</p>
                </div>
                <Button
                    leftIcon={<UserPlus className="w-4 h-4" />}
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                >
                    Add Doctor
                </Button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <Input
                    placeholder="Search by name or specialization..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    leftIcon={<Search className="w-5 h-5" />}
                    className="max-w-md"
                />
            </div>

            {/* Doctors Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                </div>
            ) : filteredDoctors.length === 0 ? (
                <Card className="p-8 text-center text-gray-500">
                    No doctors found.
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDoctors.map((doctor) => (
                        <Card key={doctor.id} className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Avatar name={doctor.user?.full_name} size="lg" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            Dr. {doctor.user?.full_name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {doctor.specialization}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant={doctor.is_active ? 'success' : 'danger'}>
                                    {doctor.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                                <p className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-gray-400" />
                                    {doctor.department?.name}
                                </p>
                                <p className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    {doctor.user?.email}
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div>
                                    <p className="text-lg font-semibold text-gray-900">
                                        ₹{doctor.consultation_fee}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {doctor.experience_years}y experience
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleActive(doctor)}
                                >
                                    {doctor.is_active ? 'Deactivate' : 'Activate'}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add Doctor Modal */}
            {showModal && (
                <Modal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title="Add Doctor"
                    size="md"
                >
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 mb-4">
                            Search for an existing user by email to promote them to doctor.
                        </p>

                        {/* User Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                User Email
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    placeholder="doctor@example.com"
                                />
                                <Button
                                    variant="outline"
                                    onClick={searchUser}
                                    isLoading={searchingUser}
                                >
                                    Search
                                </Button>
                            </div>
                        </div>

                        {formError && (
                            <p className="text-sm text-red-600">{formError}</p>
                        )}

                        {foundUser && (
                            <>
                                <div className="bg-green-50 p-3 rounded-lg">
                                    <p className="text-sm text-green-800">
                                        Found: <strong>{foundUser.full_name}</strong> ({foundUser.email})
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Department
                                    </label>
                                    <select
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                        value={formData.department_id}
                                        onChange={(e) =>
                                            setFormData({ ...formData, department_id: e.target.value })
                                        }
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map((dept) => (
                                            <option key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <Input
                                    label="Specialization"
                                    value={formData.specialization}
                                    onChange={(e) =>
                                        setFormData({ ...formData, specialization: e.target.value })
                                    }
                                    placeholder="e.g., Cardiologist"
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Experience (years)"
                                        type="number"
                                        value={formData.experience_years}
                                        onChange={(e) =>
                                            setFormData({ ...formData, experience_years: e.target.value })
                                        }
                                    />
                                    <Input
                                        label="Consultation Fee (₹)"
                                        type="number"
                                        value={formData.consultation_fee}
                                        onChange={(e) =>
                                            setFormData({ ...formData, consultation_fee: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button variant="outline" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={promoteToDoctor}>
                                        Promote to Doctor
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AdminDoctors;
