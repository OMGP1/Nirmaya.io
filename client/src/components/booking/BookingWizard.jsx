/**
 * Booking Wizard
 * 
 * Orchestrates the multi-step booking flow with progress indicator.
 */
import { useBooking, BOOKING_STEPS } from '@/contexts/BookingContext';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import {
    Step1Department,
    Step2Doctor,
    Step3DateTime,
    Step4Confirm,
    Step5Success,
} from './WizardSteps';

const stepLabels = [
    { step: BOOKING_STEPS.DEPARTMENT, label: 'Department' },
    { step: BOOKING_STEPS.DOCTOR, label: 'Doctor' },
    { step: BOOKING_STEPS.DATETIME, label: 'Date & Time' },
    { step: BOOKING_STEPS.CONFIRM, label: 'Confirm' },
];

const ProgressIndicator = ({ currentStep }) => {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                {stepLabels.map(({ step, label }, index) => {
                    const isCompleted = currentStep > step;
                    const isCurrent = currentStep === step;
                    const isLast = index === stepLabels.length - 1;

                    return (
                        <div key={step} className="flex items-center flex-1">
                            {/* Step Circle */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={cn(
                                        'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-sm z-10 relative mt-2',
                                        isCompleted && 'bg-[#008080] text-white',
                                        isCurrent && 'bg-[#1A2B48] text-white shadow-[#1A2B48]/30',
                                        !isCompleted && !isCurrent && 'bg-slate-100 text-slate-400 border border-slate-200'
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        step
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        'text-[10px] sm:text-xs mt-3 block tracking-wide text-center',
                                        (isCompleted) ? 'text-[#008080] font-bold' : isCurrent ? 'text-[#1A2B48] font-black' : 'text-slate-400 font-medium'
                                    )}
                                >
                                    {label}
                                </span>
                            </div>

                            {/* Connector Line */}
                            {!isLast && (
                                <div className="flex-1 px-1 sm:px-2 relative -mt-8 sm:-mt-5">
                                    <div
                                        className={cn(
                                            'h-1 rounded-full w-full',
                                            isCompleted ? 'bg-[#008080]/50' : 'bg-slate-100'
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const BookingWizard = () => {
    const { step } = useBooking();

    const renderStep = () => {
        switch (step) {
            case BOOKING_STEPS.DEPARTMENT:
                return <Step1Department />;
            case BOOKING_STEPS.DOCTOR:
                return <Step2Doctor />;
            case BOOKING_STEPS.DATETIME:
                return <Step3DateTime />;
            case BOOKING_STEPS.CONFIRM:
                return <Step4Confirm />;
            case BOOKING_STEPS.SUCCESS:
                return <Step5Success />;
            default:
                return <Step1Department />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress (hide on success) */}
            {step !== BOOKING_STEPS.SUCCESS && (
                <ProgressIndicator currentStep={step} />
            )}

            {/* Current Step */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 md:p-8">
                {renderStep()}
            </div>
        </div>
    );
};

export default BookingWizard;
