/**
 * Admin Departments Page
 */
import { useState, useEffect } from 'react';
import { Card, Spinner, Button, Input, Modal } from '@/components/ui';
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
    return departmentIcons[key] || Building2;
};

const getColor = (name) => {
    const key = name?.toLowerCase();
    return departmentColors[key] || 'bg-primary-100 text-primary-600';
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

    return (
        <div>
            <div className="flex items-center justify-between mb-8 animate-slide-up">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
                    <p className="text-gray-500 mt-1">Manage medical departments</p>
                </div>
                <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => openModal()}>
                    Add Department
                </Button>
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
                        return (
                            <Card key={dept.id} className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass.split(' ')[0]}`}>
                                            <Icon className={`w-6 h-6 ${colorClass.split(' ')[1]}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                                            <p className="text-sm text-gray-500">{dept.description}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openModal(dept)}
                                        leftIcon={<Edit2 className="w-4 h-4" />}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteDepartment(dept.id)}
                                        className="text-red-600 hover:text-red-700"
                                        leftIcon={<Trash2 className="w-4 h-4" />}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </Card>
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
                        <Input
                            label="Department Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Cardiology"
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description..."
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => setShowModal(false)}>
                                Cancel
                            </Button>
                            <Button onClick={saveDepartment} isLoading={saving}>
                                {editingDept ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AdminDepartments;
