import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { handleError } from '../../utils/errorHandler';
import ErrorMessage from '../../components/common/ErrorMessage';
import AdminDashboard from './components/AdminDashboard';
import StaffDashboard from './components/StaffDashboard';
import StudentDashboard from './components/StudentDashboard';
import { ROLES } from '../../constants';

const Dashboard = () => {
    const { profile } = useAuth();
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeStudents: 0,
        inactiveStudents: 0,
        totalCourses: 0,
        totalStaff: 0,
        activeEnrollments: 0,
        deptStats: {},
        recentActivity: []
    });
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                if (profile?.role === ROLES.ADMIN) {
                    const { data: adminStats, error } = await supabase.rpc('get_admin_dashboard_stats');
                    if (error) throw error;

                    const { data: activity } = await supabase
                        .from('audit_logs')
                        .select('*, profiles:actor_id(full_name)')
                        .order('created_at', { ascending: false })
                        .limit(5);

                    setStats({
                        totalStudents: adminStats.total_students || 0,
                        activeStudents: adminStats.active_students || 0,
                        inactiveStudents: adminStats.inactive_students || 0,
                        totalCourses: adminStats.total_courses || 0,
                        totalStaff: adminStats.total_staff || 0,
                        activeEnrollments: Object.values(adminStats.enrollments_per_course || {}).reduce((a, b) => a + b, 0),
                        deptStats: adminStats.students_per_department || {},
                        recentActivity: activity || []
                    });
                } else if (profile?.role === ROLES.STAFF) {
                    const { data: staffStats, error } = await supabase.rpc('get_staff_dashboard_stats');
                    if (error) throw error;

                    setStats({
                        totalStudents: staffStats.total_students || 0,
                        activeStudents: staffStats.active_students || 0,
                        inactiveStudents: staffStats.inactive_students || 0,
                        totalCourses: 0,
                        activeEnrollments: staffStats.total_enrollments || 0,
                        deptStats: staffStats.students_per_department || {},
                        recentActivity: []
                    });
                } else if (profile?.role === ROLES.STUDENT) {
                    const { data: studentDashboardData, error } = await supabase.rpc('get_student_dashboard_data');
                    if (error) throw error;

                    if (studentDashboardData?.student_found) {
                        setStudentData(studentDashboardData);
                    }
                }
            } catch (err) {
                console.error('Error fetching stats:', err);
                setError(handleError(err, 'fetch_dashboard_data'));
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

            {/* Error Display */}
            {error && (
                <ErrorMessage
                    type="error"
                    message={error}
                    onClose={() => setError('')}
                />
            )}

            {/* Role Specific Views */}
            {profile?.role === ROLES.ADMIN && <AdminDashboard stats={stats} />}
            {profile?.role === ROLES.STAFF && <StaffDashboard stats={stats} />}
            {profile?.role === ROLES.STUDENT && <StudentDashboard profile={profile} studentData={studentData} />}
        </div>
    );
};

export default Dashboard;
