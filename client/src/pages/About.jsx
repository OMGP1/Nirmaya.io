/**
 * About Page
 */
import { LandingLayout } from '@/components/layout';
import { Card } from '@/components/ui';
import { Heart, Users, Award, Clock } from 'lucide-react';

const About = () => {
    const stats = [
        { icon: Users, value: '50,000+', label: 'Patients Served' },
        { icon: Heart, value: '200+', label: 'Qualified Doctors' },
        { icon: Award, value: '15+', label: 'Specializations' },
        { icon: Clock, value: '24/7', label: 'Support Available' },
    ];

    return (
        <LandingLayout>
            <div className="max-w-4xl mx-auto px-4 py-16">
                {/* Hero */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        About HealthBook
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        We're on a mission to make healthcare accessible, convenient,
                        and stress-free for everyone.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                    {stats.map(({ icon: Icon, value, label }) => (
                        <Card key={label} className="p-6 text-center">
                            <Icon className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                            <p className="text-2xl font-bold text-gray-900">{value}</p>
                            <p className="text-sm text-gray-500">{label}</p>
                        </Card>
                    ))}
                </div>

                {/* Story */}
                <div className="prose prose-lg max-w-none">
                    <h2>Our Story</h2>
                    <p>
                        HealthBook was founded with a simple idea: booking a doctor's appointment
                        should be as easy as booking a restaurant table. We saw patients struggling
                        with endless phone calls, long wait times, and confusing scheduling systems.
                    </p>
                    <p>
                        Today, we connect thousands of patients with qualified healthcare providers
                        across multiple specializations. Our platform makes it easy to find the right
                        doctor, check availability, and book appointments in seconds.
                    </p>

                    <h2>Our Values</h2>
                    <ul>
                        <li><strong>Patient First:</strong> Every decision we make prioritizes patient experience.</li>
                        <li><strong>Accessibility:</strong> Healthcare should be available to everyone.</li>
                        <li><strong>Transparency:</strong> Clear pricing, honest communication.</li>
                        <li><strong>Quality:</strong> Only verified, qualified healthcare providers.</li>
                    </ul>

                    <h2>Contact Us</h2>
                    <p>
                        Have questions or feedback? We'd love to hear from you.
                    </p>
                    <p>
                        Email: <a href="mailto:support@healthbook.com">support@healthbook.com</a><br />
                        Phone: +91 1800-HEALTH
                    </p>
                </div>
            </div>
        </LandingLayout>
    );
};

export default About;
