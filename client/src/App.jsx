/**
 * App Entry Point
 * 
 * Root application with routing and providers.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AdminLayout, DoctorLayout } from '@/components/layout';

// Pages
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
import BookAppointment from '@/pages/BookAppointment';
import Appointments from '@/pages/Appointments';
import Doctors from '@/pages/Doctors';
import Departments from '@/pages/Departments';
import About from '@/pages/About';
import Settings from '@/pages/Settings';
import HealthRiskAssessment from '@/pages/HealthRiskAssessment';
import PatientVitals from '@/pages/PatientVitals';

// Auth pages
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

// Admin pages
import {
    AdminDashboard,
    AdminAppointments,
    AdminDoctors,
    AdminDepartments,
    AdminPatients,
} from '@/pages/admin';

// Doctor pages
import {
    DoctorDashboard,
    DoctorSchedule,
    DoctorAppointments,
    DoctorAvailability,
    AppointmentDetail,
    DoctorSettings,
} from '@/pages/doctor';

// Chatbot - Patient only
import PatientChatBubble from '@/components/chatbot/PatientChatBubble';

// Error Boundary - fallback with logout
import ErrorBoundary from '@/components/ErrorBoundary';

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <AuthProvider>
                    <ToastProvider>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Landing />} />
                            <Route path="/login" element={<LoginForm />} />
                            <Route path="/register" element={<RegisterForm />} />
                            <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                            <Route path="/doctors" element={<Doctors />} />
                            <Route path="/departments" element={<Departments />} />
                            <Route path="/about" element={<About />} />

                            {/* Protected Routes */}
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Booking Routes */}
                            <Route
                                path="/book"
                                element={
                                    <ProtectedRoute>
                                        <BookAppointment />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/appointments"
                                element={
                                    <ProtectedRoute>
                                        <Appointments />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/settings"
                                element={
                                    <ProtectedRoute>
                                        <Settings />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/risk-assessment"
                                element={
                                    <ProtectedRoute>
                                        <HealthRiskAssessment />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/vitals"
                                element={
                                    <ProtectedRoute>
                                        <PatientVitals />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Doctor Portal Routes */}
                            <Route path="/doctor" element={<DoctorLayout />}>
                                <Route index element={<DoctorDashboard />} />
                                <Route path="schedule" element={<DoctorSchedule />} />
                                <Route path="appointments" element={<DoctorAppointments />} />
                                <Route path="appointments/:id" element={<AppointmentDetail />} />
                                <Route path="availability" element={<DoctorAvailability />} />
                                <Route path="settings" element={<DoctorSettings />} />
                            </Route>

                            {/* Admin Routes - Nested under AdminLayout */}
                            <Route path="/admin" element={<AdminLayout />}>
                                <Route index element={<AdminDashboard />} />
                                <Route path="appointments" element={<AdminAppointments />} />
                                <Route path="doctors" element={<AdminDoctors />} />
                                <Route path="departments" element={<AdminDepartments />} />
                                <Route path="patients" element={<AdminPatients />} />
                            </Route>

                            {/* 404 */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>

                        {/* AI Chatbot - Patient portal only */}
                        <PatientChatBubble />

                        {/* React Hot Toast - Beautiful notifications */}
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 4000,
                                style: {
                                    background: '#fff',
                                    color: '#363636',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
                                },
                                success: {
                                    duration: 3000,
                                    style: {
                                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                        color: '#fff',
                                    },
                                },
                                error: {
                                    duration: 5000,
                                    style: {
                                        background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                                        color: '#fff',
                                    },
                                },
                            }}
                        />
                    </ToastProvider>
                </AuthProvider>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;
