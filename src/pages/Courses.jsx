import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { Book, Plus, Search, X, Loader2, CheckCircle, GraduationCap, Trash2, Printer, FileText } from 'lucide-react';
import { logAudit } from '../utils/logger';
import CourseRegistrationForm from '../components/CourseRegistrationForm';

const Courses = () => {
    const { profile } = useAuth();
    const [courses, setCourses] = useState([]);
    const [myEnrollments, setMyEnrollments] = useState([]);
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('registration'); // 'registration' or 'my_courses'
    const [newCourse, setNewCourse] = useState({ name: '', code: '', credit_unit: 3 });

    useEffect(() => {
        fetchCourses();
        if (profile?.role === 'student') {
            fetchMyEnrollments();
        }
    }, [profile]);

    const fetchCourses = async () => {
        try {
            const { data, error } = await supabase.from('courses').select('*');
            if (error) throw error;
            setCourses(data || []);
        } catch (err) {
            console.error('Error fetching courses:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyEnrollments = async () => {
        try {
            const { data: student } = await supabase
                .from('students')
                .select('*')
                .eq('user_id', profile.id)
                .single();

            if (student) {
                setStudentData(student);
                const { data } = await supabase
                    .from('student_courses')
                    .select('course_id')
                    .eq('student_id', student.id);
                setMyEnrollments(data?.map(e => e.course_id) || []);
            }
        } catch (err) {
            console.error('Error fetching enrollments:', err);
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { data, error } = await supabase
                .from('courses')
                .insert([newCourse])
                .select()
                .single();

            if (error) throw error;

            logAudit('create_course', 'courses', data.id);
            setShowAddModal(false);
            setNewCourse({ name: '', code: '', credit_unit: 3 });
            fetchCourses();
        } catch (err) {
            alert('Error creating course: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditCourse = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('courses')
                .update({
                    name: editingCourse.name,
                    code: editingCourse.code,
                    credit_unit: editingCourse.credit_unit
                })
                .eq('id', editingCourse.id);

            if (error) throw error;

            logAudit('update_course', 'courses', editingCourse.id);
            setShowEditModal(false);
            setEditingCourse(null);
            fetchCourses();
        } catch (err) {
            alert('Error updating course: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm('Are you sure you want to permanently delete this course?')) return;
        try {
            const { error } = await supabase
                .from('courses')
                .delete()
                .eq('id', courseId);

            if (error) throw error;

            logAudit('delete_course', 'courses', courseId);
            fetchCourses();
        } catch (err) {
            alert('Failed to delete course: ' + err.message);
        }
    };

    const handleEnroll = async (courseId) => {
        setSubmitting(true);
        try {
            const { data: student } = await supabase
                .from('students')
                .select('id')
                .eq('user_id', profile.id)
                .single();

            if (!student) throw new Error('Student record not found. Please contact admin.');

            const { error } = await supabase
                .from('student_courses')
                .insert([{ student_id: student.id, course_id: courseId }]);

            if (error) throw error;

            logAudit('course_enrollment', 'student_courses', courseId);
            fetchMyEnrollments();
            alert('Enrolled successfully!');
        } catch (err) {
            alert('Enrollment failed: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredCourses = courses.filter(c =>
        (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.code || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const enrolledCourses = courses.filter(c => myEnrollments.includes(c.id));
    const totalUnits = enrolledCourses.reduce((acc, curr) => acc + curr.credit_unit, 0);

    return (
        <div className="space-y-12 animate-slide-up">
            {/* High-Fidelity Header - Hidden on Print */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8 pb-6 border-b border-primary-100/50 print:hidden">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="w-10 sm:w-12 h-1 bg-accent-500 rounded-full"></span>
                        <p className="text-[9px] sm:text-[10px] font-black text-primary-500 uppercase tracking-[0.4em]">Official Curriculum</p>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-primary-950 tracking-tighter italic font-heading">
                        Academic <span className="text-primary-600">Courses</span>
                    </h1>
                </div>
                {/* Student Tabs for Course Management */}
                {profile?.role === 'student' && (
                    <div className="flex gap-4 p-1 bg-primary-100/50 rounded-[1.25rem] w-fit">
                        <button
                            onClick={() => setActiveTab('registration')}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'registration' ? 'bg-white text-primary-950 shadow-lg' : 'text-primary-500 hover:text-primary-700'}`}
                        >
                            <Book className="w-4 h-4" />
                            Course Registration
                        </button>
                        <button
                            onClick={() => setActiveTab('my_courses')}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'my_courses' ? 'bg-white text-primary-950 shadow-lg' : 'text-primary-500 hover:text-primary-700'}`}
                        >
                            <FileText className="w-4 h-4" />
                            My Registered Courses
                        </button>
                    </div>
                )}

                {profile?.role === 'admin' && (
                    <div className="flex justify-end">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="btn-primary group w-full sm:w-auto"
                        >
                            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
                            Provision New Course
                        </button>
                    </div>
                )}
            </div>

            {/* My Registered Courses View (Printable) */}
            {profile?.role === 'student' && activeTab === 'my_courses' && (
                <div className="space-y-8 animate-slide-up">
                    <div className="flex justify-end mb-4 print:hidden">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-6 py-3 bg-primary-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-900 transition-all shadow-xl"
                        >
                            <Printer className="w-4 h-4" />
                            Print Form
                        </button>
                    </div>

                    <div className="print:m-0 print:p-0">
                        <CourseRegistrationForm
                            courses={enrolledCourses}
                            student={studentData}
                            totalUnits={totalUnits}
                        />
                    </div>
                </div>
            )}

            {/* Course Registration / Catalog View */}
            {(!profile || profile.role !== 'student' || activeTab === 'registration') && (
                <>
                    {/* Premium Search Section */}
                    <div className="academic-card p-2 sm:p-4 flex flex-col md:flex-row gap-4 items-center bg-white shadow-2xl shadow-primary-950/5">
                        <div className="relative flex-1 group w-full">
                            <Search className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 transition-colors group-focus-within:text-primary-600" />
                            <input
                                type="text"
                                placeholder="Search the curriculum by title or course identifier..."
                                className="w-full pl-14 sm:pl-16 pr-6 sm:pr-8 py-4 sm:py-5 bg-transparent rounded-2xl focus:outline-none font-medium placeholder:text-gray-300 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>


                    {/* Refined Course Catalog Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loading ? (
                            [1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-72 bg-white rounded-[2.5rem] animate-pulse border border-primary-50 shadow-sm"></div>
                            ))
                        ) : filteredCourses.length > 0 ? (
                            filteredCourses.map((course) => (
                                <div key={course.id} className="academic-card group overflow-hidden flex flex-col bg-white hover:bg-gradient-to-br hover:from-white hover:to-primary-50/30">
                                    <div className="p-8 sm:p-10 pb-5 sm:pb-6 relative">
                                        <div className="absolute top-0 right-0 p-6 sm:p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                                            <Book className="w-24 h-24 sm:w-32 sm:h-32 text-primary-950" />
                                        </div>
                                        <div className="flex justify-between items-start mb-6 sm:mb-8 relative z-10">
                                            <div className="space-y-1">
                                                <span className="px-4 sm:px-5 py-1.5 sm:py-2 bg-primary-950 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] rounded-lg sm:rounded-xl shadow-xl shadow-primary-900/20 block w-fit">
                                                    {course.code}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[9px] sm:text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1">Weight</div>
                                                <span className="text-xs sm:text-sm font-black text-primary-950 bg-primary-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-primary-100 shadow-sm">
                                                    {course.credit_unit || 3} Units
                                                </span>
                                            </div>
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-black text-primary-950 mb-3 sm:mb-4 group-hover:text-primary-600 transition-colors uppercase tracking-tighter leading-tight font-heading min-h-[3.5rem] sm:min-h-[4rem]">
                                            {course.name}
                                        </h3>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                                                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                                            </div>
                                            <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Registry Authenticated</p>
                                        </div>
                                    </div>
                                    <div className="mt-auto p-8 sm:p-10 pt-3 sm:pt-4 relative z-10">
                                        {profile?.role === 'student' ? (
                                            <button
                                                onClick={() => handleEnroll(course.id)}
                                                disabled={submitting || myEnrollments.includes(course.id)}
                                                className={`w-full py-4 sm:py-5 rounded-xl sm:rounded-[1.5rem] font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] transition-all transform active:scale-95 shadow-2xl relative overflow-hidden group/btn ${myEnrollments.includes(course.id)
                                                    ? 'bg-primary-50 text-primary-700 border border-primary-100 cursor-not-allowed shadow-none'
                                                    : 'bg-primary-900 text-white hover:bg-primary-950 hover:-translate-y-1 shadow-primary-900/40'
                                                    }`}
                                            >
                                                <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                                                    {myEnrollments.includes(course.id) ? (
                                                        <>
                                                            <CheckCircle className="w-4 h-4" /> Successfully Enrolled
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform duration-500" />
                                                            Authorize Enrollment
                                                        </>
                                                    )}
                                                </span>
                                            </button>
                                        ) : (
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => {
                                                        setEditingCourse({ ...course });
                                                        setShowEditModal(true);
                                                    }}
                                                    className="flex-1 py-4 bg-primary-50 text-primary-950 rounded-[1.25rem] font-black text-[9px] uppercase tracking-[0.2em] hover:bg-primary-100 transition-all border border-primary-100/50 shadow-sm active:scale-95 hover:-translate-y-0.5"
                                                >
                                                    Modify
                                                </button>
                                                {profile?.role === 'admin' && (
                                                    <button
                                                        onClick={() => handleDeleteCourse(course.id)}
                                                        className="p-4 bg-red-50 text-red-500 rounded-[1.25rem] border border-red-100 hover:bg-red-100/50 transition-all active:scale-95 shadow-sm hover:-translate-y-0.5"
                                                        title="Revoke Course"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-40 text-center academic-card bg-transparent shadow-none border-dashed border-2 border-primary-100">
                                <div className="bg-primary-50 w-32 h-32 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-primary-100 shadow-inner">
                                    <GraduationCap className="w-16 h-16 text-primary-200" />
                                </div>
                                <h3 className="text-primary-950 font-black text-3xl mb-4 tracking-tighter italic font-heading uppercase">Curriculum Empty</h3>
                                <p className="text-gray-400 max-w-sm mx-auto font-bold uppercase tracking-widest text-[10px] leading-loose">The academic catalog is currently waiting for official protocol entries from the registry department.</p>
                            </div>
                        )}
                    </div>


                    {/* Premium Modals with Glassmorphism */}
                    {
                        showAddModal && (
                            <div className="fixed inset-0 bg-primary-950/40 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-500">
                                <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 animate-in zoom-in duration-500">
                                    <div className="p-8 sm:p-10 border-b border-primary-50 flex items-center justify-between bg-gradient-to-br from-primary-900 to-primary-950 text-white relative">
                                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-accent-500 to-transparent"></div>
                                        <div className="relative z-10">
                                            <h2 className="text-xl sm:text-2xl font-black tracking-tighter uppercase italic font-heading">Provision Course</h2>
                                            <p className="text-[9px] sm:text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mt-1 lg:mt-1.5">Curriculum Architecture</p>
                                        </div>
                                        <button onClick={() => setShowAddModal(false)} className="text-white/50 hover:text-white transition-colors bg-white/5 p-2 sm:p-3 rounded-xl sm:rounded-2xl relative z-10">
                                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </button>
                                    </div>
                                    <form onSubmit={handleCreateCourse} className="p-8 sm:p-10 space-y-6 sm:space-y-8">
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-3 ml-1">Course Identity Code</label>
                                                <input
                                                    required
                                                    className="input-field uppercase font-mono tracking-widest shadow-inner !bg-gray-50/50"
                                                    placeholder="e.g. ENG 201"
                                                    value={newCourse.code}
                                                    onChange={e => setNewCourse({ ...newCourse, code: e.target.value.toUpperCase() })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-3 ml-1">Official Course Title</label>
                                                <input
                                                    required
                                                    className="input-field shadow-inner !bg-gray-50/50"
                                                    placeholder="e.g. Thermodynamics"
                                                    value={newCourse.name}
                                                    onChange={e => setNewCourse({ ...newCourse, name: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-3 ml-1">Credit Weight Protocol</label>
                                                <div className="grid grid-cols-6 gap-3">
                                                    {[1, 2, 3, 4, 5, 6].map(unit => (
                                                        <button
                                                            key={unit}
                                                            type="button"
                                                            onClick={() => setNewCourse({ ...newCourse, credit_unit: unit })}
                                                            className={`py-4 rounded-2xl font-black text-sm transition-all border ${newCourse.credit_unit === unit
                                                                ? 'bg-primary-950 text-white border-primary-950 shadow-xl shadow-primary-950/20'
                                                                : 'bg-white text-primary-400 border-primary-50 hover:border-primary-200'
                                                                }`}
                                                        >
                                                            {unit}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setShowAddModal(false)}
                                                className="flex-1 px-8 py-4 border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all"
                                            >
                                                Abort
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="btn-primary flex-1"
                                            >
                                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authorize Course'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )
                    }

                    {
                        showEditModal && editingCourse && (
                            <div className="fixed inset-0 bg-primary-950/40 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-500">
                                <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 animate-in zoom-in duration-500">
                                    <div className="p-8 sm:p-10 border-b border-primary-50 flex items-center justify-between bg-primary-950 text-white relative">
                                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-accent-500 to-transparent"></div>
                                        <div className="relative z-10">
                                            <h2 className="text-xl sm:text-2xl font-black tracking-tighter uppercase italic font-heading">Protocol Modification</h2>
                                            <p className="text-[9px] sm:text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mt-1 lg:mt-1.5">Official Records</p>
                                        </div>
                                        <button onClick={() => setShowEditModal(false)} className="text-white/50 hover:text-white transition-colors bg-white/5 p-2 sm:p-3 rounded-xl sm:rounded-2xl relative z-10">
                                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </button>
                                    </div>
                                    <form onSubmit={handleEditCourse} className="p-8 sm:p-10 space-y-6 sm:space-y-8">
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-3 ml-1">Course Identity Code</label>
                                                <input
                                                    required
                                                    className="input-field uppercase font-mono tracking-widest shadow-inner !bg-gray-50/50"
                                                    value={editingCourse.code}
                                                    onChange={e => setEditingCourse({ ...editingCourse, code: e.target.value.toUpperCase() })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-3 ml-1">Official Course Title</label>
                                                <input
                                                    required
                                                    className="input-field shadow-inner !bg-gray-50/50"
                                                    value={editingCourse.name}
                                                    onChange={e => setEditingCourse({ ...editingCourse, name: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-3 ml-1">Credit Weight Protocol</label>
                                                <div className="grid grid-cols-6 gap-3">
                                                    {[1, 2, 3, 4, 5, 6].map(unit => (
                                                        <button
                                                            key={unit}
                                                            type="button"
                                                            onClick={() => setEditingCourse({ ...editingCourse, credit_unit: unit })}
                                                            className={`py-4 rounded-2xl font-black text-sm transition-all border ${editingCourse.credit_unit === unit
                                                                ? 'bg-primary-950 text-white border-primary-950 shadow-xl shadow-primary-950/20'
                                                                : 'bg-white text-primary-400 border-primary-50 hover:border-primary-200'
                                                                }`}
                                                        >
                                                            {unit}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setShowEditModal(false)}
                                                className="flex-1 px-8 py-4 border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all"
                                            >
                                                Discard
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="btn-primary flex-1"
                                            >
                                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Commit Protocol'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )
                    }
                </>
            )}
        </div>
    );
};

export default Courses;
