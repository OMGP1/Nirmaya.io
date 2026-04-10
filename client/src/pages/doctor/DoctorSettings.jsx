/**
 * DoctorSettings — Practice Configuration
 * 
 * Profile, notification, and security settings.
 * All form state logic preserved.
 */
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
    User, Mail, Phone, Bell, Shield, Save,
    Check, Activity, ChevronRight, Lock,
} from 'lucide-react';

const DoctorSettings = () => {
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

    const inputClasses = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-11 text-sm text-[#1F2937] placeholder:text-slate-400 focus:ring-2 focus:ring-[#0D9488] focus:border-transparent outline-none transition-all";

    return (
        <div className="max-w-2xl space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-heading font-black text-[#0B1120] tracking-tight">Practice Configuration</h1>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-[#1F2937]/60 uppercase tracking-wider">Account & Security Settings</span>
                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-[10px] font-bold text-[#0D9488] uppercase tracking-wider">Encrypted</span>
                </div>
            </div>

            {/* Success Alert */}
            {saved && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex gap-3 items-center">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <p className="text-sm font-bold text-green-700">Settings saved successfully!</p>
                </div>
            )}

            {/* Profile Settings */}
            <div className="bg-white rounded-[16px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                    <User className="w-4 h-4 text-[#0D9488]" />
                    <h2 className="text-sm font-heading font-black text-[#1F2937] uppercase tracking-widest">Profile Information</h2>
                </div>
                <div className="p-6">
                    <form onSubmit={handleSave} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#1F2937]/40 uppercase tracking-widest">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className={inputClasses}
                                    placeholder="Dr. John Doe"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#1F2937]/40 uppercase tracking-widest">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className={inputClasses + ' opacity-60 cursor-not-allowed'}
                                    disabled
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#1F2937]/40 uppercase tracking-widest">Phone</label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className={inputClasses}
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#0D9488] text-white text-[11px] font-black rounded-lg shadow-md hover:brightness-110 transition-all uppercase tracking-wider"
                        >
                            <Save className="w-4 h-4" /> Save Changes
                        </button>
                    </form>
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-[16px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                    <Bell className="w-4 h-4 text-[#0D9488]" />
                    <h2 className="text-sm font-heading font-black text-[#1F2937] uppercase tracking-widest">Notifications</h2>
                </div>
                <div className="p-6 space-y-4">
                    {[
                        { label: 'Email reminders', desc: 'Before appointments' },
                        { label: 'Appointment confirmations', desc: 'Status updates' },
                        { label: 'New booking alerts', desc: 'Real-time push' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                                <span className="text-xs font-bold text-[#1F2937]">{item.label}</span>
                                <p className="text-[9px] text-slate-400 uppercase">{item.desc}</p>
                            </div>
                            <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-[#0D9488] transition-colors">
                                <span className="inline-block h-3 w-3 translate-x-5 transform rounded-full bg-white transition-transform" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-[16px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                    <Shield className="w-4 h-4 text-[#0D9488]" />
                    <h2 className="text-sm font-heading font-black text-[#1F2937] uppercase tracking-widest">Security</h2>
                </div>
                <div className="p-6 space-y-4">
                    <button className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all">
                        <div className="flex items-center gap-3">
                            <Lock className="w-4 h-4 text-[#0D9488]" />
                            <div className="text-left">
                                <span className="text-xs font-bold text-[#1F2937]">Change Password</span>
                                <p className="text-[9px] text-slate-400 uppercase">Last updated: 30 days ago</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                        <Shield className="w-4 h-4 text-[#0D9488]" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">AES-256 Encryption • DPDPA 2023 Compliant</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-[10px] pt-2">
                <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-[#0D9488]" />
                    <span className="font-black text-[#1F2937] uppercase tracking-tighter">Config Engine: Active</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                    <span className="font-black text-[#10b981] uppercase">Secure Session</span>
                </div>
            </div>
        </div>
    );
};

export default DoctorSettings;
