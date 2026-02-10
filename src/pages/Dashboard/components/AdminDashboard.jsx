import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
    Users,
    CheckCircle,
    AlertCircle,
    BookOpen,
    TrendingUp,
    Shield,
    Clock
} from 'lucide-react';
import StatCard from './StatCard';

const AdminDashboard = ({ stats }) => {
    return (
        <div className="space-y-10">
            {/* Premium Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                <StatCard
                    index={0}
                    title="Total Students"
                    value={stats.totalStudents}
                    icon={Users}
                    color="bg-primary-600 text-white shadow-primary-600/40"
                />
                <StatCard
                    index={1}
                    title="Active Students"
                    value={stats.activeStudents}
                    icon={CheckCircle}
                    color="bg-emerald-600 text-white shadow-emerald-600/40"
                />
                <StatCard
                    index={2}
                    title="Inactive Students"
                    value={stats.inactiveStudents}
                    icon={AlertCircle}
                    color="bg-amber-600 text-white shadow-amber-600/40"
                />
                <StatCard
                    index={3}
                    title="Total Courses"
                    value={stats.totalCourses}
                    icon={BookOpen}
                    color="bg-primary-950 text-white shadow-primary-950/40"
                />
            </div>

            {/* High Fidelity Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {stats.deptStats && (
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
                        <Link to="/audit" className="w-full sm:w-auto text-center px-6 py-2.5 bg-white border border-primary-100 rounded-xl text-[10px] font-black text-primary-600 uppercase tracking-widest hover:bg-primary-950 hover:text-white hover:border-primary-950 transition-all shadow-sm relative z-10">Detailed Logs</Link>
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

AdminDashboard.propTypes = {
    stats: PropTypes.shape({
        totalStudents: PropTypes.number,
        activeStudents: PropTypes.number,
        inactiveStudents: PropTypes.number,
        totalCourses: PropTypes.number,
        deptStats: PropTypes.object,
        recentActivity: PropTypes.array
    }).isRequired
};

export default AdminDashboard;
