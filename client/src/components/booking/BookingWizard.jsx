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
                                        'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                                        isCompleted && 'bg-secondary-500 text-white',
                                        isCurrent && 'bg-primary-600 text-white',
                                        !isCompleted && !isCurrent && 'bg-gray-200 text-gray-500'
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
                                        'text-xs mt-2 hidden sm:block',
                                        (isCompleted || isCurrent) ? 'text-gray-900 font-medium' : 'text-gray-500'
                                    )}
                                >
                                    {label}
                                </span>
                            </div>

                            {/* Connector Line */}
                            {!isLast && (
                                <div
                                    className={cn(
                                        'flex-1 h-1 mx-2',
                                        isCompleted ? 'bg-secondary-500' : 'bg-gray-200'
                                    )}
                                />
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
            <div className="bg-white rounded-xl shadow-card p-6 md:p-8">
                {renderStep()}
            </div>
        </div>
    );
};

export default BookingWizard;
