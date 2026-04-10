/**
 * Settings Page
 */
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, Button, Input, Alert } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { User, Mail, Phone, Bell, Shield, Save } from 'lucide-react';

const Settings = () => {
    const { profile } = useAuth();
    const [saved, setSaved] = useState(false);
    const [formData, setFormData] = useState({
        fullName: profile?.full_name || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
    });

    const handleSave = (e) => {
        e.preventDefault();
        // TODO: Implement actual save functionality
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
                <p className="text-gray-600 mb-8">Manage your account preferences</p>

                {saved && (
                    <Alert variant="success" className="mb-6">
                        Settings saved successfully!
                    </Alert>
                )}

                {/* Profile Settings */}
                <Card className="mb-6">
                    <Card.Header>
                        <Card.Title className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Profile Information
                        </Card.Title>
                    </Card.Header>
                    <Card.Content>
                        <form onSubmit={handleSave} className="space-y-4">
                            <Input
                                label="Full Name"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                leftIcon={<User className="w-5 h-5" />}
                            />
                            <Input
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                leftIcon={<Mail className="w-5 h-5" />}
                                disabled
                            />
                            <Input
                                label="Phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                leftIcon={<Phone className="w-5 h-5" />}
                                placeholder="+91 98765 43210"
                            />
                            <Button type="submit" leftIcon={<Save className="w-4 h-4" />}>
                                Save Changes
                            </Button>
                        </form>
                    </Card.Content>
                </Card>

                {/* Notifications */}
                <Card className="mb-6">
                    <Card.Header>
                        <Card.Title className="flex items-center gap-2">
                            <Bell className="w-5 h-5" />
                            Notifications
                        </Card.Title>
                    </Card.Header>
                    <Card.Content>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between">
                                <span className="text-gray-700">Email reminders</span>
                                <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-600" />
                            </label>
                            <label className="flex items-center justify-between">
                                <span className="text-gray-700">SMS notifications</span>
                                <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-600" />
                            </label>
                            <label className="flex items-center justify-between">
                                <span className="text-gray-700">Appointment reminders</span>
                                <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-600" />
                            </label>
                        </div>
                    </Card.Content>
                </Card>

                {/* Security */}
                <Card>
                    <Card.Header>
                        <Card.Title className="flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Security
                        </Card.Title>
                    </Card.Header>
                    <Card.Content>
                        <Button variant="outline">
                            Change Password
                        </Button>
                    </Card.Content>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
