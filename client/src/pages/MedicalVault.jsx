/**
 * MedicalVault — FHIR-Compliant Medical Records
 */
import PatientSidebar from '@/components/layout/PatientSidebar';
import { ShieldCheck, Download, FileText, CheckCircle, ExternalLink } from 'lucide-react';

const mockObservations = [
  { loinc: '8867-4', label: 'Heart Rate', value: '72', unit: 'bpm', ref: '60-100 bpm', status: 'verified', date: '2026-04-09' },
  { loinc: '2708-6', label: 'SpO2', value: '97', unit: '%', ref: '95-100%', status: 'verified', date: '2026-04-09' },
  { loinc: '9279-1', label: 'Respiratory Rate', value: '16', unit: 'rpm', ref: '12-20 rpm', status: 'verified', date: '2026-04-08' },
  { loinc: '8310-5', label: 'Body Temperature', value: '36.8', unit: '°C', ref: '36.1-37.2°C', status: 'verified', date: '2026-04-08' },
  { loinc: '85354-9', label: 'Blood Pressure', value: '120/78', unit: 'mmHg', ref: '<120/80 mmHg', status: 'verified', date: '2026-04-07' },
  { loinc: '2339-0', label: 'Blood Glucose', value: '98', unit: 'mg/dL', ref: '70-100 mg/dL', status: 'pending', date: '2026-04-07' },
];

const MedicalVault = () => {
  return (
    <div className="h-screen w-full bg-slate-50 flex flex-row overflow-hidden relative">
      <PatientSidebar />
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        <header className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#008080]/10 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#008080]" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-black text-[#1A2B48]">Medical Vault</h1>
              <p className="text-xs text-slate-500">FHIR R4 / ICD-10 Compliant Records</p>
            </div>
          </div>
          <button className="px-4 py-2.5 bg-[#008080] text-white text-sm font-bold rounded-xl shadow-sm hover:brightness-110 transition-all flex items-center gap-2">
            <Download className="w-4 h-4" /> Export XML
          </button>
        </header>

        <div className="flex-1 p-8 max-w-5xl mx-auto w-full space-y-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
              <p className="text-3xl font-heading font-black text-[#008080]">{mockObservations.length}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Total Observations</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
              <p className="text-3xl font-heading font-black text-[#1A2B48]">2026-04-09</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Last Update</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-heading font-black text-green-600">Authenticated</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">Source Verified</p>
              </div>
            </div>
          </div>

          {/* Observations Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-heading font-bold text-[#1A2B48]">Clinical Observations</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">LOINC Code</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Observation</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {mockObservations.map((obs, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-[#008080] font-bold">{obs.loinc}</td>
                      <td className="px-6 py-4 font-bold text-[#1A2B48]">{obs.label}</td>
                      <td className="px-6 py-4">
                        <span className="font-heading font-black text-[#1A2B48]">{obs.value}</span>
                        <span className="text-slate-400 ml-1">{obs.unit}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{obs.ref}</td>
                      <td className="px-6 py-4">
                        {obs.status === 'verified' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">{obs.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FHIR JSON Preview */}
          <div className="bg-[#0F172A] rounded-2xl border border-slate-700 p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#008080]" />
                <span className="text-xs font-bold text-[#008080] uppercase tracking-wider">FHIR R4 Payload</span>
              </div>
              <button className="text-xs text-white/40 hover:text-white flex items-center gap-1 transition-colors">
                <ExternalLink className="w-3 h-3" /> Full View
              </button>
            </div>
            <pre className="text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed">
{`{
  "resourceType": "Bundle",
  "type": "collection",
  "entry": [
    {
      "resource": {
        "resourceType": "Observation",
        "code": {
          "coding": [{ "system": "http://loinc.org", "code": "8867-4", "display": "Heart Rate" }]
        },
        "valueQuantity": { "value": 72, "unit": "bpm" },
        "status": "final"
      }
    }
  ]
}`}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MedicalVault;
