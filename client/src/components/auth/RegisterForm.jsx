/**
 * RegisterForm Component - Shadcn Style
 * 
 * Clean, minimal registration with Google OAuth and email/password.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input, Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

// Google SVG Icon
const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2">
        <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
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
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-8 pb-8 text-center space-y-6">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold">Account Created!</h2>
                            <p className="text-muted-foreground">
                                Please check your email to verify your account before signing in.
                            </p>
                        </div>
                        <Button asChild className="w-full">
                            <Link to="/login">Go to Login</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Logo */}
                <div className="text-center space-y-2">
                    <Link to="/" className="inline-block">
                        <h1 className="text-2xl font-bold text-primary">HealthBook</h1>
                    </Link>
                </div>

                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center">Create Account</CardTitle>
                        <CardDescription className="text-center">
                            Join us for better healthcare access
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Google Sign Up */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={handleGoogleSignIn}
                            disabled={isGoogleLoading || isLoading}
                        >
                            {isGoogleLoading ? (
                                <span>Signing up...</span>
                            ) : (
                                <>
                                    <GoogleIcon />
                                    Continue with Google
                                </>
                            )}
                        </Button>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with email
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Full Name */}
                            <Input
                                label="Full Name"
                                name="fullName"
                                type="text"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="John Doe"
                                required
                            />

                            {/* Email */}
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                required
                                autoComplete="email"
                            />

                            {/* Password */}
                            <div className="space-y-1">
                                <Input
                                    label="Password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    minLength={8}
                                />
                                <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                            </div>

                            {/* Confirm Password */}
                            <Input
                                label="Confirm Password"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                            />

                            {/* Submit */}
                            <Button type="submit" className="w-full" loading={isLoading}>
                                Create Account
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center border-t pt-6">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary font-medium hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default RegisterForm;
