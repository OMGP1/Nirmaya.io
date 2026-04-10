/**
 * SOSModal — Full-screen Emergency Triage Modal
 * 
 * Three-phase flow:
 * 1. GPS acquisition with radar animation
 * 2. Nearest doctors list sorted by proximity
 * 3. Confirmation with assigned doctor details
 * 
 * Uses clinical design tokens:
 * - --destructive (#EF4444) as primary
 * - Glassmorphism overlay
 * - Alert pulse animations
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertTriangle, MapPin, Loader2, CheckCircle2,
    X, Phone, Navigation, Shield, Radio,
} from 'lucide-react';
import { getPatientLocation, findNearestDoctors, triggerSOSBooking } from '@/services/emergency';
import EmergencyDoctorCard from './EmergencyDoctorCard';

const SOS_PHASES = {
    LOCATING: 'locating',
    DOCTORS: 'doctors',
    CONFIRMING: 'confirming',
    SUCCESS: 'success',
    ERROR: 'error',
};

const SOSModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [phase, setPhase] = useState(SOS_PHASES.LOCATING);
    const [location, setLocation] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [appointment, setAppointment] = useState(null);
    const [error, setError] = useState(null);
    const [isBooking, setIsBooking] = useState(false);

    // Phase 1: Acquire GPS location
    const acquireLocation = useCallback(async () => {
        setPhase(SOS_PHASES.LOCATING);
        setError(null);

        try {
            const loc = await getPatientLocation(5000);
            setLocation(loc);

            // Phase 2: Find nearest doctors
            const result = await findNearestDoctors(loc.lat, loc.lng);
            setDoctors(result.doctors || []);
            setPhase(SOS_PHASES.DOCTORS);
        } catch (err) {
            setError(err.message || 'Failed to locate nearby doctors');
            setPhase(SOS_PHASES.ERROR);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            acquireLocation();
        }
        return () => {
            // Reset state when modal closes
            setPhase(SOS_PHASES.LOCATING);
            setLocation(null);
            setDoctors([]);
            setSelectedDoctor(null);
            setAppointment(null);
            setError(null);
            setIsBooking(false);
        };
    }, [isOpen, acquireLocation]);

    // Phase 3: Trigger emergency booking
    const handleEmergencyBook = async () => {
        if (!location) return;
        setIsBooking(true);
        setPhase(SOS_PHASES.CONFIRMING);

        try {
            const result = await triggerSOSBooking(
                location.lat,
                location.lng,
                'Emergency SOS Alert — Immediate assistance required'
            );
            setAppointment(result.appointment);
            setSelectedDoctor(result.assigned_doctor);
            setPhase(SOS_PHASES.SUCCESS);
        } catch (err) {
            setError(err.message || 'Failed to create emergency booking');
            setPhase(SOS_PHASES.ERROR);
        } finally {
            setIsBooking(false);
        }
    };

    const handleSelectDoctor = (doctor) => {
        setSelectedDoctor(doctor);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop — red-tinted glassmorphism */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-red-950/80 via-black/70 to-red-900/80 backdrop-blur-xl"
                onClick={phase === SOS_PHASES.SUCCESS ? onClose : undefined}
            />

            {/* Content */}
            <div className="relative w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all border border-white/10"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* ===== PHASE: LOCATING ===== */}
                {phase === SOS_PHASES.LOCATING && (
                    <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-10 text-center">
                        {/* Radar Animation */}
                        <div className="relative w-32 h-32 mx-auto mb-8">
                            <div className="absolute inset-0 rounded-full border-2 border-red-400/30 animate-ping" />
                            <div className="absolute inset-2 rounded-full border-2 border-red-400/40 animate-ping" style={{ animationDelay: '0.3s' }} />
                            <div className="absolute inset-4 rounded-full border-2 border-red-400/50 animate-ping" style={{ animationDelay: '0.6s' }} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.5)]">
                                    <Navigation className="w-7 h-7 text-white animate-pulse" />
                                </div>
                            </div>
                        </div>

                        <h2 className="text-2xl font-heading font-black text-white mb-2">
                            Acquiring Location
                        </h2>
                        <p className="text-sm text-white/60 mb-4">
                            Triangulating your GPS coordinates to find the nearest available physician...
                        </p>
                        <div className="flex items-center justify-center gap-2 text-red-300 text-xs font-bold">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Scanning proximity network
                        </div>
                    </div>
                )}

                {/* ===== PHASE: DOCTORS LIST ===== */}
                {phase === SOS_PHASES.DOCTORS && (
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-heading font-black text-white">Emergency Doctors Nearby</h2>
                                    <p className="text-[11px] text-white/70 font-medium">
                                        {doctors.length} available within 50km
                                        {location?.isDemo && ' • Demo Location'}
                                    </p>
                                </div>
                            </div>
                            {location && (
                                <div className="flex items-center gap-2 mt-3 bg-white/10 rounded-xl px-3 py-2">
                                    <MapPin className="w-3.5 h-3.5 text-white/70" />
                                    <span className="text-[10px] font-mono text-white/80">
                                        {location.lat.toFixed(4)}°N, {location.lng.toFixed(4)}°E
                                        {location.isDemo && ' (Demo)'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Doctor List */}
                        <div className="p-4 space-y-3 max-h-[320px] overflow-y-auto">
                            {doctors.length > 0 ? (
                                doctors.map((doc) => (
                                    <EmergencyDoctorCard
                                        key={doc.doctor_id}
                                        doctor={doc}
                                        onSelect={handleSelectDoctor}
                                        isSelected={selectedDoctor?.doctor_id === doc.doctor_id}
                                        isLoading={isBooking}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-400">
                                    <MapPin className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                                    <p className="text-sm font-bold">No doctors found nearby</p>
                                    <p className="text-xs mt-1">Try expanding search radius</p>
                                </div>
                            )}
                        </div>

                        {/* Action Bar */}
                        <div className="p-4 bg-slate-50 border-t border-slate-200">
                            <button
                                onClick={handleEmergencyBook}
                                disabled={isBooking || doctors.length === 0}
                                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-heading font-black text-sm rounded-2xl shadow-[0_4px_20px_rgba(239,68,68,0.4)] hover:shadow-[0_8px_30px_rgba(239,68,68,0.5)] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {isBooking ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Dispatching Emergency...
                                    </>
                                ) : (
                                    <>
                                        <Radio className="w-5 h-5" />
                                        🚨 Dispatch SOS to Nearest Doctor
                                    </>
                                )}
                            </button>
                            <p className="text-center text-[10px] text-slate-400 mt-2 flex items-center justify-center gap-1">
                                <Shield className="w-3 h-3" />
                                Auto-assigns to closest available • DPDPA Encrypted
                            </p>
                        </div>
                    </div>
                )}

                {/* ===== PHASE: CONFIRMING ===== */}
                {phase === SOS_PHASES.CONFIRMING && (
                    <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-10 text-center">
                        <Loader2 className="w-16 h-16 text-red-400 animate-spin mx-auto mb-6" />
                        <h2 className="text-2xl font-heading font-black text-white mb-2">
                            Creating Emergency Booking
                        </h2>
                        <p className="text-sm text-white/60">
                            Assigning nearest physician and creating priority appointment...
                        </p>
                    </div>
                )}

                {/* ===== PHASE: SUCCESS ===== */}
                {phase === SOS_PHASES.SUCCESS && (
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                        {/* Success Banner */}
                        <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-6 py-8 text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-xl font-heading font-black text-white mb-1">
                                Emergency Dispatched
                            </h2>
                            <p className="text-sm text-white/80">
                                Your SOS has been sent to the nearest available doctor
                            </p>
                        </div>

                        {/* Assigned Doctor Info */}
                        {selectedDoctor && (
                            <div className="p-6 space-y-4">
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                                        Assigned Physician
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-green-500 text-white flex items-center justify-center font-black text-base">
                                            {selectedDoctor.name?.charAt(0) || 'D'}
                                        </div>
                                        <div>
                                            <p className="font-heading font-bold text-[#0B1120]">
                                                Dr. {selectedDoctor.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {selectedDoctor.specialization} • {selectedDoctor.department}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedDoctor.distance_km && (
                                        <div className="flex items-center gap-2 mt-3 text-xs text-green-600 font-bold">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {selectedDoctor.distance_km} km away — Nearest available
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => {
                                            onClose();
                                            navigate('/appointments');
                                        }}
                                        className="py-3 bg-[#0B1120] text-white font-heading font-bold text-sm rounded-xl hover:bg-[#1a2a40] transition-colors"
                                    >
                                        View Appointments
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="py-3 bg-slate-100 text-[#0B1120] font-heading font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ===== PHASE: ERROR ===== */}
                {phase === SOS_PHASES.ERROR && (
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-6 text-center">
                            <AlertTriangle className="w-10 h-10 text-white mx-auto mb-3" />
                            <h2 className="text-lg font-heading font-black text-white">
                                SOS Alert Failed
                            </h2>
                        </div>
                        <div className="p-6 text-center">
                            <p className="text-sm text-slate-600 mb-4">{error}</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={acquireLocation}
                                    className="py-3 bg-red-600 text-white font-heading font-bold text-sm rounded-xl hover:bg-red-700 transition-colors"
                                >
                                    Retry
                                </button>
                                <button
                                    onClick={onClose}
                                    className="py-3 bg-slate-100 text-[#0B1120] font-heading font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                            <a
                                href="tel:112"
                                className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
                            >
                                <Phone className="w-4 h-4" />
                                Call Emergency Services (112)
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SOSModal;
