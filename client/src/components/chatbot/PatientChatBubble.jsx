/**
 * Patient Chat Bubble Wrapper
 * 
 * Only shows the chatbot on patient portal pages.
 * Hides it on admin and doctor portals.
 */
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ChatBubble } from '@/components/chatbot';

const PatientChatBubble = () => {
    const { isAuthenticated, profile } = useAuth();
    const location = useLocation();

    // Don't show chatbot on admin or doctor portal routes
    const isAdminRoute = location.pathname.startsWith('/admin');
    const isDoctorRoute = location.pathname.startsWith('/doctor');

    // Also check user role - only patients should see the chatbot
    const isPatient = profile?.role === 'patient' || (!profile?.role && isAuthenticated);

    // Hide chatbot if on admin/doctor routes OR if user is admin/doctor
    if (isAdminRoute || isDoctorRoute) {
        return null;
    }

    // Only show for patients or unauthenticated users (on landing page, etc.)
    if (isAuthenticated && !isPatient) {
        return null;
    }

    return <ChatBubble />;
};

export default PatientChatBubble;
