/**
 * Doctor Availability Page
 * 
 * Manage working hours and availability.
 * Uses Supabase directly to avoid CORS issues.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardContent, CardTitle, Button, Spinner, Alert } from '@/components/ui';
import { Clock, Save, Plus, Trash2 } from 'lucide-react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DEFAULT_SLOT = { start: '09:00', end: '17:00' };

const DoctorAvailability = () => {
    const { user } = useAuth();
    const [doctorId, setDoctorId] = useState(null);
    const [availability, setAvailability] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Get doctor ID and availability on mount
    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                // Get doctor record
                const { data: doctor, error: doctorError } = await supabase
                    .from('doctors')
                    .select('id, availability')
                    .eq('user_id', user.id)
                    .single();

                if (doctorError || !doctor) {
                    setError('Doctor profile not found');
                    setLoading(false);
                    return;
                }

                setDoctorId(doctor.id);
                setAvailability(doctor.availability || {});
            } catch (err) {
                setError('Failed to load availability');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleSave = async () => {
        if (!doctorId) return;

        try {
            setSaving(true);
            setError(null);
            setSuccess(false);

            const { error: updateError } = await supabase
                .from('doctors')
                .update({ availability })
                .eq('id', doctorId);

            if (updateError) {
                throw updateError;
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const toggleDay = (day) => {
        setAvailability((prev) => {
            if (prev[day]) {
                const { [day]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [day]: [{ ...DEFAULT_SLOT }] };
        });
    };

    const addSlot = (day) => {
        setAvailability((prev) => ({
            ...prev,
            [day]: [...(prev[day] || []), { ...DEFAULT_SLOT }],
        }));
    };

    const removeSlot = (day, index) => {
        setAvailability((prev) => ({
            ...prev,
            [day]: prev[day].filter((_, i) => i !== index),
        }));
    };

    const updateSlot = (day, index, field, value) => {
        setAvailability((prev) => ({
            ...prev,
            [day]: prev[day].map((slot, i) =>
                i === index ? { ...slot, [field]: value } : slot
            ),
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Availability</h1>
                    <p className="text-muted-foreground">Set your working hours for each day</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            {error && <Alert variant="error">{error}</Alert>}
            {success && <Alert variant="success">Availability saved successfully!</Alert>}

            <Card>
                <CardContent className="p-0 divide-y">
                    {DAYS.map((day) => {
                        const isActive = availability[day] && availability[day].length > 0;
                        return (
                            <div key={day} className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => toggleDay(day)}
                                            className={`w-12 h-6 rounded-full transition-colors ${isActive ? 'bg-primary' : 'bg-gray-300'
                                                }`}
                                        >
                                            <div
                                                className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${isActive ? 'translate-x-6' : 'translate-x-0.5'
                                                    }`}
                                            />
                                        </button>
                                        <span className="font-medium capitalize">{day}</span>
                                    </div>
                                    {isActive && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => addSlot(day)}
                                            className="gap-1"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Slot
                                        </Button>
                                    )}
                                </div>

                                {isActive && availability[day]?.length > 0 && (
                                    <div className="space-y-2 ml-14">
                                        {availability[day].map((slot, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-muted-foreground" />
                                                <input
                                                    type="time"
                                                    value={slot.start}
                                                    onChange={(e) => updateSlot(day, idx, 'start', e.target.value)}
                                                    className="border rounded px-2 py-1"
                                                />
                                                <span>to</span>
                                                <input
                                                    type="time"
                                                    value={slot.end}
                                                    onChange={(e) => updateSlot(day, idx, 'end', e.target.value)}
                                                    className="border rounded px-2 py-1"
                                                />
                                                {availability[day].length > 1 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeSlot(day, idx)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {!isActive && (
                                    <p className="text-sm text-muted-foreground ml-14">Not available</p>
                                )}
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        </div>
    );
};

export default DoctorAvailability;
