/**
 * Patient Vitals Dashboard
 *
 * Displays longitudinal health data from past risk assessments,
 * including Blood Pressure trends and Cardiovascular Risk trends
 * via Recharts line charts.
 */
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import {
    Heart, Activity, TrendingUp, TrendingDown,
    Calendar, AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, Spinner, Badge } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import PageLayout from '@/components/layout/PageLayout';

export default function PatientVitals() {
    const { user } = useAuth();
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            if (!user) return;
            const { data } = await supabase
                .from('health_assessments')
                .select('*')
                .eq('patient_id', user.id)
                .order('created_at', { ascending: true });

            setAssessments(data || []);
            setLoading(false);
        };
        fetch();
    }, [user]);

    // Transform for charts
    const chartData = assessments.map((a) => ({
        date: format(new Date(a.created_at), 'MMM dd'),
        fullDate: format(new Date(a.created_at), 'MMM d, yyyy h:mm a'),
        systolic: a.assessment_data?.systolic_bp,
        diastolic: a.assessment_data?.diastolic_bp,
        risk: Number(a.risk_score),
        bmi: Number(a.bmi),
    }));

    const latest = assessments.length > 0 ? assessments[assessments.length - 1] : null;
    const prev = assessments.length > 1 ? assessments[assessments.length - 2] : null;
    const riskTrend = latest && prev ? Number(latest.risk_score) - Number(prev.risk_score) : 0;

    // Stat cards
    const stats = latest
        ? [
            {
                label: 'Latest Risk Score',
                value: `${Number(latest.risk_score).toFixed(0)}%`,
                icon: Heart,
                color:
                    latest.risk_level === 'high'
                        ? 'text-red-500'
                        : latest.risk_level === 'moderate'
                            ? 'text-amber-500'
                            : 'text-emerald-500',
                bg:
                    latest.risk_level === 'high'
                        ? 'bg-red-50'
                        : latest.risk_level === 'moderate'
                            ? 'bg-amber-50'
                            : 'bg-emerald-50',
            },
            {
                label: 'Blood Pressure',
                value: `${latest.assessment_data?.systolic_bp}/${latest.assessment_data?.diastolic_bp}`,
                icon: Activity,
                color: 'text-blue-500',
                bg: 'bg-blue-50',
            },
            {
                label: 'BMI',
                value: Number(latest.bmi).toFixed(1),
                icon: TrendingUp,
                color: 'text-purple-500',
                bg: 'bg-purple-50',
            },
            {
                label: 'Assessments',
                value: assessments.length,
                icon: Calendar,
                color: 'text-indigo-500',
                bg: 'bg-indigo-50',
            },
        ]
        : [];

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="bg-white/95 backdrop-blur border rounded-xl p-3 shadow-lg text-sm">
                <p className="font-semibold text-gray-800 mb-1">{payload[0]?.payload?.fullDate || label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.stroke || p.color }} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: p.stroke || p.color }} />
                        {p.name}: <span className="font-semibold">{p.value}</span>
                    </p>
                ))}
            </div>
        );
    };

    return (
        <PageLayout title="My Health Trends" showSidebar>
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-3 animate-slide-up">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg">
                        <TrendingUp className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Health Trends</h1>
                        <p className="text-gray-500 text-sm">Track your vitals over time</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Spinner size="lg" />
                    </div>
                ) : assessments.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="p-12 text-center">
                            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">No health data yet</h2>
                            <p className="text-gray-500 mb-6">
                                Complete your first Risk Assessment to start tracking your health trends.
                            </p>
                            <a
                                href="/risk-assessment"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                            >
                                <Heart className="w-5 h-5" />
                                Take Risk Assessment
                            </a>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Stat cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {stats.map((s, i) => (
                                <Card key={i} className="animate-jelly-pop" style={{ animationDelay: `${i * 80}ms` }}>
                                    <CardContent className="p-4 sm:p-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                                                <s.icon className={`w-5 h-5 ${s.color}`} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xl font-bold text-gray-900 truncate">{s.value}</p>
                                                <p className="text-xs text-gray-500 truncate">{s.label}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Risk trend badge */}
                        {prev && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                {riskTrend > 0 ? (
                                    <Badge variant="destructive" className="gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        +{riskTrend.toFixed(1)}% since last
                                    </Badge>
                                ) : riskTrend < 0 ? (
                                    <Badge variant="success" className="gap-1">
                                        <TrendingDown className="w-3 h-3" />
                                        {riskTrend.toFixed(1)}% since last
                                    </Badge>
                                ) : (
                                    <Badge className="gap-1">No change since last</Badge>
                                )}
                            </div>
                        )}

                        {/* Charts */}
                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Blood Pressure Chart */}
                            <Card>
                                <CardContent className="p-5">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-blue-500" />
                                        Blood Pressure
                                    </h2>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 12 }} domain={[50, 200]} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Line
                                                type="monotone" dataKey="systolic"
                                                stroke="#ef4444" strokeWidth={2.5}
                                                dot={{ r: 4, fill: '#ef4444' }}
                                                name="Systolic"
                                            />
                                            <Line
                                                type="monotone" dataKey="diastolic"
                                                stroke="#3b82f6" strokeWidth={2.5}
                                                dot={{ r: 4, fill: '#3b82f6' }}
                                                name="Diastolic"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                    <div className="flex items-center justify-center gap-6 mt-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <span className="w-3 h-0.5 bg-red-500 rounded" /> Systolic
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="w-3 h-0.5 bg-blue-500 rounded" /> Diastolic
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Risk Score Trend */}
                            <Card>
                                <CardContent className="p-5">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <Heart className="w-5 h-5 text-red-500" />
                                        Cardiovascular Risk
                                    </h2>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area
                                                type="monotone" dataKey="risk"
                                                stroke="#f59e0b" strokeWidth={2.5}
                                                fill="url(#riskGrad)"
                                                dot={{ r: 4, fill: '#f59e0b' }}
                                                name="Risk %"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Assessment History */}
                        <Card>
                            <CardContent className="p-5">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">Assessment History</h2>
                                <div className="space-y-3">
                                    {[...assessments].reverse().map((a, i) => (
                                        <div
                                            key={a.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${
                                                    a.risk_level === 'high' ? 'bg-red-500'
                                                        : a.risk_level === 'moderate' ? 'bg-amber-500'
                                                            : 'bg-emerald-500'
                                                }`} />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {format(new Date(a.created_at), 'MMM d, yyyy — h:mm a')}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        BP: {a.assessment_data?.systolic_bp}/{a.assessment_data?.diastolic_bp} · BMI: {Number(a.bmi).toFixed(1)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant={
                                                a.risk_level === 'high' ? 'destructive'
                                                    : a.risk_level === 'moderate' ? 'warning'
                                                        : 'success'
                                            }>
                                                {Number(a.risk_score).toFixed(0)}%
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </PageLayout>
    );
}
