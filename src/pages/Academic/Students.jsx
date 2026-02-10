import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { Search, Plus, Filter, X, Loader2 } from 'lucide-react';
import { useFeedback } from '../../hooks/useFeedback';
import { useDebounce } from '../../hooks/useDebounce';
import { useStudents } from '../../hooks/useStudents';
import { validateRegNo } from '../../utils/errorHandler';
import AddStudentModal from './components/AddStudentModal';
import EditStudentModal from './components/EditStudentModal';
import StudentList from './components/StudentList';
import { ROLES } from '../../constants';

const Students = () => {
    const { profile } = useAuth();

    // Use custom hook for students
    const {
        students,
        loading: studentsLoading,
        fetchStudents,
        createStudent,
        updateStudent,
        deactivateStudent
    } = useStudents();

    // Local feedback handling (though useStudents returns errors, we display them here)
    // Actually useFeedback provides the state and showFeedback function
    const { feedback, showFeedback } = useFeedback();

    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [availableProfiles, setAvailableProfiles] = useState([]);

    const [newStudent, setNewStudent] = useState({
        reg_no: '',
        department_id: '',
        level: '100',
        user_id: ''
    });

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const filteredStudents = useMemo(() => {
        if (!debouncedSearchTerm) return students;
        const lowerSearch = debouncedSearchTerm.toLowerCase();
        return students.filter(s =>
            s.profiles?.full_name?.toLowerCase().includes(lowerSearch) ||
            s.reg_no?.toLowerCase().includes(lowerSearch)
        );
    }, [students, debouncedSearchTerm]);


    useEffect(() => {
        fetchStudents();
        fetchMetadata();
    }, [fetchStudents]);

    const fetchMetadata = async () => {
        try {
            // Fetch departments
            const { data: depts } = await supabase.from('departments').select('id, name, code').order('name');
            setDepartments(depts || []);

            // Fetch profiles that are NOT already students
            // Note: This logic might need to be re-run after adding a student
            const { data: studentUserIds } = await supabase.from('students').select('user_id');
            const usedIds = studentUserIds?.map(s => s.user_id) || [];

            let query = supabase
                .from('profiles')
                .select('id, full_name, email')
                .eq('role', ROLES.STUDENT);

            if (usedIds.length > 0) {
                query = query.not('id', 'in', `(${usedIds.join(',')})`);
            }

            const { data: profiles } = await query;

            setAvailableProfiles(profiles || []);
        } catch (err) {
            console.error('Error fetching metadata:', err);
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (!newStudent.user_id) throw new Error('Identity Authorization UID is mandatory.');
            if (!newStudent.department_id) throw new Error('Departmental node must be selected.');

            const regNoValidation = validateRegNo(newStudent.reg_no);
            if (!regNoValidation.isValid) throw new Error(regNoValidation.message);

            const result = await createStudent(newStudent);

            if (result.success) {
                showFeedback('success', `Authorization success: ${newStudent.reg_no} enrolled.`);
                setShowAddModal(false);
                setNewStudent({ reg_no: '', department_id: '', level: '100', user_id: '' });
                fetchMetadata(); // Refresh available profiles
            } else {
                showFeedback('error', result.error);
            }
        } catch (err) {
            showFeedback('error', err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditStudent = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (!editingStudent.reg_no) throw new Error('Registration Number is required');

            const result = await updateStudent(editingStudent.id, editingStudent);

            if (result.success) {
                showFeedback('success', 'Registry records synchronized successfully.');
                setShowEditModal(false);
                setEditingStudent(null);
            } else {
                showFeedback('error', result.error);
            }
        } catch (err) {
            showFeedback('error', err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSoftDelete = async (studentId) => {
        if (!window.confirm('Are you sure you want to deactivate this student record?')) return;

        const result = await deactivateStudent(studentId);

        if (result.success) {
            showFeedback('success', 'Security Protocol: Record deactivated and archived.');
        } else {
            showFeedback('error', result.error);
        }
    };

    return (
        <div className="space-y-12 animate-slide-up">
            {/* High-Fidelity Header */}
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

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8 pb-6 border-b border-primary-100/50">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="w-10 sm:w-12 h-1 bg-primary-600 rounded-full"></span>
                        <p className="text-[9px] sm:text-[10px] font-black text-primary-500 uppercase tracking-[0.4em]">Official Registry</p>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-primary-950 tracking-tighter italic font-heading">
                        Student <span className="text-primary-600">Directory</span>
                    </h1>
                </div>
                {profile?.role === ROLES.ADMIN && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn-primary group w-full md:w-auto"
                    >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
                        Enroll New Student
                    </button>
                )}
            </div>

            {/* Premium Search & Filter */}
            <div className="academic-card p-2 sm:p-4 flex flex-col md:flex-row gap-3 sm:gap-4 items-center bg-white shadow-2xl shadow-primary-950/5">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 transition-colors group-focus-within:text-primary-600" />
                    <input
                        type="text"
                        placeholder="Search records by registration identifier or name..."
                        className="w-full pl-14 sm:pl-16 pr-6 sm:pr-8 py-4 sm:py-5 bg-transparent rounded-2xl focus:outline-none font-medium placeholder:text-gray-300 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center justify-center gap-2 px-6 py-4 bg-primary-50 rounded-xl sm:rounded-2xl border border-primary-100/50 w-full sm:w-auto">
                    <Filter className="w-4 h-4 text-primary-600" />
                    <span className="text-[9px] sm:text-[10px] font-black text-primary-900 uppercase tracking-widest">Global Filter</span>
                </div>
            </div>

            {/* Refined Student Ledger */}
            <StudentList
                students={filteredStudents}
                loading={studentsLoading}
                profile={profile}
                onEdit={(student) => {
                    setEditingStudent({ ...student });
                    setShowEditModal(true);
                }}
                onDelete={handleSoftDelete}
            />

            {/* Premium Modals with Glassmorphism */}
            <AddStudentModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleAddStudent}
                studentData={newStudent}
                onStudentDataChange={setNewStudent}
                departments={departments}
                availableProfiles={availableProfiles}
                submitting={submitting}
            />

            <EditStudentModal
                isOpen={showEditModal && !!editingStudent}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingStudent(null);
                }}
                onSubmit={handleEditStudent}
                studentData={editingStudent}
                onStudentDataChange={setEditingStudent}
                departments={departments}
                submitting={submitting}
            />
        </div>
    );
};

export default Students;
