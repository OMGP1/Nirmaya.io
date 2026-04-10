/**
 * RegisterForm Component — Niramaya.io
 * 
 * Dark-theme registration with Patient/Specialist role switcher,
 * dynamic form fields, and terminal readout.
 * Preserves all Supabase auth logic.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Activity, AlertCircle, CheckCircle2, Shield, Lock, ArrowRight, UserPlus } from 'lucide-react';

// Google SVG Icon
const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState('patient');

    const { signUp, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validateForm = () => {
        if (!formData.fullName.trim()) {
            setError('Full name is required');
            return false;
        }
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const { error: signUpError } = await signUp(
                formData.email,
                formData.password,
                formData.fullName
            );

            if (signUpError) {
                setError(signUpError.message || 'Failed to create account');
                return;
            }

            setSuccess(true);
        } catch (err) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setIsGoogleLoading(true);

        try {
            const { error } = await signInWithGoogle();
            if (error) {
                setError(error.message || 'Failed to sign in with Google');
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setIsGoogleLoading(false);
        }
    };

    // Success state
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0A0F1E] p-4">
                <div className="w-full max-w-md bg-white/[0.03] border border-white/10 rounded-2xl p-10 text-center space-y-6 backdrop-blur-sm">
                    <div className="w-16 h-16 rounded-full bg-[#008080]/20 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8 text-[#008080]" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-heading font-bold text-white">Account Created!</h2>
                        <p className="text-white/40">
                            Please check your email to verify your account before signing in.
                        </p>
                    </div>
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#008080] text-white font-bold rounded-xl shadow-lg hover:brightness-110 transition-all"
                    >
                        Go to Login <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        );
    }

    const inputClasses = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/20 focus:ring-2 focus:ring-[#008080] focus:border-transparent outline-none transition-all";

    return (
        <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
                    style={{ background: 'radial-gradient(circle, #008080 0%, transparent 70%)' }}
                />
                <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-white/5 rounded-tl-3xl" />
                <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-white/5 rounded-br-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-lg space-y-8">
                {/* Logo */}
                <div className="text-center space-y-4 animate-fade-in">
                    <Link to="/" className="inline-flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#008080] rounded-xl flex items-center justify-center shadow-lg shadow-[#008080]/20">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-heading font-bold text-white tracking-tight">Niramaya.io</span>
                    </Link>
                    <p className="text-xs font-bold text-white/30 uppercase tracking-[0.3em]">
                        Create Your Clinical Profile
                    </p>
                </div>

                {/* Role Switcher */}
                <div className="flex bg-white/5 rounded-2xl p-1.5 border border-white/10 animate-slide-up">
                    <button
                        type="button"
                        onClick={() => setSelectedRole('patient')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                            selectedRole === 'patient'
                                ? 'bg-[#008080] text-white shadow-lg shadow-[#008080]/20'
                                : 'text-white/50 hover:text-white/80'
                        }`}
                    >
                        Patient
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedRole('specialist')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                            selectedRole === 'specialist'
                                ? 'bg-[#008080] text-white shadow-lg shadow-[#008080]/20'
                                : 'text-white/50 hover:text-white/80'
                        }`}
                    >
                        Medical Specialist
                    </button>
                </div>

                {/* Register Card */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 space-y-6 backdrop-blur-sm animate-slide-up" style={{ animationDelay: '200ms' }}>
                    <div className="space-y-1">
                        <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-[#008080]" />
                            {selectedRole === 'patient' ? 'Patient Registration' : 'Specialist Onboarding'}
                        </h2>
                        <p className="text-sm text-white/40">
                            {selectedRole === 'patient'
                                ? 'Set up your health monitoring profile'
                                : 'Apply for clinical portal access'}
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Google Sign Up */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleLoading || isLoading}
                        className="w-full flex items-center justify-center py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white/80 transition-all disabled:opacity-50"
                    >
                        {isGoogleLoading ? (
                            <span>Signing up...</span>
                        ) : (
                            <>
                                <GoogleIcon />
                                Continue with Google
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#0A0F1E] px-3 text-white/30 font-bold tracking-wider">
                                Or fill your details
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Dr. Sarah Miller"
                                required
                                className={inputClasses}
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@niramaya.io"
                                required
                                autoComplete="email"
                                className={inputClasses}
                            />
                        </div>

                        {/* Specialist-specific fields */}
                        {selectedRole === 'specialist' && (
                            <div className="space-y-5 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                <p className="text-[10px] font-bold text-[#008080] uppercase tracking-widest">Specialist Credentials</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Domain</label>
                                        <select className={inputClasses + ' appearance-none cursor-pointer'}>
                                            <option value="">Select...</option>
                                            <option value="cardiology">Cardiology</option>
                                            <option value="pulmonology">Pulmonology</option>
                                            <option value="neurology">Neurology</option>
                                            <option value="orthopedics">Orthopedics</option>
                                            <option value="general">General Medicine</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Registration #</label>
                                        <input
                                            type="text"
                                            placeholder="MCI-XXXXX"
                                            className={inputClasses}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Hospital Affiliation</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Apollo Hospitals, Mumbai"
                                        className={inputClasses}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Patient-specific fields */}
                        {selectedRole === 'patient' && (
                            <div className="space-y-5 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                <p className="text-[10px] font-bold text-[#008080] uppercase tracking-widest">Care-Circle & SOS Setup</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Emergency Contact</label>
                                        <input
                                            type="text"
                                            placeholder="Name"
                                            className={inputClasses}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Contact Phone</label>
                                        <input
                                            type="tel"
                                            placeholder="+91 98765 43210"
                                            className={inputClasses}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                                    <span className="text-xs text-white/60">Enable auto-alert for Care Circle</span>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#008080]" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Password */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    minLength={8}
                                    className={inputClasses}
                                />
                                <p className="text-[10px] text-white/30">Min 8 characters</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Confirm</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    className={inputClasses}
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-[#008080] hover:bg-[#008080]/90 text-white font-heading font-bold rounded-xl shadow-[0_8px_20px_rgba(0,128,128,0.3)] hover:shadow-[0_12px_30px_rgba(0,128,128,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Creating Profile...' : 'Create Clinical Profile'}
                            {!isLoading && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="space-y-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
                    <p className="text-center text-sm text-white/30">
                        Already have an account?{' '}
                        <Link to="/login" className="text-[#008080] hover:text-[#00d2c1] font-bold transition-colors">
                            Sign in
                        </Link>
                    </p>

                    {/* Compliance */}
                    <div className="flex items-center justify-center gap-6">
                        <div className="flex items-center gap-1.5">
                            <Lock className="w-3 h-3 text-[#008080]" />
                            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">AES-256 Encrypted</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Shield className="w-3 h-3 text-white/20" />
                            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">DPDPA 2023</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;
