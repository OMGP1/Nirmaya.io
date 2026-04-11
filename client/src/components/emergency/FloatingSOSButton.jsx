import { useState, useRef, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import SOSModal from './SOSModal';
import { Radio } from 'lucide-react';

const FloatingSOSButton = () => {
    const { isPatient } = useAuthContext();
    const [isHolding, setIsHolding] = useState(false);
    const [showSOSModal, setShowSOSModal] = useState(false);
    const holdTimerRef = useRef(null);
    
    // Configuration
    const HOLD_DURATION = 3000;
    const CIRCLE_RADIUS = 28;
    const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
    
    // Clear timer if component unmounts
    useEffect(() => {
        return () => {
            if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
        };
    }, []);

    // Only render for authenticated patients
    if (!isPatient) return null;

    const handleHoldStart = (e) => {
        // Only prevent touchstart to let mouse events behave normally (fixing iOS context menus)
        if (e.type === 'touchstart' && e.cancelable) {
            // e.preventDefault(); 
        }
        
        // Prevent re-triggering if modal is already open
        if (showSOSModal) return;
        
        setIsHolding(true);
        
        // Start 3 second countdown
        holdTimerRef.current = setTimeout(() => {
            setIsHolding(false);
            setShowSOSModal(true);
        }, HOLD_DURATION);
    };

    const handleHoldEnd = () => {
        setIsHolding(false);
        if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current);
        }
    };

    return (
        <>
            {/* 
              Global fixed container for the floating button
              Using high z-index to stay above charts/grids but under critical modals
            */}
            <div className="fixed bottom-6 right-6 z-[9900] select-none touch-none">
                <div 
                    className="relative flex items-center justify-center w-16 h-16 group cursor-pointer"
                    onMouseDown={handleHoldStart}
                    onMouseUp={handleHoldEnd}
                    onMouseLeave={handleHoldEnd}
                    onTouchStart={handleHoldStart}
                    onTouchEnd={handleHoldEnd}
                    onTouchCancel={handleHoldEnd}
                >
                    {/* Background track circle */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                        <circle
                            cx="32"
                            cy="32"
                            r={CIRCLE_RADIUS}
                            className="stroke-red-900/10 dark:stroke-white/10"
                            strokeWidth="4"
                            fill="transparent"
                        />
                        {/* Animated foreground circle */}
                        <circle
                            cx="32"
                            cy="32"
                            r={CIRCLE_RADIUS}
                            className="stroke-red-500 origin-center drop-shadow-md"
                            strokeWidth="4"
                            fill="transparent"
                            strokeLinecap="round"
                            style={{
                                strokeDasharray: CIRCLE_CIRCUMFERENCE,
                                strokeDashoffset: isHolding ? 0 : CIRCLE_CIRCUMFERENCE,
                                transition: isHolding 
                                    ? `stroke-dashoffset ${HOLD_DURATION}ms linear` // Smooth fill over 3s
                                    : 'stroke-dashoffset 0.3s ease-out'             // Fast reset on cancel
                            }}
                        />
                    </svg>
                    
                    {/* Inner Action Button */}
                    <div className={`absolute inset-2 rounded-full transition-all flex items-center justify-center shadow-[0_4px_16px_rgba(231,29,54,0.4)]
                        ${isHolding ? 'bg-red-700 scale-95' : 'bg-red-600 group-hover:scale-105 group-hover:bg-red-500'}
                    `}>
                        <Radio className={`w-6 h-6 text-white ${isHolding ? 'opacity-100 animate-pulse' : 'opacity-90'}`} />
                    </div>
                </div>
                
                {/* Visual context tooltips */}
                <div className={`absolute right-full mr-4 top-1/2 -translate-y-1/2 whitespace-nowrap bg-[#0B1120] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border border-white/10 shadow-lg pointer-events-none transition-all duration-300 ${isHolding ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}>
                    Hold for 3s to trigger SOS
                </div>
                
                {/* Idle tooltip seen on hover only when not holding */}
                <div className={`absolute right-full mr-4 top-1/2 -translate-y-1/2 whitespace-nowrap bg-slate-800 text-slate-200 text-[10px] font-medium px-2 py-1 rounded border border-white/5 pointer-events-none transition-all duration-300 opacity-0 ${!isHolding && 'group-hover:opacity-100'}`}>
                    Emergency SOS
                </div>
            </div>

            {/* Reuses the existing robust SOS modal and prevents duplication */}
            <SOSModal 
                isOpen={showSOSModal} 
                onClose={() => setShowSOSModal(false)} 
            />
        </>
    );
};

export default FloatingSOSButton;
