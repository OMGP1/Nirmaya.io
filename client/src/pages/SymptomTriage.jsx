/**
 * SymptomTriage — AI-Powered Symptom Analysis
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientSidebar from '@/components/layout/PatientSidebar';
import { useNiramaya } from '@/hooks/useNiramaya';
import { Activity, Brain, AlertTriangle, Mic, Lock, ArrowRight } from 'lucide-react';

const SymptomTriage = () => {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();
  const { analyzeSymptoms } = useNiramaya();

  const handleAnalyze = async () => {
    if (input.length < 10) return;
    setIsAnalyzing(true);
    await new Promise((r) => setTimeout(r, 1500));
    const result = analyzeSymptoms(input);
    setIsAnalyzing(false);
    navigate('/triage-results', { state: { result } });
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-row">
      <PatientSidebar />
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#008080]/10 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-[#008080]" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-black text-[#1A2B48]">AI Symptom Triage</h1>
              <p className="text-xs text-slate-500">BioBERT Clinical NLP Engine v4.2</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008080] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#008080]" />
            </span>
            <span className="text-xs font-bold text-[#008080]">AI Online</span>
          </div>
        </header>

        <div className="flex-1 flex flex-col justify-center items-center p-8 max-w-3xl mx-auto w-full">
          <div className="inline-flex items-center gap-3 bg-[#008080]/5 border border-[#008080]/10 px-5 py-2.5 rounded-full mb-8">
            <Activity className="w-4 h-4 text-[#008080] animate-pulse" />
            <span className="text-xs font-bold text-[#008080] uppercase tracking-wider">Neural Pipeline Active</span>
          </div>

          <h2 className="text-3xl font-heading font-black text-[#1A2B48] text-center mb-2">Describe Your Symptoms</h2>
          <p className="text-slate-500 text-center mb-8 max-w-lg">
            Use natural language to describe what you&apos;re experiencing. Our AI will analyze and route to the appropriate specialist.
          </p>

          <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., I've been experiencing persistent chest tightness and shortness of breath for the past 3 days, especially during physical activity..."
              rows={6}
              className="w-full resize-none text-sm text-[#1A2B48] placeholder:text-slate-300 bg-slate-50 border border-slate-100 rounded-xl p-5 focus:ring-2 focus:ring-[#008080] focus:border-transparent outline-none transition-all leading-relaxed"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-400">{input.length}/500</span>
                <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#008080] transition-colors">
                  <Mic className="w-3.5 h-3.5" /> Voice Input
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => navigate('/dashboard')} className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-[#1A2B48] transition-colors">Cancel</button>
                <button
                  onClick={handleAnalyze}
                  disabled={input.length < 10 || isAnalyzing}
                  className="px-6 py-3 bg-[#008080] text-white font-heading font-bold text-sm rounded-xl shadow-[0_4px_12px_rgba(0,128,128,0.3)] hover:shadow-[0_8px_20px_rgba(0,128,128,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isAnalyzing ? (<><Activity className="w-4 h-4 animate-spin" /> Analyzing...</>) : (<>Analyze with AI <ArrowRight className="w-4 h-4" /></>)}
                </button>
              </div>
            </div>
          </div>

          <button className="mt-8 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-heading font-black rounded-2xl shadow-[0_4px_12px_rgba(231,29,54,0.3)] transition-all flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" /> Emergency SOS — Trigger Alert Now
          </button>
        </div>

        <footer className="p-4 bg-white border-t border-slate-200">
          <div className="max-w-3xl mx-auto flex justify-between items-center text-[10px] font-mono text-slate-400">
            <span>BERT_MODEL: BioBERT_v1.1 • Latency: 184ms</span>
            <div className="flex items-center gap-3">
              <Lock className="w-3 h-3 text-[#008080]" /> <span>AES-256 • DPDPA Compliant</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default SymptomTriage;
