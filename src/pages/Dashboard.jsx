import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';
import {
    Users,
    BookOpen,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    Clock,
    GraduationCap,
    Shield,
    ArrowRight
} from 'lucide-react';


const StatCard = ({ title, value, icon: Icon, color, trend, index }) => (
    <div className={`academic-card p-10 relative overflow-hidden group animate-slide-up`} style={{ animationDelay: `${index * 100}ms` }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 group-hover:bg-primary-100 transition-colors duration-500"></div>
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
                <div className={`p-4 rounded-[1.25rem] ${color} shadow-lg ring-4 ring-white`}>
                    <Icon className="w-7 h-7" />
                </div>
                {trend && (
                    <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100/50">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">{trend}</span>
                    </div>
                )}
            </div>
            <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-2 ml-1">{title}</p>
            <h3 className="text-4xl font-black text-primary-950 tracking-tighter font-heading">{value}</h3>
        </div>
    </div>
);

const Dashboard = () => {
    const { profile } = useAuth();
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalCourses: 0,
        activeEnrollments: 0,
        deptStats: {},
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                if (profile?.role === 'admin') {
                    const { data: adminStats, error } = await supabase.rpc('get_admin_stats');
                    if (error) throw error;

                    const { data: activity } = await supabase
                        .from('audit_logs')
                        .select('*, profiles:actor_id(full_name)')
                        .order('created_at', { ascending: false })
                        .limit(5);

                    setStats({
                        totalStudents: adminStats.total_students,
                        totalCourses: Object.keys(adminStats.enrollments_per_course || {}).length,
                        activeEnrollments: Object.values(adminStats.enrollments_per_course || {}).reduce((a, b) => a + b, 0),
                        deptStats: adminStats.students_per_department || {},
                        recentActivity: activity || []
                    });
                } else if (profile?.role === 'staff') {
                    const [studentsRes, enrollmentsRes] = await Promise.all([
                        supabase.from('students').select('*', { count: 'exact', head: true }).is('deleted_at', null),
                        supabase.from('student_courses').select('*', { count: 'exact', head: true })
                    ]);
                    setStats(prev => ({
                        ...prev,
                        totalStudents: studentsRes.count || 0,
                        activeEnrollments: enrollmentsRes.count || 0,
                    }));
                }
            } catch (err) {
                console.error('Error fetching stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [profile]);

    if (loading) {
        return (
            <div className="space-y-12 animate-pulse">
                <div className="h-16 bg-gray-100 rounded-3xl w-1/3 mb-10"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {[1, 2, 3].map(i => <div key={i} className="h-56 bg-white rounded-[2rem] border border-gray-100 shadow-sm"></div>)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="h-[500px] bg-white rounded-[2rem] border border-gray-100 shadow-sm"></div>
                    <div className="h-[500px] bg-white rounded-[2rem] border border-gray-100 shadow-sm"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-14">
            {/* Elegant Branding Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-primary-100/50">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="w-12 h-1 bg-accent-500 rounded-full"></span>
                        <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em]">Official Command Center</p>
                    </div>
                    <h1 className="text-5xl font-black text-primary-950 tracking-tighter italic font-heading">
                        Welcome, <span className="text-primary-600">{profile?.full_name?.split(' ')[0]}</span>
                    </h1>
                </div>
            </div>

            {/* Premium Stat Cards */}
            {(profile?.role === 'admin' || profile?.role === 'staff') && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <StatCard
                        index={0}
                        title="Registered Students"
                        value={stats.totalStudents}
                        icon={Users}
                        color="bg-primary-600 text-white shadow-primary-600/40"
                        trend="+12% Gain"
                    />
                    <StatCard
                        index={1}
                        title="Curriculum Courses"
                        value={stats.totalCourses}
                        icon={BookOpen}
                        color="bg-secondary-500 text-white shadow-secondary-500/40"
                    />
                    <StatCard
                        index={2}
                        title="Portal Enrollments"
                        value={stats.activeEnrollments}
                        icon={CheckCircle}
                        color="bg-primary-950 text-white shadow-primary-950/40"
                    />
                </div>
            )}

            {/* Student Specific View */}
            {profile?.role === 'student' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-slide-up">
                    <div className="academic-card p-12 text-center group">
                        <div className="w-28 h-28 bg-primary-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-white group-hover:bg-primary-600 group-hover:scale-110 transition-all duration-500">
                            <GraduationCap className="w-14 h-14 text-primary-600 group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-3xl font-black text-primary-950 uppercase tracking-tighter mb-4 font-heading">Academic Command</h3>
                        <p className="text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">Secure access to your official registry records, course registration, and semester performance.</p>
                        <Link to="/courses" className="btn-primary mt-10">Launch Course Hub</Link>
                    </div>
                    <div className="academic-card p-12 flex flex-col items-center justify-center group overflow-hidden relative">
                        <div className="absolute inset-0 bg-accent-500/0 group-hover:bg-accent-500/[0.02] transition-colors duration-700"></div>
                        <Clock className="w-16 h-16 text-accent-500 mb-8 animate-pulse relative z-10" />
                        <h3 className="text-2xl font-black text-primary-950 uppercase tracking-tighter mb-4 font-heading relative z-10">Examination Protocol</h3>
                        <div className="bg-primary-950 text-white px-6 py-3 rounded-2xl relative z-10 shadow-2xl shadow-primary-950/40">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary-400 mb-1">Upcoming Assessment</p>
                            <p className="text-sm font-bold">Thermodynamics (MCE 201)</p>
                        </div>
                        <p className="text-[11px] font-black text-primary-400 mt-6 uppercase tracking-[0.3em] relative z-10">Commences: 16th February 2026</p>
                    </div>
                </div>
            )}

            {/* High Fidelity Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {(profile?.role === 'admin' && stats.deptStats) && (
                    <div className="academic-card p-12 animate-slide-up" style={{ animationDelay: '300ms' }}>
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h3 className="text-2xl font-black text-primary-950 uppercase tracking-tighter font-heading">Registry Demographics</h3>
                                <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mt-1">Student distribution per department</p>
                            </div>
                            <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100">
                                <TrendingUp className="w-6 h-6 text-primary-600" />
                            </div>
                        </div>
                        <div className="space-y-10">
                            {Object.entries(stats.deptStats).map(([dept, count], idx) => (
                                <div key={dept} className="group">
                                    <div className="flex justify-between items-end mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-primary-200 uppercase">{idx + 1}.</span>
                                            <span className="text-xs font-black text-primary-900 uppercase tracking-widest">{dept}</span>
                                        </div>
                                        <span className="text-sm font-black text-primary-950">{count} Records</span>
                                    </div>
                                    <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden border border-primary-50 relative shadow-inner">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary-600 to-indigo-400 group-hover:from-accent-500 group-hover:to-orange-400 transition-all duration-1000 rounded-full shadow-lg shadow-primary-500/10"
                                            style={{ width: `${(count / stats.totalStudents) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Refined Activity Log */}
                <div className="academic-card overflow-hidden h-fit animate-slide-up" style={{ animationDelay: '400ms' }}>
                    <div className="p-10 border-b border-gray-50 flex items-center justify-between bg-primary-50/10 relative">
                        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-primary-600/5 to-transparent"></div>
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-primary-950 flex items-center justify-center text-white shadow-xl shadow-primary-950/20">
                                <Shield className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-primary-950 uppercase tracking-tighter font-heading">Security Feed</h2>
                                <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em]">Encrypted System Audit</p>
                            </div>
                        </div>
                        {profile?.role === 'admin' && (
                            <Link to="/audit" className="px-6 py-2.5 bg-white border border-primary-100 rounded-xl text-[10px] font-black text-primary-600 uppercase tracking-widest hover:bg-primary-950 hover:text-white hover:border-primary-950 transition-all shadow-sm relative z-10">Detailed Logs</Link>
                        )}
                    </div>
                    <div className="p-6 space-y-4">
                        {stats.recentActivity && stats.recentActivity.length > 0 ? (
                            stats.recentActivity.map((log) => (
                                <div key={log.id} className="flex items-center gap-6 p-5 rounded-[1.5rem] hover:bg-slate-50 transition-all duration-500 group border border-transparent hover:border-primary-50">
                                    <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-primary-200 group-hover:text-primary-600 group-hover:border-primary-100 group-hover:rotate-6 transition-all shadow-sm">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <p className="text-xs font-black text-primary-950 uppercase tracking-tight">{log.profiles?.full_name}</p>
                                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest px-2 py-1 bg-gray-50 rounded-lg">
                                                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-primary-500 uppercase tracking-[0.2em]">{log.action.replace('_', ' ')}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest italic">{log.entity}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-24 text-center">
                                <div className="bg-slate-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-gray-100 shadow-inner">
                                    <AlertCircle className="w-12 h-12 text-gray-200" />
                                </div>
                                <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px]">No recent protocols recorded</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
