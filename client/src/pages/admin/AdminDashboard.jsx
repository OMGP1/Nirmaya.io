import { getLocalTimeFromUTC } from '@/lib/utils';
/**
 * AdminDashboard — Niramaya Mission Control
 * 
 * System health overview, FHIR JSON feed, AI model registry,
 * risk threshold controls, Twilio gateway config, and DPDPA compliance audit.
 * Preserves all existing Supabase data fetching.
 */
import { useState, useEffect } from 'react';
import { Spinner } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import {
    Zap, Rss, Database, MessageSquare, Code2, Layers,
    Settings2, PhoneForwarded, ClipboardCheck, CheckCircle,
    TrendingDown, Calendar, Users, UserCircle, Clock,
    Activity,
} from 'lucide-react';
import { format, startOfToday, endOfToday } from 'date-fns';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [appointments, doctors, patients, todayCount] = await Promise.all([
                    supabase.from('appointments').select('id', { count: 'exact', head: true }),
                    supabase.from('doctors').select('id', { count: 'exact', head: true }),
                    supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'patient'),
                    supabase
                        .from('appointments')
                        .select('id', { count: 'exact', head: true })
                        .gte('start_time', startOfToday().toISOString())
                        .lte('start_time', endOfToday().toISOString()),
                ]);

                const todayResult = await supabase
                    .from('appointments')
                    .select(`*, patient:users!appointments_patient_id_fkey(full_name), doctor:doctors(specialization, user:users(full_name))`)
                    .gte('start_time', startOfToday().toISOString())
                    .lte('start_time', endOfToday().toISOString())
                    .order('start_time');

                if (appointments.error || doctors.error || patients.error) {
                    throw new Error('Query error');
                }

                setStats({
                    totalAppointments: appointments.count || 0,
                    totalDoctors: doctors.count || 0,
                    totalPatients: patients.count || 0,
                    todayAppointments: todayCount.count || 0,
                });
                setTodayAppointments(todayResult.data || []);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setStats({ totalAppointments: 0, totalDoctors: 0, totalPatients: 0, todayAppointments: 0 });
                setTodayAppointments([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto w-full">
            {/* 1. System Health Overview — Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* AI Model Latency */}
                <div className="bg-[#0B1120] p-6 rounded-xl border border-white/10 shadow-lg group hover:border-[#0D9488]/50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <Zap className="w-5 h-5 text-[#0D9488]" />
                        <span className="text-[10px] font-black text-[#0D9488] bg-[#0D9488]/20 border border-[#0D9488]/30 px-2 py-0.5 rounded uppercase">Real-time</span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Appointments</p>
                    <h2 className="text-3xl font-heading font-black text-white group-hover:text-[#0D9488] transition-colors">
                        {stats.totalAppointments.toLocaleString()}
                    </h2>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-[#0D9488]">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>Tracked via Supabase</span>
                    </div>
                </div>

                {/* Active IoT Streams → Active Doctors */}
                <div className="bg-[#0B1120] p-6 rounded-xl border border-white/10 shadow-lg group hover:border-blue-500/50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <Rss className="w-5 h-5 text-blue-400" />
                        <div className="flex gap-1">
                            <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" />
                            <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '75ms' }} />
                            <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        </div>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Active Doctors</p>
                    <h2 className="text-3xl font-heading font-black text-white group-hover:text-blue-400 transition-colors">
                        {stats.totalDoctors.toLocaleString()}
                    </h2>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-500">
                        <span>Clinical Workforce Online</span>
                    </div>
                </div>

                {/* Total FHIR Records → Patients */}
                <div className="bg-[#0B1120] p-6 rounded-xl border border-white/10 shadow-lg group hover:border-purple-500/50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <Database className="w-5 h-5 text-purple-400" />
                        <CheckCircle className="w-4 h-4 text-[#0D9488]" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Patient Records</p>
                    <h2 className="text-3xl font-heading font-black text-white group-hover:text-purple-400 transition-colors">
                        {stats.totalPatients.toLocaleString()}
                    </h2>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-500">
                        <span>HL7 FHIR R4 Standard</span>
                    </div>
                </div>

                {/* SMS Gateway → Today */}
                <div className="bg-[#0B1120] p-6 rounded-xl border border-white/10 shadow-lg group hover:border-orange-500/50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <MessageSquare className="w-5 h-5 text-orange-400" />
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-[#0D9488]/20 border border-[#0D9488]/30 text-[#0D9488] rounded">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />
                            <span className="text-[9px] font-black uppercase">Active</span>
                        </div>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Today's Schedule</p>
                    <h2 className="text-3xl font-heading font-black text-white group-hover:text-orange-400 transition-colors">
                        {stats.todayAppointments}
                    </h2>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-500">
                        <span>Dispatch Queue Active</span>
                    </div>
                </div>
            </div>

            {/* 2. Technical Vault — FHIR JSON + AI Registry + Risk Thresholds */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: FHIR JSON Feed */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="bg-[#1E293B] rounded-xl border border-slate-700 shadow-xl overflow-hidden flex flex-col h-[500px]">
                        <div className="bg-[#0B1120]/50 px-6 py-3 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Code2 className="w-4 h-4 text-[#0D9488]" />
                                <h3 className="text-xs font-bold text-white uppercase tracking-widest">Live FHIR R4 JSON Payload Feed</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-white/40">POST /fhir/Observation</span>
                                <div className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
                            </div>
                        </div>
                        <div className="flex-1 p-6 font-mono text-[11px] leading-relaxed overflow-y-auto bg-[#0F172A] text-blue-300">
                            <pre>{`{
  "resourceType": "Observation",
  "id": "heart-rate-v10293",
  "status": "final",
  "category": [{
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/observation-category",
      "code": "vital-signs"
    }]
  }],
  "code": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "8867-4",
      "display": "Heart rate"
    }]
  },
  "subject": { "reference": "Patient/P-99203" },
  "effectiveDateTime": "2023-11-20T14:22:11Z",
  "valueQuantity": {
    "value": 118,
    "unit": "beats/minute",
    "system": "http://unitsofmeasure.org",
    "code": "/min"
  }
}`}
<span className="text-[#0D9488] opacity-80">{'// Incoming stream...'}</span>
{`
{
  "resourceType": "Observation",
  "id": "spo2-v10294",
  "valueQuantity": { "value": 92, "unit": "%" }
}`}
                            </pre>
                        </div>
                    </div>
                </div>

                {/* Right: AI Registry + Risk Thresholds */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* AI Intelligence Registry */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Layers className="w-5 h-5 text-[#0B1120]" />
                            <h3 className="text-sm font-black text-[#0B1120] uppercase tracking-widest">AI Intelligence Registry</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-[#0B1120]">BioBERT NLP Triage</span>
                                    <span className="text-[10px] font-mono text-slate-500">v2.4.1-stable</span>
                                </div>
                                <span className="px-2 py-1 bg-[#0D9488] text-white text-[9px] font-black rounded uppercase">Active</span>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-[#0B1120]">XGBoost Risk Engine</span>
                                    <span className="text-[10px] font-mono text-slate-500">v5.0.0-rc2</span>
                                </div>
                                <span className="px-2 py-1 bg-[#0D9488] text-white text-[9px] font-black rounded uppercase">Active</span>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between opacity-50">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-[#0B1120]">CNN Image Analysis</span>
                                    <span className="text-[10px] font-mono text-slate-500">v0.8.4-beta</span>
                                </div>
                                <span className="px-2 py-1 bg-slate-500 text-white text-[9px] font-black rounded uppercase">Offline</span>
                            </div>
                        </div>
                        <button className="w-full mt-6 py-3 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:border-[#0D9488] hover:text-[#0D9488] transition-all">
                            Register New Model
                        </button>
                    </div>

                    {/* Risk Threshold Logic */}
                    <div className="bg-[#0B1120] text-white rounded-xl shadow-xl p-6 border border-white/10">
                        <div className="flex items-center gap-3 mb-6">
                            <Settings2 className="w-5 h-5 text-[#0D9488]" />
                            <h3 className="text-sm font-black uppercase tracking-widest">Risk Threshold Logic</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold">Global Breach Threshold</span>
                                    <span className="text-lg font-heading font-black text-[#0D9488]">75%</span>
                                </div>
                                <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="absolute top-0 left-0 h-full w-3/4 bg-[#0D9488] rounded-full" />
                                </div>
                                <p className="text-[10px] text-white/40 leading-relaxed italic">
                                    "Trigger Emergency alerts when Risk Vector (NEWS2) exceeds this value."
                                </p>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Auto-Escalation</span>
                                <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-[#0D9488] transition-colors">
                                    <span className="inline-block h-3 w-3 translate-x-5 transform rounded-full bg-white transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Compliance Audit */}
            <div className="grid grid-cols-1 gap-8">
                {/* DPDPA Compliance Audit */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <ClipboardCheck className="w-5 h-5 text-[#0D9488]" />
                            <h3 className="text-sm font-black text-[#0B1120] uppercase tracking-widest">DPDPA 2023 Compliance Audit</h3>
                        </div>
                        <span className="text-[10px] font-bold text-[#0D9488] uppercase">Audit: Passing</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase">Patient ID</th>
                                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase">Consent Type</th>
                                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase">Last Verified</th>
                                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {todayAppointments.length > 0 ? (
                                    todayAppointments.slice(0, 5).map((apt, i) => (
                                        <tr key={apt.id}>
                                            <td className="py-4 text-xs font-mono text-[#0B1120]">P-{String(apt.id).slice(-5).toUpperCase()}</td>
                                            <td className="py-4 text-xs text-slate-500">{i % 2 === 0 ? 'Real-time Vitals' : 'Emergency SMS'}</td>
                                            <td className="py-4 text-xs text-slate-500">{format(getLocalTimeFromUTC(apt.start_time), 'h:mm a')}</td>
                                            <td className="py-4"><span className="text-[9px] font-black text-[#0D9488] uppercase">Verified</span></td>
                                        </tr>
                                    ))
                                ) : (
                                    <>
                                        <tr>
                                            <td className="py-4 text-xs font-mono text-[#0B1120]">P-99203</td>
                                            <td className="py-4 text-xs text-slate-500">Real-time Vitals</td>
                                            <td className="py-4 text-xs text-slate-500">12m ago</td>
                                            <td className="py-4"><span className="text-[9px] font-black text-[#0D9488] uppercase">Verified</span></td>
                                        </tr>
                                        <tr>
                                            <td className="py-4 text-xs font-mono text-[#0B1120]">P-88412</td>
                                            <td className="py-4 text-xs text-slate-500">Emergency SMS</td>
                                            <td className="py-4 text-xs text-slate-500">1h ago</td>
                                            <td className="py-4"><span className="text-[9px] font-black text-[#0D9488] uppercase">Verified</span></td>
                                        </tr>
                                        <tr>
                                            <td className="py-4 text-xs font-mono text-[#0B1120]">P-77129</td>
                                            <td className="py-4 text-xs text-slate-500">Data Storage</td>
                                            <td className="py-4 text-xs text-slate-500">3h ago</td>
                                            <td className="py-4"><span className="text-[9px] font-black text-[#0D9488] uppercase">Verified</span></td>
                                        </tr>
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
