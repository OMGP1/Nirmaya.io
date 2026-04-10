/**
 * Book Appointment Page
 * 
 * Multi-step booking flow wrapped in BookingProvider.
 * Supports direct booking from doctor page via ?doctorId=xxx query param.
 */
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout';
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
                    // Set department first
                    if (doctor.department) {
                        setDepartment(doctor.department);
                    }
                    // Set the doctor
                    setDoctor(doctor);
                    // Skip to date/time selection
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
            <div className="flex justify-center py-12">
                <Spinner size="lg" />
            </div>
        );
    }

    return <BookingWizard />;
};

const BookAppointment = () => {
    return (
        <BookingProvider>
            <DashboardLayout className="py-6">
                <div className="container-app">
                    <BookingContent />
                </div>
            </DashboardLayout>
        </BookingProvider>
    );
};

export default BookAppointment;
