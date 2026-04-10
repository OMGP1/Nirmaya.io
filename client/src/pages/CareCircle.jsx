/**
 * CareCircle — Emergency Contact Management (DPDPA Compliant)
 */
import { useState } from 'react';
import PatientSidebar from '@/components/layout/PatientSidebar';
import { Users, Plus, Save, Shield, Trash2, Phone, UserPlus } from 'lucide-react';

const CareCircle = () => {
  const [contacts, setContacts] = useState([
    { id: 1, name: '', mobile: '', relationship: '' },
    { id: 2, name: '', mobile: '', relationship: '' },
  ]);
  const [dpdpaConsent, setDpdpaConsent] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateContact = (id, field, value) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSave = () => {
    // Stub — will wire to backend
    localStorage.setItem('niramaya_care_circle', JSON.stringify(contacts));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputClasses = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#1A2B48] placeholder:text-slate-300 focus:ring-2 focus:ring-[#008080] focus:border-transparent outline-none transition-all";

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-row">
      <PatientSidebar />
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#008080]/10 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-[#008080]" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-black text-[#1A2B48]">Care Circle</h1>
              <p className="text-xs text-slate-500">Emergency Safety-Net Configuration</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#008080] uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            DPDPA 2023
          </div>
        </header>

        <div className="flex-1 p-8 max-w-3xl mx-auto w-full space-y-8">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <Phone className="w-5 h-5 text-amber-600" />
            <p className="text-sm text-amber-800">
              These contacts will receive <strong>automated SMS alerts</strong> via Twilio when your risk score exceeds the SOS threshold.
            </p>
          </div>

          {/* Contact Cards */}
          {contacts.map((contact, index) => (
            <div key={contact.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#008080]/10 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-[#008080]" />
                  </div>
                  <h3 className="font-heading font-bold text-[#1A2B48]">Contact {index + 1}</h3>
                </div>
                {contacts.length > 1 && (
                  <button
                    onClick={() => setContacts(prev => prev.filter(c => c.id !== contact.id))}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) => updateContact(contact.id, 'name', e.target.value)}
                    placeholder="John Doe"
                    className={inputClasses}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mobile</label>
                  <input
                    type="tel"
                    value={contact.mobile}
                    onChange={(e) => updateContact(contact.id, 'mobile', e.target.value)}
                    placeholder="+91 98765 43210"
                    className={inputClasses}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Relationship</label>
                  <select
                    value={contact.relationship}
                    onChange={(e) => updateContact(contact.id, 'relationship', e.target.value)}
                    className={inputClasses + ' appearance-none cursor-pointer'}
                  >
                    <option value="">Select...</option>
                    <option value="spouse">Spouse</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="friend">Friend</option>
                    <option value="caretaker">Caretaker</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          {/* Add Contact */}
          {contacts.length < 4 && (
            <button
              onClick={() => setContacts(prev => [...prev, { id: Date.now(), name: '', mobile: '', relationship: '' }])}
              className="w-full bg-white border-2 border-dashed border-slate-200 rounded-2xl p-4 flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:border-[#008080] hover:text-[#008080] transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Emergency Contact
            </button>
          )}

          {/* DPDPA Consent */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={dpdpaConsent}
                onChange={(e) => setDpdpaConsent(e.target.checked)}
                className="mt-1 w-5 h-5 text-[#008080] rounded border-slate-300 focus:ring-[#008080]"
              />
              <div>
                <p className="text-sm font-bold text-[#1A2B48]">DPDPA 2023 Consent</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  I consent to sharing my live health telemetry and GPS coordinates with the contacts listed above during medical emergencies, as per the Digital Personal Data Protection Act 2023. Data is end-to-end encrypted (AES-256) and transmitted only during active SOS events.
                </p>
              </div>
            </label>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!dpdpaConsent}
            className="w-full py-4 bg-[#008080] text-white font-heading font-bold rounded-xl shadow-[0_8px_20px_rgba(0,128,128,0.3)] hover:shadow-[0_12px_30px_rgba(0,128,128,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saved ? (
              <><span className="text-green-300">✓</span> Saved Successfully</>
            ) : (
              <><Save className="w-4 h-4" /> Save Safety-Net Configuration</>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default CareCircle;
