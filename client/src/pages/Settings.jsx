/**
 * Settings Page — Niramaya UI
 * 
 * Account preferences with clinical-grade UI styling.
 */
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import PatientSidebar from '@/components/layout/PatientSidebar';
import { User, Mail, Phone, Bell, Shield, Save, Settings as SettingsIcon, Activity } from 'lucide-react';

const Settings = () => {
    const { profile } = useAuth();
    const [saved, setSaved] = useState(false);
    const [formData, setFormData] = useState({
        fullName: profile?.full_name || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        height: profile?.height || '',
        weight: profile?.weight || '',
        bloodType: profile?.blood_type || '',
        allergies: profile?.allergies || '',
    });

    const handleSave = (e) => {
        e.preventDefault();
        // TODO: Implement actual save functionality
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const inputClasses = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#1A2B48] placeholder:text-slate-400 focus:ring-2 focus:ring-[#008080] focus:border-transparent outline-none transition-all";

    return (
        <div className="min-h-screen w-full bg-slate-50 flex flex-row relative overflow-hidden">
            <PatientSidebar />
            
            <main className="flex-1 flex flex-col min-h-screen relative overflow-y-auto w-full">
                {/* Header / Banner */}
                <div className="bg-white border-b border-slate-200 px-6 py-8 sm:px-12 flex flex-col space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#008080]/10 rounded-xl flex items-center justify-center">
                            <SettingsIcon className="w-5 h-5 text-[#008080]" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-[#008080]" />
                            <span className="text-xs font-bold text-[#008080] uppercase tracking-wider">Account Control</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-heading font-black text-[#1A2B48]">
                        Settings
                    </h1>
                    <p className="text-sm text-slate-500 max-w-2xl">
                        Manage your account preferences, configure notification rules, and update your clinical profile credentials securely.
                    </p>
                </div>

                <div className="p-6 md:p-8 max-w-4xl mx-auto w-full flex-1">
                    {saved && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm font-bold text-green-700 flex items-center justify-between mb-6 shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Settings saved securely to clinical registry.
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Profile Settings */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <h2 className="font-heading font-bold text-[#1A2B48]">Profile Information</h2>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleSave} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                className={`${inputClasses} pl-11`}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Identity</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className={`${inputClasses} pl-11 bg-slate-50 opacity-70 cursor-not-allowed`}
                                                disabled
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Phone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="+91 98765 43210"
                                                className={`${inputClasses} pl-11`}
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <button type="submit" className="px-6 py-3 bg-[#1A2B48] text-white text-sm font-bold rounded-xl shadow-sm hover:bg-[#253d66] hover:-translate-y-0.5 transition-all flex items-center gap-2 w-full sm:w-auto justify-center">
                                            <Save className="w-4 h-4" /> Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Clinical Metrics */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
                                    <Activity className="w-4 h-4 text-pink-600" />
                                </div>
                                <h2 className="font-heading font-bold text-[#1A2B48]">Clinical Baseline Metrics</h2>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Height (cm)</label>
                                        <input
                                            type="number"
                                            value={formData.height}
                                            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                            placeholder="e.g. 175"
                                            className={inputClasses}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Weight (kg)</label>
                                        <input
                                            type="number"
                                            value={formData.weight}
                                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                            placeholder="e.g. 70"
                                            className={inputClasses}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Blood Type</label>
                                        <input
                                            type="text"
                                            value={formData.bloodType}
                                            onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                                            placeholder="e.g. O+"
                                            className={inputClasses}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Known Allergies</label>
                                        <input
                                            type="text"
                                            value={formData.allergies}
                                            onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                                            placeholder="e.g. Penicillin, Peanuts (or 'None')"
                                            className={inputClasses}
                                        />
                                    </div>
                                    <div className="sm:col-span-2 pt-2">
                                        <button type="submit" className="px-6 py-3 bg-[#1A2B48] text-white text-sm font-bold rounded-xl shadow-sm hover:bg-[#253d66] hover:-translate-y-0.5 transition-all flex items-center gap-2 w-full sm:w-auto justify-center">
                                            <Save className="w-4 h-4" /> Save Metrics
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                    <Bell className="w-4 h-4 text-amber-600" />
                                </div>
                                <h2 className="font-heading font-bold text-[#1A2B48]">Notification Preferences</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent transition-colors">
                                    <span className="font-medium text-[#1A2B48] text-sm">Clinical Email Reminders</span>
                                    <input type="checkbox" defaultChecked className="w-5 h-5 text-[#008080] rounded focus:ring-[#008080] border-slate-300" />
                                </label>
                                <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent transition-colors">
                                    <span className="font-medium text-[#1A2B48] text-sm">Emergency SMS Alerts</span>
                                    <input type="checkbox" defaultChecked className="w-5 h-5 text-[#008080] rounded focus:ring-[#008080] border-slate-300" />
                                </label>
                                <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent transition-colors">
                                    <span className="font-medium text-[#1A2B48] text-sm">Appointment Dispatch Alerts</span>
                                    <input type="checkbox" defaultChecked className="w-5 h-5 text-[#008080] rounded focus:ring-[#008080] border-slate-300" />
                                </label>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-emerald-600" />
                                </div>
                                <h2 className="font-heading font-bold text-[#1A2B48]">Security Audit</h2>
                            </div>
                            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <p className="font-bold text-[#1A2B48] text-sm">Credential Management</p>
                                    <p className="text-xs text-slate-500 mt-1">Update your password or configure Two-Factor Authentication (2FA).</p>
                                </div>
                                <button className="px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl shadow-sm hover:bg-slate-200 transition-colors whitespace-nowrap border border-slate-200">
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Settings;
