/**
 * TriageResults — AI Triage Analysis Results
 */
import { useLocation, Link, useNavigate } from 'react-router-dom';
import PatientSidebar from '@/components/layout/PatientSidebar';
import { Brain, ArrowLeft, CheckCircle, User, Calendar } from 'lucide-react';

const specialistMap = {
  cardiology: { title: 'Cardiology', icon: '🫀', description: 'Heart and cardiovascular system specialists' },
  pulmonology: { title: 'Pulmonology', icon: '🫁', description: 'Lung and respiratory system specialists' },
  neurology: { title: 'Neurology', icon: '🧠', description: 'Brain and nervous system specialists' },
  gastroenterology: { title: 'Gastroenterology', icon: '🔬', description: 'Digestive system specialists' },
  orthopedics: { title: 'Orthopedics', icon: '🦴', description: 'Bone and joint specialists' },
  general: { title: 'General Medicine', icon: '🩺', description: 'Primary care and general consultation' },
};

const TriageResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-slate-500">No triage results found.</p>
          <Link to="/symptom-triage" className="text-[#008080] font-bold hover:underline">
            Go to Symptom Triage
          </Link>
        </div>
      </div>
    );
  }

  const spec = specialistMap[result.department] || specialistMap.general;
  const confPercent = Math.round(result.confidence * 100);

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-row">
      <PatientSidebar />
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-slate-200 px-8 py-6 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-[#008080]" />
            <h1 className="text-xl font-heading font-black text-[#1A2B48]">Triage Results</h1>
          </div>
        </header>

        <div className="flex-1 p-8 max-w-3xl mx-auto w-full space-y-8">
          {/* Result Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{spec.icon}</div>
              <div>
                <h2 className="text-2xl font-heading font-black text-[#1A2B48]">{spec.title}</h2>
                <p className="text-sm text-slate-500">{spec.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-heading font-black text-[#008080]">{confPercent}%</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Confidence</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-heading font-black text-[#1A2B48] capitalize">{result.severity}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Severity</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Verified</p>
              </div>
            </div>

            {/* Input Summary */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Input</p>
              <p className="text-sm text-[#1A2B48] leading-relaxed">{result.inputText}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/book" className="bg-[#008080] text-white p-5 rounded-2xl shadow-[0_4px_12px_rgba(0,128,128,0.3)] flex items-center justify-center gap-3 font-heading font-bold hover:brightness-110 transition-all">
              <Calendar className="w-5 h-5" />
              Book {spec.title} Specialist
            </Link>
            <Link to="/doctors" className="bg-white border border-slate-200 text-[#1A2B48] p-5 rounded-2xl shadow-sm flex items-center justify-center gap-3 font-heading font-bold hover:bg-slate-50 transition-all">
              <User className="w-5 h-5" />
              Browse All Specialists
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TriageResults;
