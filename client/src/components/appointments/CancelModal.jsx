/**
 * Cancel Appointment Modal
 */
import { useState } from 'react';
import { Modal, Button, Alert } from '@/components/ui';
import { cancelAppointment } from '@/services/appointments';
import { useToast } from '@/components/ui/Toast';

const CancelModal = ({ isOpen, onClose, appointment, onSuccess }) => {
    const [reason, setReason] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const reasons = [
        'Schedule conflict',
        'Feeling better',
        'Found another doctor',
        'Transportation issues',
        'Other',
    ];

    const handleCancel = async () => {
        if (!reason) {
            setError('Please select a reason for cancellation.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await cancelAppointment(appointment.id, reason);
            toast.success('Appointment cancelled successfully');
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to cancel appointment');
            toast.error('Failed to cancel appointment');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Cancel Appointment"
            size="sm"
        >
            <div className="space-y-4">
                {error && (
                    <Alert variant="error" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                <p className="text-gray-600">
                    Are you sure you want to cancel this appointment with{' '}
                    <span className="font-medium">
                        Dr. {appointment?.doctor?.user?.full_name}
                    </span>
                    ?
                </p>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for cancellation *
                    </label>
                    <div className="space-y-2">
                        {reasons.map((r) => (
                            <label key={r} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="cancelReason"
                                    value={r}
                                    checked={reason === r}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-gray-700">{r}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <Modal.Footer>
                <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                    Keep Appointment
                </Button>
                <Button
                    variant="danger"
                    onClick={handleCancel}
                    isLoading={isLoading}
                >
                    Cancel Appointment
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CancelModal;
