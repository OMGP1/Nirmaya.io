/**
 * Landing Page — Niramaya.io Clinical Intelligence
 * 
 * Dark-theme hero with digital health aesthetic, AI status badges,
 * feature cards, and compliance footer. Matches reference index.html.
 */
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Activity, Zap, Brain, Phone, Shield, ArrowRight, Lock, Globe } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Predictive Risk Engine',
    subtitle: 'XGBoost v5.0',
    description: 'Real-time NEWS2 scoring with multi-modal physiological analysis. Detects anomalies before they escalate.',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/10',
  },
  {
    icon: Activity,
    title: 'Clinical Triage',
    subtitle: 'BioBERT NLP',
    description: 'AI-driven symptom analysis using clinically-trained transformer models for instant triage routing.',
    color: 'text-teal-400',
    bgColor: 'bg-teal-400/10',
  },
  {
    icon: Phone,
    title: 'Instant SOS Action',
    subtitle: 'Twilio Integration',
    description: 'Automated emergency SMS with GPS coordinates to your Care-Circle when risk thresholds are breached.',
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
  },
];

const Landing = () => {
  const { isAuthenticated, profile, loading } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      if (profile?.role === 'admin') navigate('/admin');
      else if (profile?.role === 'doctor') navigate('/doctor');
      else navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white font-sans overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-20 px-6 lg:px-12 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#008080] rounded-xl flex items-center justify-center shadow-lg shadow-[#008080]/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-heading font-bold tracking-tight">Niramaya.io</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-widest font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-[#008080] animate-pulse" />
            Engineering Health Intelligence
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all"
          >
            Portal Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-6">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #008080 0%, transparent 70%)' }}
          />
          <div className="absolute top-20 right-20 w-2 h-2 bg-cyan-400/40 rounded-full animate-pulse" />
          <div className="absolute bottom-32 left-16 w-1.5 h-1.5 bg-teal-500/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-40 left-1/4 w-1 h-1 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-10">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-full animate-fade-in">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008080] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#008080]" style={{ boxShadow: '0 0 10px rgba(0,128,128,0.5)' }} />
            </span>
            <span className="text-xs font-bold text-[#00F5FF] uppercase tracking-[0.2em]">
              AI Inference: 184ms • FHIR Sync: Active
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-6 animate-slide-up">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-black tracking-tight leading-[1.1]">
              <span className="block">Seconds Matter.</span>
              <span className="block text-gradient-cyan">Intelligence Saves.</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed font-light">
              A real-time clinical intelligence platform that monitors your vitals, predicts health risks using NEWS2 scoring, and triggers life-saving alerts — before it's too late.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-scale-in" style={{ animationDelay: '400ms' }}>
            <button
              onClick={handleGetStarted}
              disabled={loading}
              className="group px-10 py-5 bg-[#008080] text-white font-heading font-black text-lg rounded-2xl shadow-[0_10px_30px_rgba(0,128,128,0.3)] hover:shadow-[0_15px_40px_rgba(0,128,128,0.4)] hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Enter Clinical Portal'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-heading font-bold text-lg rounded-2xl transition-all flex items-center justify-center gap-3"
            >
              <Shield className="w-5 h-5" />
              Specialist Access
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <p className="text-xs font-bold text-[#008080] uppercase tracking-[0.3em]">Intelligence Stack</p>
            <h2 className="text-3xl sm:text-4xl font-heading font-black tracking-tight">
              Clinical-Grade AI Infrastructure
            </h2>
            <p className="text-white/40 max-w-2xl mx-auto">
              Purpose-built for real-time patient monitoring, predictive risk scoring, and autonomous emergency response.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-white/[0.03] border border-white/10 rounded-2xl p-8 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-white text-sm">{feature.title}</h3>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{feature.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Compliance Footer */}
      <footer className="relative py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#008080]" />
              <span className="text-[10px] font-black text-[#008080] uppercase tracking-widest">TLS 1.3 Active</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-white/40" />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">DPDPA 2023</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-white/40" />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">HL7 FHIR R4</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008080] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#008080]" />
            </span>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
              System Health: Nominal • Latency: 142ms
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
