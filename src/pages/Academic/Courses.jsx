import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { Book, Plus, Search, X, Loader2, GraduationCap, Printer, FileText } from 'lucide-react';
import { logAudit } from '../../utils/logger';
import { handleError } from '../../utils/errorHandler';
import CourseRegistrationForm from '../../components/academic/CourseRegistrationForm';
import { useFeedback } from '../../hooks/useFeedback';
import { useDebounce } from '../../hooks/useDebounce';
import { useCourses } from '../../hooks/useCourses';
import AddCourseModal from './components/AddCourseModal';
import EditCourseModal from './components/EditCourseModal';
import CourseList from './components/CourseList';
import { ROLES } from '../../constants';

const Courses = () => {
    const { profile } = useAuth();
    const { feedback, showFeedback } = useFeedback();

    // Use custom hook for courses
    const {
        courses,
        loading: coursesLoading,
        fetchCourses,
        createCourse,
        updateCourse,
        deleteCourse
    } = useCourses();

    const [departments, setDepartments] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [activeTab, setActiveTab] = useState('registration');
    const [newCourse, setNewCourse] = useState({
        name: '',
        code: '',
        credit_unit: 3,
        department_id: '',
        level: '100',
        semester: 'First'
    });

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentSearch, setStudentSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [studentEnrollments, setStudentEnrollments] = useState([]);
    const [myEnrollments, setMyEnrollments] = useState([]);
    const [studentData, setStudentData] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    // Debounce search term for performance
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Memoize filtered courses
    const filteredCourses = useMemo(() => {
        if (!debouncedSearchTerm) return courses;
        const search = debouncedSearchTerm.toLowerCase();
        return courses.filter(course =>
            course.name?.toLowerCase().includes(search) ||
            course.code?.toLowerCase().includes(search) ||
            course.departments?.name?.toLowerCase().includes(search)
        );
    }, [courses, debouncedSearchTerm]);

    useEffect(() => {
        fetchMetadata();
        fetchCourses();
    }, [fetchCourses]);

    useEffect(() => {
        if (profile?.role === ROLES.STUDENT && activeSession) {
            fetchMyEnrollments();
        }
    }, [profile, activeSession]);

    const fetchMetadata = async () => {
        try {
            const { data: depts } = await supabase.from('departments').select('id, name, code').order('name');
            setDepartments(depts || []);

            const { data: session } = await supabase
                .from('academic_sessions')
                .select('*')
                .eq('is_current', true)
                .single();
            setActiveSession(session);
        } catch (err) {
            console.error('Error fetching metadata:', err);
        }
    };

    const fetchMyEnrollments = async () => {
        if (!activeSession) return;
        try {
            const { data: student } = await supabase
                .from('students')
                .select(`
                    *,
                    profiles:user_id (full_name),
                    departments:department_id (name)
                `)
                .eq('user_id', profile.id)
                .single();

            if (student) {
                setStudentData(student);
                const { data } = await supabase
                    .from('student_courses')
                    .select(`
                        course_id,
                        courses (*)
                    `)
                    .eq('student_id', student.id)
                    .eq('session_id', activeSession.id);

                setMyEnrollments(data || []);
            }
        } catch (err) {
            showFeedback('error', 'Identity conflict: Could not pull enrollment data.');
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        if (!newCourse.department_id) return showFeedback('error', 'Departmental node must be authorized.');

        setSubmitting(true);
        const result = await createCourse(newCourse);

        if (result.success) {
            showFeedback('success', 'Course protocol successfully provisioned.');
            setShowAddModal(false);
            setNewCourse({
                name: '',
                code: '',
                credit_unit: 3,
                department_id: '',
                level: '100',
                semester: 'First'
            });
        } else {
            showFeedback('error', result.error);
        }
        setSubmitting(false);
    };

    const handleEditCourse = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const result = await updateCourse(editingCourse.id, editingCourse);

        if (result.success) {
            showFeedback('success', 'Registry records synchronized successfully.');
            setShowEditModal(false);
            setEditingCourse(null);
        } else {
            showFeedback('error', result.error);
        }
        setSubmitting(false);
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm('Are you sure you want to permanently delete this course from the curriculum?')) return;

        const result = await deleteCourse(courseId);

        if (result.success) {
            showFeedback('success', 'Security Protocol: Course purged from mainframe.');
        } else {
            showFeedback('error', result.error);
        }
    };

    const handleStudentSearch = async (val) => {
        setStudentSearch(val);
        if (val.length < 3) return setSearchResults([]);
        setSearching(true);
        try {
            const { data } = await supabase
                .from('students')
                .select(`
                    id,
                    reg_no,
                    department_id,
                    profiles:user_id (full_name)
                `)
                .or(`reg_no.ilike.%${val}%,profiles.full_name.ilike.%${val}%`)
                .limit(5);
            setSearchResults(data || []);
        } finally {
            setSearching(false);
        }
    };

    const fetchStudentEnrollments = async (studentId) => {
        if (!activeSession) return;
        try {
            const { data } = await supabase
                .from('student_courses')
                .select('course_id')
                .eq('student_id', studentId)
                .eq('session_id', activeSession.id);
            setStudentEnrollments(data?.map(e => e.course_id) || []);
        } catch (err) {
            showFeedback('error', 'Critical error: Could not synchronize student record.');
        }
    };

    const toggleStudentEnrollment = async (courseId) => {
        if (!selectedStudent || !activeSession) return;
        const isEnrolled = studentEnrollments.includes(courseId);

        try {
            if (isEnrolled) {
                const { error } = await supabase
                    .from('student_courses')
                    .delete()
                    .eq('student_id', selectedStudent.id)
                    .eq('course_id', courseId)
                    .eq('session_id', activeSession.id);
                if (error) throw error;
                setStudentEnrollments(prev => prev.filter(id => id !== courseId));
                showFeedback('success', 'Registry: Course assigned status revoked.');
            } else {
                const { error } = await supabase
                    .from('student_courses')
                    .insert([{
                        student_id: selectedStudent.id,
                        course_id: courseId,
                        session_id: activeSession.id,
                        semester: courses.find(c => c.id === courseId)?.semester || 'First'
                    }]);
                if (error) throw error;
                setStudentEnrollments(prev => [...prev, courseId]);
                showFeedback('success', 'Registry: Course provisioned to student.');
            }
            await logAudit(isEnrolled ? 'admin_unenroll' : 'admin_enroll', 'student_courses', courseId);
        } catch (err) {
            showFeedback('error', 'Authorization failure: Request could not be provisioned.');
        }
    };
    const handleEnroll = async (courseId) => {
        if (!activeSession) return showFeedback('error', 'Active academic session not synchronized.');
        setSubmitting(true);
        try {
            const { data: student } = await supabase
                .from('students')
                .select('id')
                .eq('user_id', profile.id)
                .single();

            if (!student) throw new Error('Student record not found. Please contact administration.');

            const { error } = await supabase
                .from('student_courses')
                .insert([{
                    student_id: student.id,
                    course_id: courseId,
                    session_id: activeSession.id,
                    semester: courses.find(c => c.id === courseId)?.semester || 'First'
                }]);

            if (error) {
                if (error.code === '23505') throw new Error('Already enrolled in this course for the current session.');
                throw error;
            }

            await logAudit('course_enrollment', 'student_courses', courseId);
            showFeedback('success', 'Authorization success: Enrollment confirmed.');
            fetchMyEnrollments();
        } catch (err) {
            showFeedback('error', err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const enrolledCourses = courses.filter(c => myEnrollments.some(e => e.course_id === c.id));
    const totalUnits = enrolledCourses.reduce((acc, curr) => acc + curr.credit_unit, 0);

    return (
        <div className="space-y-12 animate-slide-up">
            {/* Feedback Notifications */}
            {feedback.message && (
                <div className={`fixed top-24 right-8 z-[60] p-5 rounded-2xl shadow-2xl border flex items-center gap-4 animate-in slide-in-from-right duration-500 backdrop-blur-xl ${feedback.type === 'error'
                    ? 'bg-red-50/90 border-red-100 text-red-800'
                    : 'bg-emerald-50/90 border-emerald-100 text-emerald-800'
                    }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${feedback.type === 'error' ? 'bg-red-100' : 'bg-emerald-100'}`}>
                        {feedback.type === 'error' ? <X className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">{feedback.type === 'error' ? 'Security Breach' : 'Protocol Success'}</p>
                        <p className="text-xs font-bold">{feedback.message}</p>
                    </div>
                </div>
            )}

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
                {profile?.role === ROLES.STUDENT && (
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

                {/* Admin/Staff Tabs for Enrollment Management */}
                {(profile?.role === ROLES.ADMIN || profile?.role === ROLES.STAFF) && (
                    <div className="flex gap-4 p-1 bg-primary-100/50 rounded-[1.25rem] w-fit">
                        <button
                            onClick={() => setActiveTab('registration')}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'registration' ? 'bg-white text-primary-950 shadow-lg' : 'text-primary-500 hover:text-primary-700'}`}
                        >
                            <Book className="w-4 h-4" />
                            Curriculum Catalog
                        </button>
                        <button
                            onClick={() => setActiveTab('admin_sync')}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'admin_sync' ? 'bg-white text-primary-950 shadow-lg' : 'text-primary-500 hover:text-primary-700'}`}
                        >
                            <FileText className="w-4 h-4" />
                            Student Enrollment Sync
                        </button>
                    </div>
                )}

                {profile?.role === ROLES.ADMIN && (
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

            {/* Admin Student Sync View */}
            {(profile?.role === ROLES.ADMIN || profile?.role === ROLES.STAFF) && activeTab === 'admin_sync' && (
                <div className="space-y-8 animate-slide-up">
                    <div className="academic-card p-8 bg-white shadow-2xl shadow-primary-950/5 border border-primary-50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                            <Search className="w-40 h-40 text-primary-900" />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <div>
                                <h3 className="text-xl font-black text-primary-950 uppercase tracking-tighter italic font-heading mb-2">Student Identity Search</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 leading-loose">Search by Matriculation Number or Full Name to provision academic pathways.</p>
                                <div className="relative max-w-2xl">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                    <input
                                        type="text"
                                        placeholder="Enter Student Identifier..."
                                        className="w-full pl-16 pr-8 py-5 bg-primary-50/50 border border-primary-100 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-bold placeholder:text-gray-300 text-sm"
                                        value={studentSearch}
                                        onChange={(e) => handleStudentSearch(e.target.value)}
                                    />
                                    {searching && <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-500 animate-spin" />}
                                </div>
                            </div>

                            {searchResults.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 animate-in slide-in-from-top duration-500">
                                    {searchResults.map(student => (
                                        <button
                                            key={student.id}
                                            onClick={() => {
                                                setSelectedStudent(student);
                                                fetchStudentEnrollments(student.id);
                                                setSearchResults([]);
                                                setStudentSearch('');
                                            }}
                                            className="flex items-center gap-4 p-4 bg-white border border-primary-100 rounded-2xl hover:bg-primary-50 transition-all text-left group shadow-sm"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-primary-900 flex items-center justify-center text-white text-xs font-black">
                                                {student.reg_no.slice(-2)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-primary-950 group-hover:text-primary-600 transition-colors uppercase italic">{student.profiles?.full_name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{student.reg_no}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {selectedStudent && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 animate-slide-up">
                            <div className="lg:col-span-1 space-y-6">
                                <div className="academic-card p-8 bg-primary-950 text-white shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                        <GraduationCap className="w-32 h-32" />
                                    </div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-400 mb-6">Active Target Identity</h4>
                                    <h3 className="text-2xl font-black italic tracking-tighter uppercase font-heading mb-2">{selectedStudent.profiles?.full_name}</h3>
                                    <p className="text-xl font-bold text-primary-200 mb-8">{selectedStudent.reg_no}</p>
                                    <div className="pt-6 border-t border-white/10 space-y-4">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-primary-400">Enrollment Count</span>
                                            <span className="px-3 py-1 bg-white/10 rounded-lg">{studentEnrollments.length} Courses</span>
                                        </div>
                                        <button
                                            onClick={() => setSelectedStudent(null)}
                                            className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10"
                                        >
                                            Reset Context
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-2 space-y-6">
                                <h3 className="text-xl font-black text-primary-950 uppercase tracking-tighter italic font-heading">Curriculum Authorization Matrix</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {courses.map(course => (
                                        <div key={course.id} className="academic-card p-6 flex items-center justify-between bg-white border border-primary-50 hover:shadow-xl transition-all group">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xs border ${studentEnrollments.includes(course.id) ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                                    {course.code.split(' ')[0]}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-primary-950 uppercase italic tracking-tight">{course.name}</h4>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{course.code} • {course.credit_unit} Units</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => toggleStudentEnrollment(course.id)}
                                                className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${studentEnrollments.includes(course.id)
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                                                    : 'bg-primary-900 text-white hover:bg-primary-950 shadow-lg shadow-primary-900/20'
                                                    }`}
                                            >
                                                {studentEnrollments.includes(course.id) ? 'Revoke Access' : 'Authorize Entry'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* My Registered Courses View (Printable) */}
            {profile?.role === ROLES.STUDENT && activeTab === 'my_courses' && (
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
                            student={{
                                full_name: studentData?.profiles?.full_name,
                                matric_no: studentData?.reg_no
                            }}
                            totalUnits={totalUnits}
                        />
                    </div>
                </div>
            )}

            {/* Course Registration / Catalog View */}
            {
                (activeTab === 'registration' || !profile) && (
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
                        <CourseList
                            courses={filteredCourses}
                            loading={coursesLoading}
                            profile={profile}
                            myEnrollments={myEnrollments}
                            submitting={submitting}
                            onEnroll={handleEnroll}
                            onEdit={(course) => {
                                setEditingCourse({ ...course });
                                setShowEditModal(true);
                            }}
                            onDelete={handleDeleteCourse}
                        />


                        {/* Premium Modals with Glassmorphism */}
                        <AddCourseModal
                            isOpen={showAddModal}
                            onClose={() => setShowAddModal(false)}
                            onSubmit={handleCreateCourse}
                            courseData={newCourse}
                            onCourseDataChange={setNewCourse}
                            departments={departments}
                            submitting={submitting}
                        />

                        <EditCourseModal
                            isOpen={showEditModal && !!editingCourse}
                            onClose={() => {
                                setShowEditModal(false);
                                setEditingCourse(null);
                            }}
                            onSubmit={handleEditCourse}
                            courseData={editingCourse}
                            onCourseDataChange={setEditingCourse}
                            departments={departments}
                            submitting={submitting}
                        />
                    </>
                )}
        </div>
    );
};

export default Courses;
