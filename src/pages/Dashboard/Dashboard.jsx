import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
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
    ArrowRight,
    Upload,
    Loader2
} from 'lucide-react';


const StatCard = ({ title, value, icon: Icon, color, trend, index }) => (
    <div className={`academic-card p-5 sm:p-10 relative overflow-hidden group animate-slide-up`} style={{ animationDelay: `${index * 100}ms` }}>
        <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-primary-50 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 group-hover:bg-primary-100 transition-colors duration-500"></div>
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div className={`p-3 sm:p-4 rounded-xl sm:rounded-[1.25rem] ${color} shadow-lg ring-4 ring-white`}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                {trend && (
                    <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100/50">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[9px] sm:text-[10px] font-black text-emerald-700 uppercase tracking-widest">{trend}</span>
                    </div>
                )}
            </div>
            <p className="text-[9px] sm:text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-1.5 sm:mb-2 ml-1">{title}</p>
            <h3 className="text-3xl sm:text-4xl font-black text-primary-950 tracking-tighter font-heading">{value}</h3>
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
    const [uploading, setUploading] = useState(false);
    const [passportUrl, setPassportUrl] = useState(null);

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

    const handlePassportUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            alert('Please upload a valid image file (JPEG, JPG, or PNG)');
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('File size must be less than 5MB');
            return;
        }

        setUploading(true);

        try {
            // Get student record
            const { data: student, error: studentError } = await supabase
                .from('students')
                .select('id')
                .eq('user_id', profile.id)
                .single();

            if (studentError || !student) {
                throw new Error('Student record not found');
            }

            // Create unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${student.id}_${Date.now()}.${fileExt}`;
            const filePath = `passports/${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('student-assets')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('student-assets')
                .getPublicUrl(filePath);

            // Update student record with passport URL
            const { error: updateError } = await supabase
                .from('students')
                .update({ passport_url: publicUrl })
                .eq('id', student.id);

            if (updateError) throw updateError;

            // Update local state
            setPassportUrl(publicUrl);
            alert('Passport photo updated successfully!');
        } catch (err) {
            console.error('Error uploading passport:', err);
            alert('Failed to upload passport photo: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-primary-100/50">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="w-10 sm:w-12 h-1 bg-accent-500 rounded-full"></span>
                        <p className="text-[9px] sm:text-[10px] font-black text-primary-500 uppercase tracking-[0.4em]">Official Command Center</p>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-primary-950 tracking-tighter italic font-heading">
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
                    {/* Left Column: Profile Card */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="academic-card p-8 flex flex-col items-center text-center">
                            <div className="w-48 h-48 mb-6 relative group">
                                <div className="absolute inset-0 bg-primary-100 rounded-full animate-pulse group-hover:bg-primary-200 transition-colors"></div>
                                <img
                                    src={passportUrl || profile?.passport_url || `https://ui-avatars.com/api/?name=${profile?.full_name}&background=0f172a&color=fff`}
                                    alt="Student Passport"
                                    className="w-full h-full rounded-full object-cover border-4 border-white shadow-xl relative z-10"
                                />
                                <div className="absolute bottom-2 right-2 z-20 bg-accent-500 p-2 rounded-full border border-white shadow-lg pointer-events-none">
                                    <Users className="w-4 h-4 text-primary-950" />
                                </div>
                                {uploading && (
                                    <div className="absolute inset-0 bg-primary-950/50 rounded-full flex items-center justify-center z-30">
                                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                id="passport-upload"
                                accept="image/jpeg,image/png,image/jpg"
                                className="hidden"
                                onChange={handlePassportUpload}
                            />
                            <label
                                htmlFor="passport-upload"
                                className="cursor-pointer inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent-600 hover:text-accent-700 hover:underline mb-6 transition-colors"
                            >
                                <Upload className="w-3 h-3" />
                                Update Passport
                            </label>

                            <div className="w-full space-y-4 text-left">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Full Name</p>
                                    <p className="font-bold text-primary-950 uppercase">{profile?.full_name}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Matric No</p>
                                    <p className="font-bold text-primary-950 uppercase">{profile?.reg_no || '2024/13522'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Email</p>
                                    <p className="font-bold text-primary-950 break-all">{profile?.email || 'student@bellsuniversity.edu.ng'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Current Level</p>
                                    <p className="font-bold text-primary-950 uppercase">300 Level</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Academic Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Upper Info Grid */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">College</p>
                                <p className="font-bold text-primary-950 text-sm">College Of Engineering</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Department</p>
                                <p className="font-bold text-primary-950 text-sm">Computer Engineering</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Session</p>
                                <p className="font-bold text-primary-950 text-sm">2025/2026</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Semester</p>
                                <p className="font-bold text-primary-950 text-sm">FIRST</p>
                            </div>
                        </div>

                        {/* Welcome & Info */}
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-black italic text-primary-950 mb-2">
                                    Hi <span className="uppercase">{profile?.full_name}</span>,
                                </h2>
                                <p className="text-gray-500 leading-relaxed text-sm">
                                    Welcome to your Student Portal! Your academic journey begins here. Navigate through your courses, payments, registration, and access other valuable resources. Embrace the possibilities. Happy learning!
                                </p>
                            </div>

                            <div className="academic-card overflow-hidden">
                                <div className="bg-primary-950 px-6 py-4 border-b border-primary-900">
                                    <h3 className="text-white font-black uppercase tracking-widest text-sm">Semester Information</h3>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    <div className="p-4 sm:p-6 grid grid-cols-2 gap-4 hover:bg-gray-50 transition-colors">
                                        <p className="text-xs font-bold text-gray-600">Registration Status</p>
                                        <span className="inline-flex w-fit items-center px-2.5 py-1 rounded-lg bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest">Closed</span>
                                    </div>
                                    <div className="p-4 sm:p-6 grid grid-cols-2 gap-4 hover:bg-gray-50 transition-colors">
                                        <p className="text-xs font-bold text-gray-600">Normal Registration Closes</p>
                                        <p className="text-xs font-bold text-primary-950">12-01-2026 11:56 PM</p>
                                    </div>
                                    <div className="p-4 sm:p-6 grid grid-cols-2 gap-4 hover:bg-gray-50 transition-colors">
                                        <p className="text-xs font-bold text-gray-600">Late Registration Closes</p>
                                        <p className="text-xs font-bold text-primary-950">13-01-2026 02:56 PM</p>
                                    </div>
                                    <div className="p-4 sm:p-6 grid grid-cols-2 gap-4 hover:bg-gray-50 transition-colors">
                                        <p className="text-xs font-bold text-gray-600">Tuition Payment</p>
                                        <span className="inline-flex w-fit items-center px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest">Completed</span>
                                    </div>
                                    <div className="p-4 sm:p-6 grid grid-cols-2 gap-4 hover:bg-gray-50 transition-colors">
                                        <p className="text-xs font-bold text-gray-600">Course Registration</p>
                                        <span className="inline-flex w-fit items-center px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest">Completed</span>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                    <div className="p-8 sm:p-10 border-b border-gray-50 flex flex-col sm:flex-row items-center justify-between bg-primary-50/10 relative gap-6 sm:gap-0">
                        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-primary-600/5 to-transparent"></div>
                        <div className="flex items-center gap-4 sm:gap-5 relative z-10 w-full sm:w-auto">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary-950 flex items-center justify-center text-white shadow-xl shadow-primary-950/20">
                                <Shield className="w-6 h-6 sm:w-7 sm:h-7" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-black text-primary-950 uppercase tracking-tighter font-heading">Security Feed</h2>
                                <p className="text-[9px] sm:text-[10px] font-black text-primary-400 uppercase tracking-[0.3em]">Encrypted System Audit</p>
                            </div>
                        </div>
                        {profile?.role === 'admin' && (
                            <Link to="/audit" className="w-full sm:w-auto text-center px-6 py-2.5 bg-white border border-primary-100 rounded-xl text-[10px] font-black text-primary-600 uppercase tracking-widest hover:bg-primary-950 hover:text-white hover:border-primary-950 transition-all shadow-sm relative z-10">Detailed Logs</Link>
                        )}
                    </div>
                    <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                        {stats.recentActivity && stats.recentActivity.length > 0 ? (
                            stats.recentActivity.map((log) => (
                                <div key={log.id} className="flex items-center gap-4 sm:gap-6 p-4 sm:p-5 rounded-2xl sm:rounded-[1.5rem] hover:bg-slate-50 transition-all duration-500 group border border-transparent hover:border-primary-50">
                                    <div className="hidden sm:flex w-12 h-12 rounded-xl bg-white border border-gray-100 items-center justify-center text-primary-200 group-hover:text-primary-600 group-hover:border-primary-100 group-hover:rotate-6 transition-all shadow-sm">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-[11px] sm:text-xs font-black text-primary-950 uppercase tracking-tight truncate pr-4">{log.profiles?.full_name}</p>
                                            <span className="text-[8px] sm:text-[9px] font-black text-gray-300 uppercase tracking-widest px-2 py-1 bg-gray-50 rounded-lg whitespace-nowrap">
                                                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden">
                                            <span className="text-[8px] sm:text-[9px] font-black text-primary-500 uppercase tracking-[0.2em] truncate">{log.action.replace('_', ' ')}</span>
                                            <span className="w-0.5 h-0.5 rounded-full bg-gray-200 shrink-0"></span>
                                            <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest italic truncate">{log.entity}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-16 sm:py-24 text-center">
                                <div className="bg-slate-50 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-[2rem] flex items-center justify-center mx-auto mb-6 sm:mb-8 border border-gray-100 shadow-inner">
                                    <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-200" />
                                </div>
                                <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[9px] sm:text-[10px]">No recent protocols recorded</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
