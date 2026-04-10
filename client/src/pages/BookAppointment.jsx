/**
 * Book Appointment Page — Niramaya UI
 * 
 * Multi-step booking flow wrapped in BookingProvider.
 * Supports direct booking from doctor page via ?doctorId=xxx query param.
 */
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import PatientSidebar from '@/components/layout/PatientSidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BookingProvider, useBooking, BOOKING_STEPS } from '@/contexts/BookingContext';
import { BookingWizard } from '@/components/booking';
import { getDoctorById } from '@/services/doctors';
import { Spinner } from '@/components/ui';

// Inner component that uses booking context
const BookingContent = () => {
    const [searchParams] = useSearchParams();
    const doctorId = searchParams.get('doctorId');
    const { setDoctor, setStep, setDepartment } = useBooking();
    const [loading, setLoading] = useState(!!doctorId);

    useEffect(() => {
        const loadDoctor = async () => {
            if (!doctorId) return;

            try {
                const doctor = await getDoctorById(doctorId);
                if (doctor) {
                    if (doctor.department) {
                        setDepartment(doctor.department);
                    }
                    setDoctor(doctor);
                    setStep(BOOKING_STEPS.DATETIME);
                }
            } catch (err) {
                console.error('Failed to load doctor:', err);
            } finally {
                setLoading(false);
            }
        };

        loadDoctor();
    }, [doctorId, setDoctor, setStep, setDepartment]);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Spinner size="lg" />
            </div>
        );
    }

    return <BookingWizard />;
};

const BookAppointmentWrapper = () => {
    const { profile, isAuthenticated } = useAuth();
    const isPatient = profile?.role === 'patient';
    const showSidebar = isAuthenticated && isPatient;

    const content = (
        <div className="flex-1 flex flex-col min-h-screen relative overflow-y-auto w-full">
            <div className="bg-[#1A2B48] px-6 py-12 sm:px-12 flex flex-col items-center justify-center text-center">
                <h1 className="text-3xl sm:text-4xl font-heading font-black text-white mb-2">
                    Book Clinical Appointment
                </h1>
                <p className="text-slate-300 max-w-2xl text-sm font-medium mt-1">
                    Follow the guided steps to schedule your specialist consultation securely.
                </p>
            </div>
            
            <div className="p-4 sm:p-8 -mt-8 mx-auto w-full max-w-5xl relative z-10 flex-1">
                <BookingContent />
            </div>

            {!showSidebar && <Footer />}
        </div>
    );

    return (
        <div className={`min-h-screen w-full bg-slate-50 flex ${showSidebar ? 'flex-row' : 'flex-col'}`}>
            {showSidebar ? (
                <PatientSidebar />
            ) : (
                <Header />
            )}
            {content}
        </div>
    );
};

const BookAppointment = () => {
    return (
        <BookingProvider>
            <BookAppointmentWrapper />
        </BookingProvider>
    );
};

export default BookAppointment;
