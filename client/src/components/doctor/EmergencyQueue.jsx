/**
 * EmergencyQueue — Realtime Emergency Dispatch Queue for Doctors
 * 
 * Listens for new emergency appointments via Supabase Realtime
 * and displays flashing alert cards with patient info, severity,
 * and accept/view actions.
 * 
 * Features:
 * - Supabase Realtime INSERT subscription on appointments
 * - Visual flash alerts (red border pulse)
 * - Optional audio alert toggle (respects browser autoplay policy)
 * - Emergency count badge
 * - Auto-removes when appointment is confirmed/cancelled
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import {
    AlertTriangle, Radio, Volume2, VolumeX, MapPin,
    ArrowRight, Clock, User, X, Bell,
} from 'lucide-react';

const EmergencyQueue = ({ doctorId }) => {
    const [emergencies, setEmergencies] = useState([]);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [isFlashing, setIsFlashing] = useState(false);
    const audioContextRef = useRef(null);

    // Play alert beep using Web Audio API
    const playAlertSound = useCallback(() => {
        if (!soundEnabled) return;

        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = audioContextRef.current;
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.5);

            // Second beep
            setTimeout(() => {
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.frequency.setValueAtTime(1100, ctx.currentTime);
                osc2.type = 'sine';
                gain2.gain.setValueAtTime(0.3, ctx.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
                osc2.start(ctx.currentTime);
                osc2.stop(ctx.currentTime + 0.5);
            }, 200);
        } catch (e) {
            console.warn('Audio alert failed:', e);
        }
    }, [soundEnabled]);

    // Flash effect when new emergency arrives
    const triggerFlash = useCallback(() => {
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 3000);
    }, []);

    // Subscribe to Realtime emergency appointments
    useEffect(() => {
        if (!doctorId) return;

        // Fetch existing emergency appointments
        const fetchExisting = async () => {
            const { data } = await supabase
                .from('appointments')
                .select(`
                    *,
                    patient:users!appointments_patient_id_fkey(id, full_name, email, phone)
                `)
                .eq('doctor_id', doctorId)
                .eq('is_emergency', true)
                .in('status', ['pending', 'confirmed'])
                .order('created_at', { ascending: false })
                .limit(10);

            if (data) setEmergencies(data);
        };

        fetchExisting();

        // Realtime subscription for new emergencies
        const channel = supabase
            .channel(`emergency-queue-${doctorId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'appointments',
                filter: `doctor_id=eq.${doctorId}`,
            }, (payload) => {
                const newAppt = payload.new;
                if (newAppt.is_emergency) {
                    // Fetch patient details for the new emergency
                    supabase
                        .from('users')
                        .select('id, full_name, email, phone')
                        .eq('id', newAppt.patient_id)
                        .single()
                        .then(({ data: patient }) => {
                            setEmergencies(prev => [{
                                ...newAppt,
                                patient: patient || { full_name: 'Unknown Patient' },
                            }, ...prev]);
                        });

                    playAlertSound();
                    triggerFlash();

                    // Browser notification (if permitted)
                    if (Notification.permission === 'granted') {
                        new Notification('🚨 Emergency SOS Alert', {
                            body: `New emergency appointment requires immediate attention`,
                            icon: '🚨',
                            tag: 'emergency-sos',
                        });
                    }
                }
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'appointments',
                filter: `doctor_id=eq.${doctorId}`,
            }, (payload) => {
                const updated = payload.new;
                if (updated.status === 'cancelled' || updated.status === 'completed') {
                    setEmergencies(prev => prev.filter(e => e.id !== updated.id));
                }
            })
            .subscribe();

        // Request notification permission
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        return () => {
            supabase.removeChannel(channel);
        };
    }, [doctorId, playAlertSound, triggerFlash]);

    // Enable sound (requires user interaction for browser autoplay policy)
    const toggleSound = () => {
        if (!soundEnabled) {
            // Resume AudioContext on first user interaction
            if (audioContextRef.current?.state === 'suspended') {
                audioContextRef.current.resume();
            }
        }
        setSoundEnabled(!soundEnabled);
    };

    const dismissEmergency = (id) => {
        setEmergencies(prev => prev.filter(e => e.id !== id));
    };

    if (emergencies.length === 0) return null;

    return (
        <div className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
            isFlashing
                ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
                : 'border-red-200 shadow-lg'
        }`}>
            {/* Header */}
            <div className={`px-5 py-3 flex items-center justify-between transition-colors ${
                isFlashing
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 text-red-700'
            }`}>
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isFlashing ? 'bg-white/20' : 'bg-red-500'
                    }`}>
                        <AlertTriangle className={`w-4 h-4 ${isFlashing ? 'text-white' : 'text-white'} ${isFlashing ? 'animate-pulse' : ''}`} />
                    </div>
                    <div>
                        <h3 className={`text-sm font-heading font-black uppercase tracking-widest ${
                            isFlashing ? 'text-white' : 'text-red-700'
                        }`}>
                            Emergency Queue
                        </h3>
                        <span className={`text-[9px] font-bold ${isFlashing ? 'text-white/70' : 'text-red-500'}`}>
                            {emergencies.length} active alert{emergencies.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Sound Toggle */}
                    <button
                        onClick={toggleSound}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            isFlashing
                                ? 'bg-white/20 hover:bg-white/30 text-white'
                                : 'bg-red-100 hover:bg-red-200 text-red-600'
                        }`}
                        title={soundEnabled ? 'Mute alerts' : 'Enable sound alerts'}
                    >
                        {soundEnabled
                            ? <Volume2 className="w-4 h-4" />
                            : <VolumeX className="w-4 h-4" />
                        }
                    </button>

                    {/* Emergency count badge */}
                    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${
                        isFlashing
                            ? 'bg-white text-red-600'
                            : 'bg-red-500 text-white'
                    }`}>
                        {emergencies.length}
                    </div>
                </div>
            </div>

            {/* Emergency Cards */}
            <div className="bg-white divide-y divide-red-100 max-h-[300px] overflow-y-auto">
                {emergencies.map((emergency) => (
                    <div
                        key={emergency.id}
                        className="p-4 hover:bg-red-50/50 transition-colors relative group"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                                {/* Patient Avatar */}
                                <div className="relative shrink-0">
                                    <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-black text-sm border-2 border-red-200">
                                        {emergency.patient?.full_name?.charAt(0) || 'P'}
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                                </div>

                                {/* Patient Info */}
                                <div className="min-w-0">
                                    <p className="font-heading font-bold text-sm text-red-700">
                                        {emergency.patient?.full_name || 'Emergency Patient'}
                                    </p>
                                    <p className="text-[10px] text-red-400 font-bold uppercase tracking-tight mt-0.5">
                                        🚨 {emergency.reason || 'SOS Alert'}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500">
                                            <Clock className="w-3 h-3" />
                                            {new Date(emergency.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[8px] font-black rounded uppercase">
                                            High Severity
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                                <Link
                                    to={`/doctor/appointments/${emergency.id}`}
                                    className="px-3 py-2 bg-red-600 text-white text-[10px] font-black rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-1 uppercase tracking-wider shadow-md"
                                >
                                    Respond <ArrowRight className="w-3 h-3" />
                                </Link>
                                <button
                                    onClick={() => dismissEmergency(emergency.id)}
                                    className="w-7 h-7 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-200 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Dismiss"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmergencyQueue;
