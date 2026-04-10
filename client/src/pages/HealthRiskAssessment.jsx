/**
 * Health Risk Assessment Page
 *
 * Collects patient vitals and sends them to the FastAPI ML microservice
 * to predict cardiovascular risk.  Results are saved to Supabase and
 * high-risk patients are auto-routed to booking with a pre-selected department.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, Activity, AlertCircle, CheckCircle,
    ArrowRight, RotateCcw, Loader2, ShieldCheck,
    Thermometer, Ruler, Weight, Cigarette, Wine,
    Dumbbell,
} from 'lucide-react';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import PageLayout from '@/components/layout/PageLayout';

const ML_API = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000';

const Field = ({ label, icon: Icon, children }) => (
    <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            {Icon && <Icon className="w-4 h-4 text-gray-400" />}
            {label}
        </label>
        {children}
    </div>
);

export default function HealthRiskAssessment() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        age: '',
        gender: 'M',
        height: '',
        weight: '',
        systolic_bp: '',
        diastolic_bp: '',
        cholesterol: '1',
        glucose: '1',
        smoking: false,
        alcohol: false,
        physical_activity: true,
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const set = (key) => (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData((prev) => ({ ...prev, [key]: val }));
    };

    // ------- submit -------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = {
            ...formData,
            age: parseInt(formData.age),
            height: parseFloat(formData.height),
            weight: parseFloat(formData.weight),
            systolic_bp: parseInt(formData.systolic_bp),
            diastolic_bp: parseInt(formData.diastolic_bp),
            cholesterol: parseInt(formData.cholesterol),
            glucose: parseInt(formData.glucose),
        };

        try {
            const res = await fetch(`${ML_API}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Prediction service error');
            const data = await res.json();
            setResult(data);

            // Persist to Supabase
            if (user) {
                await supabase.from('health_assessments').insert({
                    patient_id: user.id,
                    risk_score: data.risk_score,
                    risk_level: data.risk_level,
                    assessment_data: payload,
                    recommendations: data.recommendations,
                    bmi: data.bmi,
                });
            }

            // Auto-redirect high-risk after 6 s
            if (data.risk_level === 'high') {
                setTimeout(() => {
                    navigate('/book', {
                        state: { department: data.recommended_department, fromRisk: true },
                    });
                }, 6000);
            }
        } catch (err) {
            console.error('Prediction failed:', err);
            setError(
                'Could not reach the prediction service. Make sure the ML server is running on port 8000.'
            );
        } finally {
            setLoading(false);
        }
    };

    // ------- risk colour helpers -------
    const riskBg = {
        high: 'from-red-500/10 to-red-600/5 border-red-300',
        moderate: 'from-amber-500/10 to-amber-600/5 border-amber-300',
        low: 'from-emerald-500/10 to-emerald-600/5 border-emerald-300',
    };
    const riskIcon = {
        high: <AlertCircle className="w-10 h-10 text-red-500" />,
        moderate: <Activity className="w-10 h-10 text-amber-500" />,
        low: <CheckCircle className="w-10 h-10 text-emerald-500" />,
    };
    const riskBadge = {
        high: 'destructive',
        moderate: 'warning',
        low: 'success',
    };

    // ------- form input helper -------

    const inputCls =
        'w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white';

    // =====================================================================
    return (
        <PageLayout title="Health Risk Assessment" showSidebar>
            <div className="max-w-3xl mx-auto">
                {/* ---- Header ---- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2 animate-slide-up">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-lg">
                            <Heart className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Health Risk Assessment
                            </h1>
                            <p className="text-gray-500 text-sm mt-0.5">
                                AI-powered cardiovascular risk prediction
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* ---- Error ---- */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6"
                        >
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
                                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                                {error}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ---- Form / Results ---- */}
                <AnimatePresence mode="wait">
                    {!result ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <Card className="overflow-hidden">
                                <div className="h-1.5 bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500" />
                                <CardContent className="p-6 sm:p-8">
                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        {/* --- Personal --- */}
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <ShieldCheck className="w-5 h-5 text-primary" />
                                                Personal Information
                                            </h2>
                                            <div className="grid sm:grid-cols-2 gap-5">
                                                <Field label="Age (years)" icon={Thermometer}>
                                                    <input
                                                        type="number" required min="1" max="120"
                                                        value={formData.age} onChange={set('age')}
                                                        className={inputCls} placeholder="e.g. 45"
                                                    />
                                                </Field>
                                                <Field label="Gender">
                                                    <select value={formData.gender} onChange={set('gender')} className={inputCls}>
                                                        <option value="M">Male</option>
                                                        <option value="F">Female</option>
                                                    </select>
                                                </Field>
                                                <Field label="Height (cm)" icon={Ruler}>
                                                    <input
                                                        type="number" required step="0.1" min="50" max="250"
                                                        value={formData.height} onChange={set('height')}
                                                        className={inputCls} placeholder="e.g. 170"
                                                    />
                                                </Field>
                                                <Field label="Weight (kg)" icon={Weight}>
                                                    <input
                                                        type="number" required step="0.1" min="20" max="300"
                                                        value={formData.weight} onChange={set('weight')}
                                                        className={inputCls} placeholder="e.g. 75"
                                                    />
                                                </Field>
                                            </div>
                                        </div>

                                        {/* --- Vitals --- */}
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <Activity className="w-5 h-5 text-primary" />
                                                Vitals &amp; Lab Values
                                            </h2>
                                            <div className="grid sm:grid-cols-2 gap-5">
                                                <Field label="Systolic BP (mm Hg)">
                                                    <input
                                                        type="number" required min="60" max="250"
                                                        value={formData.systolic_bp} onChange={set('systolic_bp')}
                                                        className={inputCls} placeholder="e.g. 130"
                                                    />
                                                </Field>
                                                <Field label="Diastolic BP (mm Hg)">
                                                    <input
                                                        type="number" required min="40" max="160"
                                                        value={formData.diastolic_bp} onChange={set('diastolic_bp')}
                                                        className={inputCls} placeholder="e.g. 85"
                                                    />
                                                </Field>
                                                <Field label="Cholesterol Level">
                                                    <select value={formData.cholesterol} onChange={set('cholesterol')} className={inputCls}>
                                                        <option value="1">Normal</option>
                                                        <option value="2">Above Normal</option>
                                                        <option value="3">Well Above Normal</option>
                                                    </select>
                                                </Field>
                                                <Field label="Glucose Level">
                                                    <select value={formData.glucose} onChange={set('glucose')} className={inputCls}>
                                                        <option value="1">Normal</option>
                                                        <option value="2">Above Normal</option>
                                                        <option value="3">Well Above Normal</option>
                                                    </select>
                                                </Field>
                                            </div>
                                        </div>

                                        {/* --- Lifestyle --- */}
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <Dumbbell className="w-5 h-5 text-primary" />
                                                Lifestyle Factors
                                            </h2>
                                            <div className="grid sm:grid-cols-3 gap-5">
                                                {[
                                                    { key: 'smoking', label: 'Smoking', icon: Cigarette },
                                                    { key: 'alcohol', label: 'Alcohol Use', icon: Wine },
                                                    { key: 'physical_activity', label: 'Physically Active', icon: Dumbbell },
                                                ].map(({ key, label, icon: I }) => (
                                                    <label
                                                        key={key}
                                                        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                                                            formData[key]
                                                                ? 'border-primary bg-primary/5 shadow-sm'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={formData[key]}
                                                            onChange={set(key)}
                                                            className="w-5 h-5 text-primary rounded"
                                                        />
                                                        <I className="w-5 h-5 text-gray-500" />
                                                        <span className="text-sm font-medium text-gray-700">{label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* --- Submit --- */}
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-3 rounded-xl text-base font-semibold"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                    Analysing your data…
                                                </>
                                            ) : (
                                                <>
                                                    <Heart className="w-5 h-5 mr-2" />
                                                    Assess My Risk
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        /* ================= Results ================= */
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            {/* Risk card */}
                            <Card className={`overflow-hidden border bg-gradient-to-br ${riskBg[result.risk_level]}`}>
                                <CardContent className="p-6 sm:p-8">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="shrink-0">
                                            {riskIcon[result.risk_level]}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h2 className="text-2xl font-bold capitalize text-gray-900">
                                                    {result.risk_level} Risk
                                                </h2>
                                                <Badge variant={riskBadge[result.risk_level]}>
                                                    {result.risk_score}%
                                                </Badge>
                                            </div>
                                            <p className="text-gray-600">{result.message}</p>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                                        <div className="bg-white/80 rounded-xl p-4 text-center">
                                            <p className="text-2xl font-bold text-gray-900">{result.risk_score}%</p>
                                            <p className="text-xs text-gray-500 mt-1">Risk Score</p>
                                        </div>
                                        <div className="bg-white/80 rounded-xl p-4 text-center">
                                            <p className="text-2xl font-bold text-gray-900">{result.bmi}</p>
                                            <p className="text-xs text-gray-500 mt-1">BMI</p>
                                        </div>
                                        {result.recommended_department && (
                                            <div className="bg-white/80 rounded-xl p-4 text-center col-span-2 sm:col-span-1">
                                                <p className="text-lg font-bold text-primary">{result.recommended_department}</p>
                                                <p className="text-xs text-gray-500 mt-1">Recommended Dept</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Recommendations */}
                                    <div className="bg-white/70 rounded-xl p-5">
                                        <h3 className="font-semibold text-gray-800 mb-3">Personalised Recommendations</h3>
                                        <ul className="space-y-2">
                                            {result.recommendations.map((rec, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                                    <span className="text-primary font-bold mt-0.5">•</span>
                                                    {rec}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* High-risk auto-redirect notice */}
                            {result.risk_level === 'high' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-800"
                                >
                                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                                    Redirecting you to book a {result.recommended_department} appointment in a few seconds…
                                </motion.div>
                            )}

                            {/* Action buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    onClick={() =>
                                        navigate('/book', {
                                            state: { department: result.recommended_department },
                                        })
                                    }
                                    className="flex-1"
                                >
                                    Book Appointment
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => { setResult(null); setError(null); }}
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Retake Assessment
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PageLayout>
    );
}
