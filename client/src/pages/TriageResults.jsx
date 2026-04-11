/**
 * TriageResults — AI Triage Analysis Results with Severity-Aware Routing
 * 
 * Low/Moderate severity → Standard specialist booking
 * High severity → Auto-prompt SOS modal for proximity-based doctor assignment
 */
import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import PatientSidebar from '@/components/layout/PatientSidebar';
import SOSModal from '@/components/emergency/SOSModal';
import { getDoctors } from '@/services/doctors';
import { Spinner } from '@/components/ui';
import { Brain, ArrowLeft, CheckCircle, User, Calendar, AlertTriangle, Radio, Shield, Star, Clock } from 'lucide-react';

const specialistMap = {
  cardiology: { title: 'Cardiology', icon: '🫀', description: 'Heart and cardiovascular system specialists' },
  pulmonology: { title: 'Pulmonology', icon: '🫁', description: 'Lung and respiratory system specialists' },
  neurology: { title: 'Neurology', icon: '🧠', description: 'Brain and nervous system specialists' },
  gastroenterology: { title: 'Gastroenterology', icon: '🔬', description: 'Digestive system specialists' },
  orthopedics: { title: 'Orthopedics', icon: '🦴', description: 'Bone and joint specialists' },
  general: { title: 'General Medicine', icon: '🩺', description: 'Primary care and general consultation' },
};

const severityConfig = {
  low: { label: 'Low', color: 'bg-green-100 text-green-700 border-green-200', dotColor: 'bg-green-500' },
  moderate: { label: 'Moderate', color: 'bg-amber-100 text-amber-700 border-amber-200', dotColor: 'bg-amber-500' },
  high: { label: 'High', color: 'bg-red-100 text-red-700 border-red-200', dotColor: 'bg-red-500' },
};

const TriageResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;
  const [showSOS, setShowSOS] = useState(false);
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  useEffect(() => {
    if (result?.department) {
      const fetchDocs = async () => {
        setLoadingDoctors(true);
        try {
          const docs = await getDoctors({ search: result.department });
          setRecommendedDoctors(docs.slice(0, 4)); // Get top 4 relevant
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingDoctors(false);
        }
      };
      fetchDocs();
    } else {
      setLoadingDoctors(false);
    }
  }, [result?.department]);

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
  const severity = severityConfig[result.severity] || severityConfig.low;
  const isHighSeverity = result.severity === 'high';

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-row overflow-hidden relative">
      <PatientSidebar />
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        <header className="bg-white border-b border-slate-200 px-8 pt-16 pb-6 sm:py-6 flex items-center gap-4 shrink-0">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-[#008080]" />
            <h1 className="text-xl font-heading font-black text-[#1A2B48]">Triage Results</h1>
          </div>
        </header>

        <div className="flex-1 p-8 max-w-3xl mx-auto w-full space-y-8">
          {/* High Severity Alert Banner */}
          {isHighSeverity && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-heading font-black text-red-700 text-sm">High Severity Detected</p>
                  <p className="text-xs text-red-500">We recommend using SOS to find the nearest available doctor</p>
                </div>
              </div>
              <button
                onClick={() => setShowSOS(true)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-heading font-bold text-sm rounded-xl shadow-[0_4px_12px_rgba(239,68,68,0.3)] transition-all flex items-center gap-2"
              >
                <Radio className="w-4 h-4" />
                Activate SOS
              </button>
            </div>
          )}

          {/* Result Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{spec.icon}</div>
                <div>
                  <h2 className="text-2xl font-heading font-black text-[#1A2B48]">{spec.title}</h2>
                  <p className="text-sm text-slate-500">{spec.description}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-heading font-black text-[#008080]">{confPercent}%</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Confidence</p>
              </div>
              <div className={`rounded-xl p-4 text-center border ${severity.color}`}>
                <div className="flex items-center justify-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${severity.dotColor} ${isHighSeverity ? 'animate-pulse' : ''}`} />
                  <p className="text-2xl font-heading font-black capitalize">{result.severity}</p>
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mt-1 opacity-70">Severity</p>
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

          {/* Actions — severity-aware routing */}
          <div className="grid sm:grid-cols-2 gap-4">
            {isHighSeverity ? (
              <>
                {/* High severity: SOS is primary action */}
                <button
                  onClick={() => setShowSOS(true)}
                  className="bg-red-600 hover:bg-red-700 text-white p-5 rounded-2xl shadow-[0_4px_12px_rgba(239,68,68,0.3)] flex items-center justify-center gap-3 font-heading font-bold transition-all"
                >
                  <Radio className="w-5 h-5" />
                  🚨 SOS — Find Nearest Doctor
                </button>
                <Link to="/book" className="bg-white border border-slate-200 text-[#1A2B48] p-5 rounded-2xl shadow-sm flex items-center justify-center gap-3 font-heading font-bold hover:bg-slate-50 transition-all">
                  <Calendar className="w-5 h-5" />
                  Schedule Regular Appointment
                </Link>
              </>
            ) : (
              <>
                {/* Low/Moderate severity: Standard booking is primary */}
                <Link to="/book" className="bg-[#008080] text-white p-5 rounded-2xl shadow-[0_4px_12px_rgba(0,128,128,0.3)] flex items-center justify-center gap-3 font-heading font-bold hover:brightness-110 transition-all">
                  <Calendar className="w-5 h-5" />
                  Book {spec.title} Specialist
                </Link>
                <Link to="/doctors" className="bg-white border border-slate-200 text-[#1A2B48] p-5 rounded-2xl shadow-sm flex items-center justify-center gap-3 font-heading font-bold hover:bg-slate-50 transition-all">
                  <User className="w-5 h-5" />
                  Browse All Specialists
                </Link>
              </>
            )}
          </div>

          {/* SOS option always visible for low/moderate too */}
          {!isHighSeverity && (
            <div className="text-center">
              <button
                onClick={() => setShowSOS(true)}
                className="text-sm text-red-500 hover:text-red-600 font-bold flex items-center gap-2 mx-auto transition-colors mt-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Need immediate help? Trigger Emergency SOS
              </button>
            </div>
          )}

          {/* Recommended Specialists Section */}
          <div className="pt-8 border-t border-slate-200">
            <h3 className="text-lg font-heading font-black text-[#1A2B48] mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-[#008080]" />
              Recommended Specialists
            </h3>
            {loadingDoctors ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : recommendedDoctors.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 text-sm">
                No specialists matching this description are available at the moment.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {recommendedDoctors.map((doctor) => (
                  <div key={doctor.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col hover:border-[#008080]/30 hover:shadow-md transition-all">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#008080]/10 flex items-center justify-center font-heading font-black text-lg text-[#008080] border border-[#008080]/20 shrink-0">
                        {doctor.user?.full_name?.charAt(0) || 'D'}
                      </div>
                      <div className="flex-1 min-w-0">
                          <h3 className="font-heading font-black text-base text-[#1A2B48] truncate">
                              Dr. {doctor.user?.full_name}
                          </h3>
                          <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
                              {doctor.specialization}
                          </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-3">
                         {doctor.experience_years && (
                             <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
                                 <Clock className="w-3.5 h-3.5 text-slate-400" />
                                 {doctor.experience_years}y
                             </div>
                         )}
                         {doctor.average_rating && (
                             <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                                 <Star className="w-3.5 h-3.5 text-amber-500" />
                                 {doctor.average_rating.toFixed(1)}
                             </div>
                         )}
                      </div>
                      <Link
                          to={`/book?doctorId=${doctor.id}`}
                          className="px-4 py-2 bg-slate-100 text-[#1A2B48] text-xs font-bold rounded-lg hover:bg-[#008080] hover:text-white transition-colors flex items-center gap-1.5"
                      >
                          <Calendar className="w-3.5 h-3.5" /> Book
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* SOS Emergency Modal */}
      <SOSModal isOpen={showSOS} onClose={() => setShowSOS(false)} />
    </div>
  );
};

export default TriageResults;
