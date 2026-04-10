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
        <div className="mb-10 sm:mb-12">
            <div className="flex items-center justify-between">
                {stepLabels.map(({ step, label }, index) => {
                    const isCompleted = currentStep > step;
                    const isCurrent = currentStep === step;
                    const isLast = index === stepLabels.length - 1;

                    return (
                        <div key={step} className={cn("flex items-center", !isLast ? "flex-1" : "")}>
                            {/* Step Circle */}
                            <div className="flex flex-col items-center relative z-10 w-8 sm:w-10 flex-shrink-0">
                                <div
                                    className={cn(
                                        'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all shadow-sm',
                                        isCompleted && 'bg-[#0D9488] text-white',
                                        isCurrent && 'bg-[#0B1120] text-white ring-4 ring-[#0B1120]/10',
                                        !isCompleted && !isCurrent && 'bg-slate-50 text-slate-400 border border-slate-200'
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                                    ) : (
                                        step
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        'absolute top-10 sm:top-12 text-[10px] sm:text-xs font-semibold tracking-wide text-center w-20 sm:w-24',
                                        isCompleted ? 'text-[#0D9488]' : isCurrent ? 'text-[#0B1120]' : 'text-slate-400'
                                    )}
                                >
                                    {label}
                                </span>
                            </div>

                            {/* Connector Line */}
                            {!isLast && (
                                <div className="flex-1 px-1 sm:px-2">
                                    <div
                                        className={cn(
                                            'h-1 rounded-full w-full',
                                            isCompleted ? 'bg-[#0D9488]' : 'bg-slate-200'
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
