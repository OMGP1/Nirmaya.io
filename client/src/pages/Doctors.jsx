/**
 * Specialists Listing Page — Niramaya.io
 * 
 * Replaces the old Doctor listing with Niramaya clinical styling.
 */
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import PatientSidebar from '@/components/layout/PatientSidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getDoctors } from '@/services/doctors';
import { getDepartments } from '@/services/departments';
import { Spinner } from '@/components/ui';
import { Search, Star, Clock, Calendar, Shield, Activity, User, Building } from 'lucide-react';

const Doctors = () => {
    const { isAuthenticated, profile } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [search, setSearch] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState(
        searchParams.get('department') || ''
    );

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [doctorsData, deptsData] = await Promise.all([
                    getDoctors({ departmentId: departmentFilter || undefined }),
                    getDepartments(),
                ]);
                setDoctors(doctorsData);
                setDepartments(deptsData);
            } catch (err) {
                setError('Failed to load specialists. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [departmentFilter]);

    const filteredDoctors = search
        ? doctors.filter(
            (doc) =>
                doc.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                doc.specialization?.toLowerCase().includes(search.toLowerCase())
        )
        : doctors;

    const inputClasses = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-[#1A2B48] placeholder:text-slate-400 focus:ring-2 focus:ring-[#008080] focus:border-transparent outline-none transition-all";

    const isPatient = profile?.role === 'patient';
    const showSidebar = isAuthenticated && isPatient;

    const content = (
        <div className="flex-1 flex flex-col h-screen relative overflow-y-auto">
            {/* Header / Banner */}
            <div className={`bg-white border-b border-slate-200 px-6 py-8 sm:px-12 flex flex-col space-y-2 ${showSidebar ? 'pt-20 lg:pt-8' : ''}`}>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-[#008080]/10 rounded-xl flex items-center justify-center">
                        <User className="w-5 h-5 text-[#008080]" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008080] opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#008080]" />
                        </span>
                        <span className="text-xs font-bold text-[#008080] uppercase tracking-wider">Verified Network</span>
                    </div>
                </div>
                <h1 className="text-3xl font-heading font-black text-[#1A2B48]">
                    Find a Specialist
                </h1>
                <p className="text-sm text-slate-500 max-w-2xl">
                    Browse our network of qualified healthcare professionals, view their clinical credentials, and book an appointment instantly.
                </p>
            </div>

            <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 flex-1">
                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or specialization..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`${inputClasses} pl-12`}
                        />
                    </div>
                    <div className="md:w-72 relative">
                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <select
                            value={departmentFilter}
                            onChange={(e) => {
                                const val = e.target.value;
                                setDepartmentFilter(val);
                                if (val) {
                                    setSearchParams({ department: val });
                                } else {
                                    setSearchParams({});
                                }
                            }}
                            className={`${inputClasses} pl-12 appearance-none cursor-pointer`}
                        >
                            <option value="">All Departments</option>
                            {departments.map((d) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-red-600 flex items-center justify-between">
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="hover:text-red-800">Dismiss</button>
                    </div>
                )}

                {/* Doctor Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Spinner size="lg" />
                    </div>
                ) : filteredDoctors.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center text-slate-400">
                        <Search className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                        <p className="font-bold text-[#1A2B48] text-lg">No specialists found</p>
                        <p className="text-sm mt-1">Try adjusting your search filters or browse all departments.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredDoctors.map((doctor) => (
                            <div key={doctor.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all p-6 group flex flex-col">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center font-heading font-black text-xl text-[#008080] border border-slate-200 shrink-0">
                                        {doctor.user?.full_name?.charAt(0) || 'D'}
                                    </div>
                                    <div className="flex-1 min-w-0 pt-1">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Shield className="w-3.5 h-3.5 text-[#008080]" />
                                            <span className="text-[10px] font-bold text-[#008080] uppercase tracking-wider">Certified</span>
                                        </div>
                                        <h3 className="font-heading font-black text-lg text-[#1A2B48] truncate">
                                            Dr. {doctor.user?.full_name}
                                        </h3>
                                        <p className="text-sm font-medium text-slate-500 truncate">
                                            {doctor.specialization}
                                        </p>
                                        <p className="text-xs font-bold text-[#008080] mt-0.5 truncate">
                                            {doctor.department?.name}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-6 mt-auto">
                                    {doctor.experience_years && (
                                        <div className="bg-slate-50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                                            <Clock className="w-4 h-4 text-slate-400 mb-1" />
                                            <span className="text-sm font-bold text-[#1A2B48]">{doctor.experience_years}y</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Experience</span>
                                        </div>
                                    )}
                                    {doctor.average_rating && (
                                        <div className="bg-amber-50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                                            <Star className="w-4 h-4 text-amber-500 mb-1" />
                                            <span className="text-sm font-bold text-amber-700">{doctor.average_rating.toFixed(1)}</span>
                                            <span className="text-[10px] font-bold text-amber-600/70 uppercase">Rating</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-auto">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Consultation Fee</span>
                                        {doctor.consultation_fee ? (
                                            <p className="font-heading font-black text-lg text-[#1A2B48]">
                                                ₹{doctor.consultation_fee}
                                            </p>
                                        ) : (
                                            <p className="font-heading font-black text-sm text-[#1A2B48]">Standard</p>
                                        )}
                                    </div>
                                    <Link
                                        to={`/book?doctorId=${doctor.id}`}
                                        className="px-5 py-2.5 bg-[#008080] text-white text-sm font-bold rounded-xl shadow-sm hover:brightness-110 hover:-translate-y-0.5 transition-all flex items-center gap-2 group-hover:shadow-[0_4px_12px_rgba(0,128,128,0.3)]"
                                    >
                                        <Calendar className="w-4 h-4" /> Book
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* If not logged in, we also want a standard footer at the bottom of the page content */}
            {!showSidebar && <Footer />}
        </div>
    );

    // If unauthenticated or a different role, wrap in standard App layout with top Header
    // If logged in patient, wrap in row with PatientSidebar
    return (
        <div className={`h-screen overflow-hidden w-full bg-slate-50 flex ${showSidebar ? 'flex-row' : 'flex-col'}`}>
            {showSidebar ? (
                <PatientSidebar />
            ) : (
                <Header />
            )}
            {content}
        </div>
    );
};

export default Doctors;
