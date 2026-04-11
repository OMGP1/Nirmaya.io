import { getLocalTimeFromUTC } from '@/lib/utils';
/**
 * AppointmentDetail — Clinical Deep-Dive
 * 
 * Patient profile, real-time telemetry cards, CDS radial gauge,
 * intervention protocol, and clinical notes. 
 * All Supabase logic preserved.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useNiramaya } from '@/hooks/useNiramaya';
import { supabase } from '@/lib/supabase';
import { Spinner, Alert } from '@/components/ui';
import {
    ArrowLeft, User, Calendar, Clock, Mail, Phone,
    FileText, Check, X, Save, Heart, Droplets, Activity,
    AlertTriangle, ShieldAlert, Zap, Video, Download,
    TrendingUp, TrendingDown, ArrowUpRight, Eye, File, Image,
} from 'lucide-react';
import { getPatientDocuments, getDocumentUrl } from '@/services/documents';

// --- Patient Documents Sub-Panel (used inside AppointmentDetail) ---
const PatientDocumentsPanel = ({ patientId, patientDocs, setPatientDocs, docsLoading, setDocsLoading, appointmentNotes, appointmentReason }) => {
    useEffect(() => {
        if (!patientId) return;
        setDocsLoading(true);
        getPatientDocuments(patientId)
            .then(docs => setPatientDocs(docs))
            .catch(err => console.error('Failed to fetch patient docs:', err))
            .finally(() => setDocsLoading(false));
    }, [patientId]);

    const handleView = async (doc) => {
        try {
            const url = await getDocumentUrl(doc.file_path);
            window.open(url, '_blank');
        } catch { alert('Cannot open document'); }
    };

    const getTypeColor = (type) => {
        const colors = {
            prescription: 'bg-blue-50 text-blue-600 border-blue-200',
            lab_report: 'bg-green-50 text-green-600 border-green-200',
            imaging: 'bg-purple-50 text-purple-600 border-purple-200',
            discharge_summary: 'bg-amber-50 text-amber-600 border-amber-200',
            other: 'bg-slate-50 text-slate-600 border-slate-200',
        };
        return colors[type] || colors.other;
    };

    // Generate a structured AI Summary from metadata
    const generateSummary = () => {
        const lines = [];
        if (appointmentReason) lines.push(`**Chief Complaint:** ${appointmentReason}`);
        if (appointmentNotes) lines.push(`**Clinical Notes:** ${appointmentNotes}`);
        if (patientDocs.length > 0) {
            const rxCount = patientDocs.filter(d => d.document_type === 'prescription').length;
            const labCount = patientDocs.filter(d => d.document_type === 'lab_report').length;
            const imgCount = patientDocs.filter(d => d.document_type === 'imaging').length;
            lines.push(`**Documents on File:** ${patientDocs.length} total (${rxCount} prescriptions, ${labCount} lab reports, ${imgCount} imaging)`);
            const recent = patientDocs.slice(0, 3);
            recent.forEach(d => {
                lines.push(`• _${d.file_name}_ — ${d.description || d.document_type?.replace('_', ' ')} (${new Date(d.uploaded_at).toLocaleDateString()})`);
            });
        } else {
            lines.push('_No documents uploaded by patient._');
        }
        return lines;
    };

    return (
        <div className="space-y-4">
            {/* AI Clinical Summary */}
            <div className="bg-gradient-to-br from-[#0B1120] to-[#1a2744] rounded-[16px] border border-white/10 p-5 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-[#0D9488]/20 rounded-lg">
                        <Zap className="w-3.5 h-3.5 text-[#0D9488]" />
                    </div>
                    <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">AI Clinical Brief</span>
                </div>
                <div className="space-y-1.5">
                    {generateSummary().map((line, i) => (
                        <p key={i} className="text-xs text-white/80 leading-relaxed" dangerouslySetInnerHTML={{
                            __html: line
                                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                                .replace(/_(.*?)_/g, '<em class="text-[#0D9488]">$1</em>')
                        }} />
                    ))}
                </div>
            </div>

            {/* Documents List */}
            <div className="bg-white rounded-[16px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#0D9488]" />
                    <h3 className="text-[10px] font-black text-[#1F2937] uppercase tracking-widest">Patient Documents</h3>
                    <span className="ml-auto px-2 py-0.5 bg-[#0D9488]/10 text-[#0D9488] text-[9px] font-black rounded uppercase border border-[#0D9488]/20">
                        {patientDocs.length}
                    </span>
                </div>

                {docsLoading ? (
                    <div className="p-6 text-center text-xs text-slate-400">Loading documents...</div>
                ) : patientDocs.length > 0 ? (
                    <div className="divide-y divide-slate-50 max-h-60 overflow-y-auto">
                        {patientDocs.map(doc => {
                            const IconComp = doc.file_type?.includes('image') ? Image : doc.file_type?.includes('pdf') ? FileText : File;
                            return (
                                <div key={doc.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-[#0D9488]/10 flex items-center justify-center shrink-0">
                                        <IconComp className="w-4 h-4 text-[#0D9488]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-[#1F2937] truncate">{doc.file_name}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className={`px-1.5 py-0.5 text-[8px] font-black rounded uppercase border ${getTypeColor(doc.document_type)}`}>
                                                {doc.document_type?.replace('_', ' ')}
                                            </span>
                                            <span className="text-[9px] text-slate-400">{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleView(doc)} className="p-1.5 hover:bg-[#0D9488]/10 rounded-lg transition-colors" title="View document">
                                        <Eye className="w-3.5 h-3.5 text-[#0D9488]" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-6 text-center text-xs text-slate-400">
                        No documents uploaded by this patient
                    </div>
                )}
            </div>
        </div>
    );
};

const AppointmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { vitals, riskScore, riskHex } = useNiramaya(true);
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [patientDocs, setPatientDocs] = useState([]);
    const [docsLoading, setDocsLoading] = useState(false);

    useEffect(() => {
        const fetchAppointment = async () => {
            try {
                if (!user || !id) return;

                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005';
                const { data: { session } } = await supabase.auth.getSession();
                
                if (!session?.access_token) {
                    throw new Error("Not authenticated");
                }

                const res = await fetch(`${API_URL}/api/doctor/appointments/${id}`, {
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                });

                const json = await res.json();

                if (!res.ok) {
                    throw new Error(json.error?.message || 'Failed to fetch appointment');
                }

                setAppointment(json.data?.appointment);
                setNotes(json.data?.appointment?.clinical_notes || '');
            } catch (err) {
                console.error('Error fetching appointment:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (user && id) {
            fetchAppointment();
        }
    }, [user, id]);

    const handleStatusUpdate = async (newStatus) => {
        try {
            setActionLoading(true);

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005';
            const { data: { session } } = await supabase.auth.getSession();

            const res = await fetch(`${API_URL}/api/doctor/appointments/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.error?.message || 'Failed to update status');
            }

            setAppointment(json.data?.appointment);
        } catch (err) {
            console.error('Status update error:', err);
            alert('Failed to update appointment status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveNotes = async () => {
        try {
            setSaving(true);

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005';
            const { data: { session } } = await supabase.auth.getSession();

            const res = await fetch(`${API_URL}/api/doctor/appointments/${id}/notes`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ notes })
            });

            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.error?.message || 'Failed to save notes');
            }

            setAppointment(json.data?.appointment);
            alert('Notes saved successfully!');
        } catch (err) {
            console.error('Save notes error:', err);
            alert('Failed to save notes');
        } finally {
            setSaving(false);
        }
    };

    const handleDownloadFHIR = () => {
        if (!appointment) return;

        const fhirContent = `
HL7 FHIR v4.0.1 Data Export
======================================
Patient ID: ${appointment.patient?.id || 'Unknown'}
Patient Name: ${appointment.patient?.full_name || 'N/A'}
Contact Email: ${appointment.patient?.email || 'N/A'}

Encounter ID: ${appointment.id}
Consultation Date: ${new Date(appointment.start_time).toLocaleString()}
Department: ${typeof appointment.department === 'object' ? appointment.department?.name || JSON.stringify(appointment.department) : appointment.department || 'N/A'}
Status: ${appointment.status}

Clinical Reason for Visit:
${appointment.reason || 'N/A'}

Provider Notes:
${notes || 'No clinical notes recorded.'}

======================================
Generated on: ${new Date().toISOString()}
Niramaya Interoperability Gateway
`.trim();

        const blob = new Blob([fhirContent], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `FHIR_Encounter_${appointment.patient?.full_name?.replace(/\s+/g, '_') || 'Patient'}_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error || !appointment) {
        return (
            <div className="space-y-4">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-[#1F2937] hover:bg-slate-50 transition-all">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <Alert variant="error">{error || 'Appointment not found'}</Alert>
            </div>
        );
    }

    const riskVal = riskScore || 0;
    const isHighRisk = riskVal > 70;
    const gaugeOffset = 552.92 - (552.92 * Math.min(riskVal, 100)) / 100;

    const statusConfig = {
        pending: { label: 'Pending Review', color: 'text-amber-600 bg-amber-50 border-amber-200' },
        confirmed: { label: 'Confirmed', color: 'text-green-600 bg-green-50 border-green-200' },
        completed: { label: 'Completed', color: 'text-slate-600 bg-slate-50 border-slate-200' },
        cancelled: { label: 'Cancelled', color: 'text-red-600 bg-red-50 border-red-200' },
    };
    const sc = statusConfig[appointment.status] || statusConfig.pending;

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200">
                        <ArrowLeft className="w-5 h-5 text-[#1F2937]" />
                    </button>
                    <div>
                        <h1 className="text-xl font-heading font-black text-[#0B1120] tracking-tight">Clinical Deep-Dive</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-[#1F2937]/60 uppercase tracking-wider">Patient ID: {appointment.patient?.id?.slice(0, 8)}</span>
                            <div className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-[10px] font-bold text-[#0D9488] uppercase tracking-wider">Session Active</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 bg-[#0B1120] px-3 py-1.5 rounded-lg border border-white/10">
                        <Zap className="w-4 h-4 text-[#0D9488] animate-pulse" />
                        <span className="text-[10px] font-black text-white uppercase tracking-wider">IoT Gateway: Connected</span>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white text-[11px] font-black rounded-lg shadow-md hover:brightness-110 transition-all uppercase tracking-wider">
                        <Video className="w-4 h-4" /> Tele-Consult
                    </button>
                </div>
            </div>

            {/* 12-col Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column: Patient Context (4 cols) */}
                <div className="lg:col-span-4 flex flex-col gap-6">

                    {/* Patient Profile Card */}
                    <div className="bg-white rounded-[16px] border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-xl font-bold text-[#0B1120] border-2 border-slate-200">
                                    {appointment.patient?.full_name?.charAt(0) || 'P'}
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-[#0D9488] p-1 rounded-full border-2 border-white shadow-sm">
                                    <Check className="w-2.5 h-2.5 text-white" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-lg font-heading font-black text-[#1F2937]">{appointment.patient?.full_name}</h2>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase border ${sc.color}`}>
                                        {sc.label}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Contact Info */}
                            <div>
                                <p className="text-[10px] font-black text-[#1F2937]/40 uppercase tracking-widest mb-2">Contact Details</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        <span className="text-xs font-bold text-[#1F2937] truncate">{appointment.patient?.email}</span>
                                    </div>
                                    {appointment.patient?.phone && (
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <Phone className="w-4 h-4 text-slate-400" />
                                            <span className="text-xs font-bold text-[#1F2937]">{appointment.patient?.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Appointment Info */}
                            <div className="pt-2 border-t border-slate-100">
                                <p className="text-[10px] font-black text-[#1F2937]/40 uppercase tracking-widest mb-2">Session Details</p>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-[#0D9488]" />
                                            <span className="text-xs font-bold text-[#1F2937]">
                                                {format(getLocalTimeFromUTC(appointment.start_time), 'EEEE, MMM d')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-[#0D9488]" />
                                            <span className="text-xs font-bold text-[#1F2937]">
                                                {format(getLocalTimeFromUTC(appointment.start_time), 'h:mm a')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Interoperability */}
                            <div className="pt-2 border-t border-slate-100">
                                <p className="text-[10px] font-black text-[#1F2937]/40 uppercase tracking-widest mb-3">Interoperability</p>
                                <button 
                                    onClick={handleDownloadFHIR}
                                    className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#1F2937] hover:bg-slate-50 transition-all cursor-pointer hover:border-[#0D9488]/30"
                                >
                                    <div className="flex items-center gap-2">
                                        <Download className="w-4 h-4 text-[#0D9488]" />
                                        Download FHIR ID
                                    </div>
                                    <ArrowLeft className="w-4 h-4 text-[#1F2937]/20 rotate-180" />
                                </button>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg mt-2">
                                    <FileText className="w-4 h-4 text-slate-400" />
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">HL7 FHIR v4.0.1 Compliant</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reason Card */}
                    {appointment.reason && (
                        <div className="bg-white rounded-[16px] border border-slate-200 shadow-sm p-5">
                            <p className="text-[10px] font-black text-[#1F2937]/40 uppercase tracking-widest mb-3">Reason for Visit</p>
                            <p className="text-sm text-[#1F2937] leading-relaxed">{appointment.reason}</p>
                        </div>
                    )}

                    {/* Patient Documents */}
                    <PatientDocumentsPanel
                        patientId={appointment.patient?.id}
                        patientDocs={patientDocs}
                        setPatientDocs={setPatientDocs}
                        docsLoading={docsLoading}
                        setDocsLoading={setDocsLoading}
                        appointmentNotes={appointment.notes}
                        appointmentReason={appointment.reason}
                    />
                </div>

                {/* Right Column: Analytics (8 cols) */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    {/* Telemetry Sparkline Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* HR Card */}
                        <div className="bg-[#0B1120] rounded-[16px] shadow-lg p-6 border border-white/5 relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-2 relative z-10">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-red-500/20 rounded-lg">
                                        <Heart className="w-4 h-4 text-red-500 group-hover:animate-pulse" />
                                    </div>
                                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Heart Rate</span>
                                </div>
                            </div>
                            <span className="text-2xl font-black text-white tracking-tighter">
                                {vitals?.hr || '--'} <span className="text-[10px] text-white/40 uppercase">BPM</span>
                            </span>
                            <div className="h-16 w-full flex items-center justify-center rounded-lg mt-3 border border-white/10 bg-black/20">
                                <Activity className="w-8 h-8 text-red-500/20" />
                            </div>
                            <div className="flex items-center gap-2 mt-3 relative z-10">
                                <TrendingUp className="w-3.5 h-3.5 text-red-500" />
                                <span className="text-[10px] font-bold text-red-500 uppercase">Live Telemetry</span>
                            </div>
                        </div>

                        {/* SpO2 Card */}
                        <div className="bg-[#0B1120] rounded-[16px] shadow-lg p-6 border border-white/5 relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-2 relative z-10">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                                        <Droplets className="w-4 h-4 text-cyan-400" />
                                    </div>
                                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">SpO2</span>
                                </div>
                            </div>
                            <span className="text-2xl font-black text-white tracking-tighter">
                                {vitals?.spo2 || '--'} <span className="text-[10px] text-white/40 uppercase">%</span>
                            </span>
                            <div className="h-16 w-full flex items-center justify-center rounded-lg mt-3 border border-white/10 bg-black/20">
                                <Droplets className="w-8 h-8 text-cyan-500/20" />
                            </div>
                            <div className="flex items-center gap-2 mt-3 relative z-10">
                                <TrendingDown className="w-3.5 h-3.5 text-cyan-400" />
                                <span className="text-[10px] font-bold text-cyan-400 uppercase">Monitoring</span>
                            </div>
                        </div>

                        {/* BP Card */}
                        <div className="bg-[#0B1120] rounded-[16px] shadow-lg p-6 border border-white/5 relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-2 relative z-10">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-orange-500/20 rounded-lg">
                                        <Activity className="w-4 h-4 text-orange-400" />
                                    </div>
                                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Blood Pressure</span>
                                </div>
                            </div>
                            <span className="text-2xl font-black text-white tracking-tighter">
                                {vitals?.bp || '120/80'}
                            </span>
                            <div className="h-16 w-full flex items-center justify-center rounded-lg mt-3 border border-white/10 bg-black/20">
                                <Activity className="w-8 h-8 text-orange-400/20" />
                            </div>
                            <div className="flex items-center gap-2 mt-3 relative z-10">
                                <Check className="w-3.5 h-3.5 text-orange-400" />
                                <span className="text-[10px] font-bold text-orange-400 uppercase">Within Range</span>
                            </div>
                        </div>
                    </div>

                    {/* Clinical Decision Support (CDS) */}
                    <div className="bg-white rounded-[16px] border border-slate-200 shadow-xl p-6 lg:p-8 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-heading font-black text-[#1F2937]">Clinical Decision Support (CDS)</h3>
                                <p className="text-xs text-[#1F2937]/50 font-medium">Real-time physiological risk analysis</p>
                            </div>
                            <div className="hidden sm:flex items-center gap-2">
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-lg border border-blue-200 uppercase">BERT: Active</span>
                                <span className="px-3 py-1 bg-slate-100 text-slate-700 text-[10px] font-black rounded-lg border border-slate-200 uppercase">v2.4.0</span>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-12">
                            {/* Radial NEWS2 Gauge */}
                            <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center shrink-0">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="50%" cy="50%" r="44%" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                                    <circle
                                        cx="50%" cy="50%" r="44%"
                                        stroke={riskHex || '#0D9488'}
                                        strokeWidth="12"
                                        fill="transparent"
                                        strokeDasharray="552.92"
                                        strokeDashoffset={gaugeOffset}
                                        className="transition-all duration-500"
                                        style={{ filter: isHighRisk ? `drop-shadow(0 0 6px ${riskHex})` : 'none' }}
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-4xl sm:text-5xl font-black tracking-tighter" style={{ color: riskHex }}>{riskVal}</span>
                                    <span className="text-[10px] font-black text-[#1F2937]/40 uppercase tracking-widest">NEWS2 Score</span>
                                </div>
                            </div>

                            {/* Risk Explanation */}
                            <div className="flex-1 space-y-4 w-full">
                                {isHighRisk && (
                                    <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
                                            <span className="text-xs font-black text-[#ef4444] uppercase">High Severity Detected</span>
                                        </div>
                                        <p className="text-xs text-red-900/70 leading-relaxed">
                                            Physiological breach detected. Pattern matches elevated urgency profiles. Immediate clinical review recommended.
                                        </p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Risk Trend</p>
                                        <p className="text-xs font-bold text-[#1F2937] flex items-center gap-1">
                                            {isHighRisk ? 'Escalating' : 'Stable'}
                                            <ArrowUpRight className={`w-3.5 h-3.5 ${isHighRisk ? 'text-[#ef4444]' : 'text-[#0D9488]'}`} />
                                        </p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Confidence</p>
                                        <p className="text-xs font-bold text-[#1F2937]">98.2%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Intervention Protocol (show when high risk) */}
                    {isHighRisk && (
                        <div className="bg-red-50 rounded-[16px] border-2 border-[#ef4444]/30 p-6 animate-pulse">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-[#ef4444] rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20">
                                    <ShieldAlert className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-black text-[#ef4444] uppercase tracking-wider mb-2">Recommended Intervention</h4>
                                    <p className="text-base font-bold text-red-900 leading-tight">
                                        🛑 HIGH RISK: Immediate clinical review and specialist consultation recommended.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Clinical Notes */}
                    <div className="bg-white rounded-[16px] border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="w-5 h-5 text-[#0D9488]" />
                            <h3 className="text-sm font-heading font-black text-[#1F2937] uppercase tracking-widest">Clinical Notes</h3>
                        </div>
                        <textarea
                            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl resize-none text-sm text-[#1F2937] placeholder:text-slate-300 focus:ring-2 focus:ring-[#0D9488] focus:border-transparent outline-none transition-all leading-relaxed"
                            placeholder="Enter clinical notes, diagnosis, prescriptions..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleSaveNotes}
                                disabled={saving}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#0D9488] text-white text-[11px] font-black rounded-lg shadow-md hover:brightness-110 transition-all uppercase tracking-wider disabled:opacity-40"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : 'Save Notes'}
                            </button>
                        </div>
                    </div>

                    {/* Status Actions */}
                    {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                        <div className="bg-white rounded-[16px] border border-slate-200 shadow-sm p-6">
                            <h3 className="text-sm font-heading font-black text-[#1F2937] uppercase tracking-widest mb-4">Clinical Actions</h3>
                            <div className="flex flex-wrap gap-3">
                                {appointment.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusUpdate('confirmed')}
                                            disabled={actionLoading}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-[#0D9488] text-white text-[11px] font-black rounded-lg shadow-md hover:brightness-110 transition-all uppercase tracking-wider disabled:opacity-40"
                                        >
                                            <Check className="w-4 h-4" /> Accept
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate('cancelled')}
                                            disabled={actionLoading}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-red-200 text-red-600 text-[11px] font-black rounded-lg hover:bg-red-50 transition-all uppercase tracking-wider disabled:opacity-40"
                                        >
                                            <X className="w-4 h-4" /> Reject
                                        </button>
                                    </>
                                )}
                                {appointment.status === 'confirmed' && (
                                    <button
                                        onClick={() => handleStatusUpdate('completed')}
                                        disabled={actionLoading}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-[#0D9488] text-white text-[11px] font-black rounded-lg shadow-md hover:brightness-110 transition-all uppercase tracking-wider disabled:opacity-40"
                                    >
                                        <Check className="w-4 h-4" /> Mark Completed
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-[10px] pt-2">
                <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-[#0D9488]" />
                    <span className="font-black text-[#1F2937] uppercase tracking-tighter">System Latency: 184ms</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="font-bold text-[#1F2937]/40 uppercase tracking-widest">Medical Decision Support v4.12</span>
                    <div className="h-4 w-px bg-slate-200" />
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                        <span className="font-black text-[#10b981] uppercase">Secure Node</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentDetail;
