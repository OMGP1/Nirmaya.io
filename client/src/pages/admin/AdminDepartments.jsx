/**
 * Admin Departments Page — Niramaya System Engine
 * All Supabase backend logic preserved.
 */
import { useState, useEffect } from 'react';
import { Spinner, Modal } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Building2, Heart, Brain, Bone, Eye, Baby, Stethoscope, Activity, Pill } from 'lucide-react';

// Department icons mapping (same as patient portal)
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
    'cardiology': 'bg-red-50 text-red-500 border-red-100',
    'neurology': 'bg-purple-50 text-purple-500 border-purple-100',
    'orthopedics': 'bg-blue-50 text-blue-500 border-blue-100',
    'ophthalmology': 'bg-cyan-50 text-cyan-500 border-cyan-100',
    'pediatrics': 'bg-pink-50 text-pink-500 border-pink-100',
    'general medicine': 'bg-green-50 text-green-500 border-green-100',
    'internal medicine': 'bg-orange-50 text-orange-500 border-orange-100',
    'dermatology': 'bg-yellow-50 text-yellow-500 border-yellow-100',
};

const getIcon = (name) => {
    const key = name?.toLowerCase();
    return departmentIcons[key] || Building2;
};

const getColor = (name) => {
    const key = name?.toLowerCase();
    return departmentColors[key] || 'bg-[#0D9488]/10 text-[#0D9488] border-[#0D9488]/20';
};

const AdminDepartments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('departments')
                .select('*')
                .order('name');

            if (error) throw error;
            setDepartments(data || []);
        } catch (err) {
            console.error('Error fetching departments:', err);
            setDepartments([]);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (dept = null) => {
        if (dept) {
            setEditingDept(dept);
            setFormData({ name: dept.name, description: dept.description || '' });
        } else {
            setEditingDept(null);
            setFormData({ name: '', description: '' });
        }
        setShowModal(true);
    };

    const saveDepartment = async () => {
        if (!formData.name.trim()) return;

        setSaving(true);
        try {
            if (editingDept) {
                await supabase
                    .from('departments')
                    .update({ name: formData.name, description: formData.description })
                    .eq('id', editingDept.id);
            } else {
                await supabase
                    .from('departments')
                    .insert({ name: formData.name, description: formData.description });
            }
            setShowModal(false);
            fetchDepartments();
        } catch (err) {
            console.error('Failed to save department:', err);
        } finally {
            setSaving(false);
        }
    };

    const deleteDepartment = async (id) => {
        if (!confirm('Are you sure you want to delete this department?')) return;

        try {
            await supabase.from('departments').delete().eq('id', id);
            fetchDepartments();
        } catch (err) {
            console.error('Failed to delete department:', err);
        }
    };

    const inputClasses = "w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-[#0B1120] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent transition-all";

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4 text-[#0D9488]" />
                        <span className="text-[10px] font-black text-[#0D9488] uppercase tracking-widest">Infrastructure</span>
                    </div>
                    <h1 className="text-2xl font-heading font-black text-[#0B1120]">Departments</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage medical departments and clinical divisions</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#0B1120] text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-md hover:brightness-110 transition-all"
                >
                    <Plus className="w-4 h-4" /> Add Department
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {departments.map((dept) => {
                        const Icon = getIcon(dept.name);
                        const colorClass = getColor(dept.name);
                        const colorParts = colorClass.split(' ');
                        return (
                            <div key={dept.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorClass}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-heading font-bold text-[#0B1120]">{dept.name}</h3>
                                            <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{dept.description}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => openModal(dept)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-[#0D9488] hover:bg-[#0D9488]/5 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" /> Edit
                                    </button>
                                    <button
                                        onClick={() => deleteDepartment(dept.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <Modal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={editingDept ? 'Edit Department' : 'Add Department'}
                    size="sm"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Department Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Cardiology"
                                className={inputClasses}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Description</label>
                            <textarea
                                className={`${inputClasses} resize-none`}
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description..."
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 border border-slate-200 text-sm font-bold text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveDepartment}
                                disabled={saving}
                                className="px-5 py-2 bg-[#0B1120] text-white text-sm font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : editingDept ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AdminDepartments;
