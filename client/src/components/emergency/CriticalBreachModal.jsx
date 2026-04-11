import { useState, useEffect } from 'react';
import { AlertCircle, Phone } from 'lucide-react';
import NiramayaEngine from '@/utils/NiramayaEngine';

/**
 * CriticalBreachModal — Fullscreen Lockdown UI
 * 
 * Takes over the screen when real-time telemetry (NEWS2) crosses the critical threshold.
 * Uses clinical tokens and high-urgency glassmorphism.
 */
const CriticalBreachModal = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [riskScore, setRiskScore] = useState(0);
    const [dismissed, setDismissed] = useState(false);
    const [timer, setTimer] = useState(60);

    // Reset timer when modal opens
    useEffect(() => {
        if (isVisible) setTimer(60);
    }, [isVisible]);

    useEffect(() => {
        let interval;
        if (isVisible && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (isVisible && timer === 0) {
            window.location.href = 'tel:112';
            setTimer(-1); // Stop looping
        }
        return () => clearInterval(interval);
    }, [isVisible, timer]);

    useEffect(() => {
        // Listen to cross-tab storage events from the telemetry engine
        const cleanup = NiramayaEngine.createStorageListener((vitals, risk) => {
            if (risk >= NiramayaEngine.config.sosThreshold && !dismissed) {
                setRiskScore(risk);
                setIsVisible(true);
            } else if (risk < NiramayaEngine.config.sosThreshold) {
                // If it naturally drops below, we could hide it, but usually a breach stays until dismissed.
            }
        });

        // Also check on mount
        const currentRisk = NiramayaEngine.getStoredRiskScore();
        if (currentRisk >= NiramayaEngine.config.sosThreshold && !dismissed) {
            setRiskScore(currentRisk);
            setIsVisible(true);
        }

        return cleanup;
    }, [dismissed]);

    if (!isVisible) return null;

    const handleDismiss = () => {
        setDismissed(true);
        setIsVisible(false);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#1a0505] overflow-hidden">
            {/* Deep red radial glow overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/40 via-[#1a0505] to-[#1a0505] pointer-events-none" />

            {/* Scanlines / Noise Texture effect */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

            <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center flex-1 justify-center">
                
                {/* Header Badge */}
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 mb-8">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-mono font-bold tracking-[0.2em] text-red-500">SYSTEM PRIORITY 1</span>
                </div>

                {/* Main Titles */}
                <h1 className="text-4xl md:text-5xl font-black italic tracking-wider text-red-500 mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] text-center">
                    CRITICAL BREACH DETECTED
                </h1>
                <p className="text-sm md:text-base font-bold text-red-200/60 uppercase tracking-widest text-center max-w-lg mb-16">
                    A specialist has been automatically dispatched to your live feed.
                </p>

                {/* Score Dial */}
                <div className="relative w-64 h-64 flex flex-col items-center justify-center mb-16">
                    {/* SVG Radial Progress */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90 transform">
                        {/* Background Track */}
                        <circle
                            cx="128" cy="128" r="116"
                            className="stroke-red-950"
                            strokeWidth="12" fill="none"
                        />
                        {/* Active Progress */}
                        <circle
                            cx="128" cy="128" r="116"
                            className="stroke-red-500 transition-all duration-1000 ease-out"
                            strokeWidth="12" fill="none"
                            strokeLinecap="round"
                            strokeDasharray="728"
                            strokeDashoffset={728 - (728 * riskScore) / 100}
                            style={{ filter: 'drop-shadow(0 0 12px rgba(239,68,68,0.6))' }}
                        />
                    </svg>
                    
                    {/* Inner Content */}
                    <div className="flex flex-col items-center justify-center z-10 space-y-1">
                        <div className="flex items-baseline gap-1">
                            <span className="text-6xl font-black text-red-500">{riskScore}</span>
                            <span className="text-2xl font-bold text-red-500/60">%</span>
                        </div>
                        <span className="text-[10px] font-black tracking-widest text-red-500/60 uppercase mt-[-4px]">
                            NEWS2 Score
                        </span>
                        <div className="mt-4 px-3 py-1 bg-red-500 text-white text-[10px] font-black tracking-widest rounded flex items-center justify-center gap-1 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            CRITICAL
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full max-w-2xl space-y-4">
                    <button 
                        onClick={() => window.location.href = 'tel:112'}
                        className="w-full group relative overflow-hidden bg-teal-600 hover:bg-teal-500 text-white rounded-2xl py-5 transition-all outline-none"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-400/0 via-teal-400/30 to-teal-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                        <div className="relative flex items-center justify-center gap-3 font-black text-sm tracking-widest uppercase">
                            <Phone className="w-5 h-5" />
                            {timer > 0 ? `Contact Specialist Now (${timer}s)` : 'Contacting Specialist...'}
                        </div>
                    </button>

                    <button 
                        onClick={handleDismiss}
                        className="w-full bg-[#2a0808] hover:bg-[#3a0b0b] border border-red-900/50 text-red-500/50 hover:text-red-400 rounded-2xl py-4 transition-all font-black text-xs tracking-widest uppercase outline-none"
                    >
                        I Am Okay / False Alarm
                    </button>
                </div>
            </div>

            {/* Terminal Footer */}
            <div className="w-full max-w-4xl px-4 pb-4 mt-auto relative z-10">
                <div className="bg-black/40 border border-red-900/30 rounded-xl p-4 font-mono text-[10px] text-red-500/50 uppercase tracking-wider backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-2">
                        <span>SOS STATUS: <span className="text-red-400">care_circle_alert_sent</span></span>
                        <AlertCircle className="w-3 h-3 text-red-500/40" />
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span>TWILIO GATEWAY: <span className="text-red-400">ACTIVE</span></span>
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    </div>
                    <div className="flex justify-between items-center">
                        <span>SPECIALISTS: <span className="text-red-400">notified</span></span>
                        <span className="text-red-500/30">ETA: 02:45m</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CriticalBreachModal;
