/**
 * EmergencyDoctorCard — Distance-based doctor card for SOS flow
 * 
 * Compact card showing doctor proximity, specialization, and
 * one-click emergency booking. Uses clinical design tokens.
 */
import { MapPin, Stethoscope, ArrowRight } from 'lucide-react';

const EmergencyDoctorCard = ({ doctor, onSelect, isLoading, isSelected }) => {
    const distanceLabel = doctor.distance_km < 1
        ? `${Math.round(doctor.distance_km * 1000)}m away`
        : `${doctor.distance_km} km away`;

    return (
        <button
            onClick={() => onSelect(doctor)}
            disabled={isLoading}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 group ${
                isSelected
                    ? 'border-red-500 bg-red-50 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                    : 'border-slate-200 bg-white hover:border-red-300 hover:shadow-md'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-black shrink-0 ${
                        isSelected
                            ? 'bg-red-500 text-white'
                            : 'bg-[#0B1120] text-white group-hover:bg-red-500'
                    } transition-colors`}>
                        {doctor.full_name?.charAt(0) || 'D'}
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                        <p className="font-heading font-bold text-sm text-[#0B1120] truncate">
                            Dr. {doctor.full_name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                                <Stethoscope className="w-3 h-3" />
                                {doctor.specialization || 'General'}
                            </span>
                            {doctor.department_name && (
                                <span className="text-[10px] text-slate-400">• {doctor.department_name}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Distance + CTA */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                            <MapPin className="w-3.5 h-3.5 text-red-500" />
                            <span className="text-sm font-heading font-black text-red-500">
                                {distanceLabel}
                            </span>
                        </div>
                        <p className="text-[9px] font-bold text-green-500 uppercase tracking-wider mt-0.5">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1 animate-pulse" />
                            Available
                        </p>
                    </div>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected
                            ? 'bg-red-500 text-white'
                            : 'bg-slate-100 text-slate-400 group-hover:bg-red-500 group-hover:text-white'
                    }`}>
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </button>
    );
};

export default EmergencyDoctorCard;
