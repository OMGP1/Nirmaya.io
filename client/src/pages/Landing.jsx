/**
 * Landing Page - Modern Shadcn Style
 * 
 * Clean, minimal hero section with call-to-action.
 * Smart redirect: if logged in, go to dashboard; else go to register.
 */
import { Link, useNavigate } from 'react-router-dom';
import { LandingLayout } from '@/components/layout';
import { Button, Card, CardContent } from '@/components/ui';
import { Calendar, UserCheck, Clock, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const features = [
    {
        icon: Calendar,
        title: 'Easy Scheduling',
        description: 'Book appointments with just a few clicks. View available slots in real-time.',
    },
    {
        icon: UserCheck,
        title: 'Top Doctors',
        description: 'Access a network of verified healthcare professionals across specialties.',
    },
    {
        icon: Clock,
        title: 'Save Time',
        description: 'No more waiting on hold. Manage all your appointments online.',
    },
    {
        icon: Shield,
        title: 'Secure & Private',
        description: 'Your health data is protected with enterprise-grade security.',
    },
];

const Landing = () => {
    const { isAuthenticated, profile, loading } = useAuth();
    const navigate = useNavigate();

    // Handle Get Started click - redirect based on auth state
    const handleGetStarted = () => {
        if (isAuthenticated) {
            // User is logged in - go to appropriate dashboard
            if (profile?.role === 'admin') {
                navigate('/admin');
            } else if (profile?.role === 'doctor') {
                navigate('/doctor');
            } else {
                navigate('/dashboard');
            }
        } else {
            // Not logged in - go to register
            navigate('/register');
        }
    };

    return (
        <LandingLayout>
            {/* Hero Section */}
            <section className="relative min-h-[80vh] flex items-center">
                {/* Subtle gradient background */}
                <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />

                <div className="container-app relative z-10">
                    <div className="max-w-3xl mx-auto text-center space-y-8">
                        <div className="space-y-4 animate-slide-up">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                                Healthcare Appointments,{' '}
                                <span className="text-primary animate-jelly-bounce inline-block" style={{ animationDelay: '500ms' }}>Simplified</span>
                            </h1>
                            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '300ms' }}>
                                Book appointments with top doctors in minutes.
                                No calls, no waiting. Just quality healthcare when you need it.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-jelly-pop" style={{ animationDelay: '400ms' }}>
                            <Button
                                size="lg"
                                className="w-full sm:w-auto gap-2 jelly-hover"
                                onClick={handleGetStarted}
                                disabled={loading}
                            >
                                {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                            <Link to="/doctors">
                                <Button variant="outline" size="lg" className="w-full sm:w-auto jelly-hover">
                                    Browse Doctors
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 border-t">
                <div className="container-app">
                    <div className="text-center space-y-4 mb-16 animate-slide-up">
                        <h2 className="text-3xl font-bold tracking-tight">
                            Why Choose HealthBook?
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            We're reimagining healthcare access for the modern age.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <Card
                                    key={index}
                                    className="group animate-jelly-pop jelly-hover cursor-pointer"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <CardContent className="pt-6 text-center space-y-4">
                                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors animate-elastic" style={{ animationDelay: `${index * 100 + 300}ms` }}>
                                            <Icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <h3 className="font-semibold">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-muted/30">
                <div className="container-app text-center space-y-6 animate-slide-up">
                    <h2 className="text-3xl font-bold tracking-tight animate-wobble" style={{ animationDelay: '200ms' }}>
                        Ready to get started?
                    </h2>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        Join thousands of patients who trust HealthBook for their healthcare needs.
                    </p>
                    <Button
                        size="lg"
                        className="gap-2 jelly-hover animate-jelly-pop"
                        onClick={handleGetStarted}
                        disabled={loading}
                        style={{ animationDelay: '400ms' }}
                    >
                        {isAuthenticated ? 'Go to Dashboard' : 'Create Free Account'}
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </section>
        </LandingLayout>
    );
};

export default Landing;
