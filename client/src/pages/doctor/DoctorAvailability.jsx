/**
 * DoctorAvailability — Shift & Availability Planner
 * 
 * Weekly consultation grid with day toggles, shift blocks,
 * public-facing preview card, and global preferences panel.
 * All existing Supabase CRUD logic preserved.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui';
import {
    Clock, Save, Plus, Trash2, Info, ChevronRight,
    Activity, AlertCircle, Check, Download,
} from 'lucide-react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = { monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday' };
const DEFAULT_SLOT = { start: '09:00', end: '17:00' };

const formatTime12 = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hr = parseInt(h, 10);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const h12 = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
    return `${String(h12).padStart(2, '0')}:${m} ${ampm}`;
};

const DoctorAvailability = () => {
    const { user, profile } = useAuth();
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
                const { data: doctor, error: doctorError } = await supabase
                    .from('doctors')
                    .select('id, availability')
                    .eq('user_id', user.id)
                    .maybeSingle();

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

    // Find next available slot for preview
    const activeDays = DAYS.filter(d => availability[d]?.length > 0);
    const nextSlotDay = activeDays[0];
    const nextSlotTime = nextSlotDay && availability[nextSlotDay]?.[0]?.start;

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-heading font-black text-[#0B1120] tracking-tight">Shift & Availability Planner</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-[#1F2937]/60 uppercase tracking-wider">Configure Practice Hours</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="text-[10px] font-bold text-[#0D9488] uppercase tracking-wider">Timezone: IST (UTC+5:30)</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Emergency Override (decorative) */}
                    <div className="hidden sm:flex items-center gap-3 bg-red-50 px-4 py-2 rounded-xl border border-red-100 shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">Emergency Override</span>
                            <span className="text-xs font-bold text-red-900">On-Call Mode</span>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 transition-colors">
                            <span className="inline-block h-4 w-4 translate-x-1 transform rounded-full bg-white transition-transform shadow-sm" />
                        </button>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#0D9488] text-white text-[11px] font-black rounded-xl shadow-lg hover:brightness-110 transition-all uppercase tracking-wider disabled:opacity-40"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Schedule'}
                    </button>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex gap-3 items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <p className="text-sm font-bold text-red-700">{error}</p>
                </div>
            )}
            {success && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex gap-3 items-center">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <p className="text-sm font-bold text-green-700">Schedule saved successfully!</p>
                </div>
            )}

            {/* Planner Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* Left Column: Weekly Schedule (8 cols) */}
                <div className="xl:col-span-8 flex flex-col gap-4">
                    <div className="bg-white rounded-[16px] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <h2 className="text-sm font-heading font-black text-[#1F2937] uppercase tracking-widest">Weekly Consultation Grid</h2>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Set multiple shifts per day</span>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {DAYS.map((day) => {
                                const isActive = availability[day] && availability[day].length > 0;
                                return (
                                    <div key={day} className={`p-5 flex flex-col md:flex-row gap-5 md:items-start ${!isActive ? 'opacity-60' : ''}`}>
                                        {/* Day Label + Toggle */}
                                        <div className="w-32 shrink-0">
                                            <div className="flex items-center gap-3 mb-1.5">
                                                <span className={`text-sm font-bold ${isActive ? 'text-[#1F2937]' : 'text-slate-400'}`}>
                                                    {DAY_LABELS[day]}
                                                </span>
                                                <button
                                                    onClick={() => toggleDay(day)}
                                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isActive ? 'bg-[#0D9488]' : 'bg-slate-200'}`}
                                                >
                                                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                                                </button>
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase ${isActive ? 'text-[#0D9488]' : 'text-slate-400'}`}>
                                                {isActive ? 'Accepting' : 'Unavailable'}
                                            </span>
                                        </div>

                                        {/* Shift Blocks */}
                                        {isActive ? (
                                            <div className="flex-1 space-y-3">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {availability[day].map((slot, idx) => (
                                                        <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 group">
                                                            <div className="flex-1 flex items-center gap-2">
                                                                <Clock className="w-4 h-4 text-[#0D9488] shrink-0" />
                                                                <input
                                                                    type="time"
                                                                    value={slot.start}
                                                                    onChange={(e) => updateSlot(day, idx, 'start', e.target.value)}
                                                                    className="bg-transparent text-xs font-bold text-[#1F2937] border-none outline-none w-20"
                                                                />
                                                                <span className="text-xs text-slate-400">—</span>
                                                                <input
                                                                    type="time"
                                                                    value={slot.end}
                                                                    onChange={(e) => updateSlot(day, idx, 'end', e.target.value)}
                                                                    className="bg-transparent text-xs font-bold text-[#1F2937] border-none outline-none w-20"
                                                                />
                                                            </div>
                                                            {availability[day].length > 1 && (
                                                                <button
                                                                    onClick={() => removeSlot(day, idx)}
                                                                    className="text-slate-300 hover:text-red-500 transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={() => addSlot(day)}
                                                    className="flex items-center gap-2 text-[10px] font-black text-[#0D9488] uppercase tracking-widest hover:text-[#0b7a6f] transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" /> Add Shift Block
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl p-4">
                                                <p className="text-xs font-medium text-slate-400">No shifts scheduled</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column: Preview & Settings (4 cols) */}
                <div className="xl:col-span-4 flex flex-col gap-6">

                    {/* Public View Preview */}
                    <div className="bg-white rounded-[16px] border border-slate-200 shadow-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3">
                            <div className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[8px] font-black rounded uppercase border border-blue-100">Live Preview</div>
                        </div>

                        <h3 className="text-[10px] font-black text-[#1F2937]/40 uppercase tracking-widest mb-6">Patient-Facing Status</h3>

                        <div className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="relative mb-4">
                                <div className="w-20 h-20 rounded-full bg-[#0D9488]/10 flex items-center justify-center text-2xl font-bold text-[#0D9488] border-4 border-white shadow-md">
                                    {profile?.full_name?.charAt(0) || 'D'}
                                </div>
                                <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#0D9488] rounded-full border-2 border-white flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                            </div>

                            <h4 className="text-base font-heading font-black text-[#0B1120]">Dr. {profile?.full_name}</h4>
                            <p className="text-xs font-bold text-[#0D9488] mb-4">Specialist</p>

                            <div className="w-full bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Availability</span>
                                    <span className="text-[10px] font-black text-[#0D9488] uppercase">
                                        {activeDays.length > 0 ? 'Online' : 'Offline'}
                                    </span>
                                </div>
                                <p className="text-sm font-black text-[#0B1120]">Next Available Slot:</p>
                                <p className="text-lg font-heading font-black text-[#0D9488] tracking-tight">
                                    {nextSlotDay ? `${DAY_LABELS[nextSlotDay]}, ${formatTime12(nextSlotTime)}` : 'Not Set'}
                                </p>
                            </div>

                            <button className="w-full mt-4 py-3 bg-[#0B1120] text-white text-[11px] font-black rounded-xl uppercase tracking-widest shadow-lg">
                                Book Consultation
                            </button>
                        </div>
                    </div>

                    {/* Global Preferences */}
                    <div className="bg-[#0B1120] rounded-[16px] shadow-lg p-6 border border-white/5">
                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Global Preferences</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white">Auto-Sync Calendar</span>
                                    <span className="text-[9px] text-white/40 uppercase">Google/Outlook</span>
                                </div>
                                <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-[#0D9488] transition-colors">
                                    <span className="inline-block h-3 w-3 translate-x-5 transform rounded-full bg-white transition-transform" />
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white">Buffer Time</span>
                                    <span className="text-[9px] text-white/40 uppercase">15 mins between slots</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-white/20" />
                            </div>
                            <div className="pt-4 border-t border-white/10">
                                <button className="w-full py-2.5 bg-white/10 text-white text-[10px] font-black rounded-lg uppercase tracking-widest border border-white/5 hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                                    <Download className="w-3.5 h-3.5" /> Export Schedule (PDF)
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Info Alert */}
                    <div className="p-4 bg-teal-50 rounded-xl border border-teal-100 flex gap-3">
                        <Info className="w-5 h-5 text-[#0D9488] shrink-0 mt-0.5" />
                        <p className="text-[11px] font-medium text-teal-900 leading-tight">
                            Changes to your schedule are synced in real-time to the patient directory. Emergency mode overrides all blocks.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-[10px] pt-2">
                <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-[#0D9488]" />
                    <span className="font-black text-[#1F2937] uppercase tracking-tighter">Availability Engine: Active</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="font-bold text-[#1F2937]/40 uppercase tracking-widest">Niramaya Specialist OS v1.2</span>
                    <div className="h-4 w-px bg-slate-200" />
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                        <span className="font-black text-[#10b981] uppercase">Secure Session</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorAvailability;
