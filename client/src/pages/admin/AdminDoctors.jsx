/**
 * Admin Doctors Page — Niramaya System Engine
 * 
 * Manage doctors - promote users to doctors.
 * All Supabase backend logic preserved.
 */
import { useState, useEffect } from 'react';
import { Spinner, Modal } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { Search, UserPlus, Mail, Building2, Users } from 'lucide-react';

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

    const inputClasses = "w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-[#0B1120] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent transition-all";

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-[#0D9488]" />
                        <span className="text-[10px] font-black text-[#0D9488] uppercase tracking-widest">Personnel Registry</span>
                    </div>
                    <h1 className="text-2xl font-heading font-black text-[#0B1120]">Doctors</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage clinical specialist profiles and credentials</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#0B1120] text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-md hover:brightness-110 transition-all"
                >
                    <UserPlus className="w-4 h-4" /> Add Doctor
                </button>
            </div>

            {/* Search */}
            <div className="mb-6 max-w-md">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name or specialization..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`${inputClasses} pl-11`}
                    />
                </div>
            </div>

            {/* Doctors Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                </div>
            ) : filteredDoctors.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 shadow-sm">
                    No doctors found.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDoctors.map((doctor) => (
                        <div key={doctor.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-[#0D9488]/10 flex items-center justify-center border border-[#0D9488]/20 text-[#0D9488] font-bold text-sm">
                                        {doctor.user?.full_name?.charAt(0) || 'D'}
                                    </div>
                                    <div>
                                        <h3 className="font-heading font-bold text-[#0B1120]">
                                            Dr. {doctor.user?.full_name}
                                        </h3>
                                        <p className="text-xs text-slate-500 font-medium">
                                            {doctor.specialization}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 text-[9px] font-black rounded uppercase ${doctor.is_active ? 'bg-[#0D9488] text-white' : 'bg-slate-200 text-slate-500'}`}>
                                    {doctor.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-slate-600 mb-4">
                                <p className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs">{doctor.department?.name}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs truncate">{doctor.user?.email}</span>
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <div>
                                    <p className="text-lg font-heading font-black text-[#0B1120]">
                                        ₹{doctor.consultation_fee}
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">
                                        {doctor.experience_years}y experience
                                    </p>
                                </div>
                                <button
                                    onClick={() => toggleActive(doctor)}
                                    className={`px-4 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-widest border transition-all ${
                                        doctor.is_active
                                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                                            : 'border-[#0D9488] text-[#0D9488] hover:bg-[#0D9488]/10'
                                    }`}
                                >
                                    {doctor.is_active ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        </div>
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
                        <p className="text-sm text-slate-600 mb-4">
                            Search for an existing user by email to promote them to doctor.
                        </p>

                        {/* User Search */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">
                                User Email
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="doctor@example.com"
                                    className={inputClasses}
                                />
                                <button
                                    onClick={searchUser}
                                    disabled={searchingUser}
                                    className="px-4 py-2 border border-slate-200 text-sm font-bold text-[#0B1120] rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
                                >
                                    {searchingUser ? 'Searching...' : 'Search'}
                                </button>
                            </div>
                        </div>

                        {formError && (
                            <p className="text-sm text-red-600 font-medium">{formError}</p>
                        )}

                        {foundUser && (
                            <>
                                <div className="bg-[#0D9488]/10 border border-[#0D9488]/20 p-3 rounded-lg">
                                    <p className="text-sm text-[#0D9488] font-bold">
                                        Found: <strong>{foundUser.full_name}</strong> ({foundUser.email})
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">
                                        Department
                                    </label>
                                    <select
                                        className={inputClasses}
                                        value={formData.department_id}
                                        onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map((dept) => (
                                            <option key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Specialization</label>
                                    <input
                                        type="text"
                                        value={formData.specialization}
                                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                        placeholder="e.g., Cardiologist"
                                        className={inputClasses}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Experience (years)</label>
                                        <input
                                            type="number"
                                            value={formData.experience_years}
                                            onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                                            className={inputClasses}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Fee (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.consultation_fee}
                                            onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
                                            className={inputClasses}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 border border-slate-200 text-sm font-bold text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={promoteToDoctor}
                                        className="px-5 py-2 bg-[#0B1120] text-white text-sm font-bold rounded-lg hover:brightness-110 transition-all"
                                    >
                                        Promote to Doctor
                                    </button>
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
