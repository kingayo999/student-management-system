import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { Search, Plus, Edit2, Trash2, Filter, X, Loader2 } from 'lucide-react';
import { logAudit } from '../../utils/logger';

const Students = () => {
    const { profile } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [availableProfiles, setAvailableProfiles] = useState([]);
    const [feedback, setFeedback] = useState({ type: '', message: '' });
    const [newStudent, setNewStudent] = useState({
        reg_no: '',
        department_id: '',
        level: '100',
        user_id: ''
    });

    useEffect(() => {
        fetchStudents();
        fetchMetadata();
    }, []);

    const fetchMetadata = async () => {
        try {
            // Fetch departments
            const { data: depts } = await supabase.from('departments').select('id, name, code').order('name');
            setDepartments(depts || []);

            // Fetch profiles that are NOT already students
            const { data: studentUserIds } = await supabase.from('students').select('user_id');
            const usedIds = studentUserIds?.map(s => s.user_id) || [];

            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .eq('role', 'student')
                .not('id', 'in', `(${usedIds.join(',')})`);

            setAvailableProfiles(profiles || []);
        } catch (err) {
            console.error('Error fetching metadata:', err);
        }
    };

    const fetchStudents = async () => {
        try {
            const { data, error } = await supabase
                .from('students')
                .select(`
                    *,
                    profiles:user_id (full_name),
                    departments:department_id (name, code)
                `)
                .is('deleted_at', null);

            if (error) throw error;
            setStudents(data || []);
        } catch (err) {
            showFeedback('error', 'Critical breach: Failed to synchronize student records.');
        } finally {
            setLoading(false);
        }
    };

    const showFeedback = (type, message) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback({ type: '', message: '' }), 5000);
    };

    const validateStudent = (student) => {
        if (!student.reg_no.match(/^[A-Z0-9/\-]{5,20}$/i)) {
            throw new Error('Invalid Registration Identifier format protocol.');
        }
        if (!student.user_id) {
            throw new Error('Identity Authorization UID is mandatory.');
        }
        if (!student.department_id) {
            throw new Error('Departmental node must be selected.');
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            validateStudent(newStudent);

            const { data, error } = await supabase
                .from('students')
                .insert([{
                    reg_no: newStudent.reg_no.toUpperCase(),
                    department_id: newStudent.department_id,
                    level: newStudent.level,
                    user_id: newStudent.user_id,
                    college: departments.find(d => d.id === newStudent.department_id)?.name || 'UNKNOWN'
                }])
                .select()
                .single();

            if (error) {
                if (error.code === '23505') throw new Error('Registration ID already exists in the mainframe.');
                throw error;
            }

            await logAudit('create_student', 'students', data.id);
            showFeedback('success', `Authorization success: ${newStudent.reg_no} enrolled.`);
            setShowAddModal(false);
            setNewStudent({ reg_no: '', department_id: '', level: '100', user_id: '' });
            fetchStudents();
            fetchMetadata(); // Refresh available profiles
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
            validateStudent(editingStudent);

            const { error } = await supabase
                .from('students')
                .update({
                    reg_no: editingStudent.reg_no.toUpperCase(),
                    department_id: editingStudent.department_id,
                    level: editingStudent.level,
                    status: editingStudent.status
                })
                .eq('id', editingStudent.id);

            if (error) throw error;

            await logAudit('update_student', 'students', editingStudent.id);
            showFeedback('success', 'Registry records synchronized successfully.');
            setShowEditModal(false);
            setEditingStudent(null);
            fetchStudents();
        } catch (err) {
            showFeedback('error', err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSoftDelete = async (studentId) => {
        if (!window.confirm('Are you sure you want to deactivate this student record?')) return;

        // Optimistic UI update
        const originalStudents = [...students];
        setStudents(prev => prev.filter(s => s.id !== studentId));

        try {
            const { error } = await supabase
                .from('students')
                .update({
                    deleted_at: new Date().toISOString(),
                    status: 'inactive'
                })
                .eq('id', studentId);

            if (error) throw error;

            await logAudit('deactivate_student', 'students', studentId);
            showFeedback('success', 'Security Protocol: Record deactivated and archived.');
        } catch (err) {
            setStudents(originalStudents);
            showFeedback('error', 'Authorization failure: Could not deactivate record.');
        }
    };

    const filteredStudents = students.filter(s =>
        s.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.reg_no?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                {profile?.role === 'admin' && (
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
            <div className="academic-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-primary-950 text-white uppercase tracking-[0.25em] text-[8px] sm:text-[9px] font-black whitespace-nowrap">
                            <tr>
                                <tr>
                                    <th className="px-4 sm:px-10 py-4 sm:py-7">Reg Identifier</th>
                                    <th className="px-4 sm:px-10 py-4 sm:py-7">Full Identity</th>
                                    <th className="hidden lg:table-cell px-4 sm:px-10 py-4 sm:py-7">Department</th>
                                    <th className="hidden md:table-cell px-4 sm:px-10 py-4 sm:py-7">Current Level</th>
                                    <th className="px-4 sm:px-10 py-4 sm:py-7">Status</th>
                                    <th className="px-4 sm:px-10 py-4 sm:py-7 text-right">Actions</th>
                                </tr>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary-50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-10 py-8 bg-gray-50/20"></td>
                                    </tr>
                                ))
                            ) : filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-primary-50/20 transition-all group duration-500 whitespace-nowrap">
                                        <td className="px-4 sm:px-10 py-4 sm:py-8">
                                            <span className="font-mono font-bold text-[10px] sm:text-xs text-primary-800 bg-primary-50 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-primary-100 shadow-sm">{student.reg_no}</span>
                                        </td>
                                        <td className="px-4 sm:px-10 py-4 sm:py-8">
                                            <div className="flex items-center gap-3 sm:gap-5">
                                                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-800 flex items-center justify-center text-white text-xs sm:text-lg font-black shadow-xl shadow-primary-900/20 group-hover:rotate-3 transition-transform">
                                                    {student.profiles?.full_name?.charAt(0)}
                                                </div>
                                                <span className="text-xs sm:text-sm font-black text-primary-950 uppercase tracking-tight">{student.profiles?.full_name}</span>
                                            </div>
                                        </td>
                                        <td className="hidden lg:table-cell px-4 sm:px-10 py-4 sm:py-8 text-[11px] sm:text-xs font-black text-primary-400 uppercase tracking-widest">
                                            {student.departments?.name || 'Departmental Node Mismatch'}
                                        </td>
                                        <td className="hidden md:table-cell px-4 sm:px-10 py-4 sm:py-8 text-[10px] sm:text-[11px] font-black text-primary-700">{student.level} Level</td>
                                        <td className="px-4 sm:px-10 py-4 sm:py-8">
                                            <span className={`inline-flex items-center gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] border ${student.status === 'active'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                : 'bg-amber-50 text-amber-700 border-amber-100'
                                                }`}>
                                                <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${student.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                                                {student.status}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-10 py-4 sm:py-8 text-right">
                                            <div className="flex items-center justify-end gap-2 sm:gap-3 lg:opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                                                <button
                                                    className="p-2 sm:p-3 text-primary-700 hover:bg-white rounded-xl transition-all border border-transparent hover:border-primary-100 hover:shadow-xl active:scale-90"
                                                    title="Modify Protocol"
                                                    onClick={() => {
                                                        setEditingStudent({ ...student });
                                                        setShowEditModal(true);
                                                    }}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                {profile?.role === 'admin' && (
                                                    <button
                                                        className="p-2 sm:p-3 text-red-500 hover:bg-white rounded-xl transition-all border border-transparent hover:border-red-100 hover:shadow-xl active:scale-90"
                                                        title="Revoke Access"
                                                        onClick={() => handleSoftDelete(student.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-10 py-32 text-center">
                                        <div className="max-w-xs mx-auto">
                                            <div className="bg-primary-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary-100 shadow-inner">
                                                <Search className="w-10 h-10 text-primary-200" />
                                            </div>
                                            <h3 className="text-primary-950 font-black text-xl mb-2 tracking-tight font-heading">No Records Found</h3>
                                            <p className="text-gray-500 text-sm font-medium">Coordinate your search parameters and try again.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Premium Modals with Glassmorphism */}
            {showAddModal && (
                <div className="fixed inset-0 bg-primary-950/40 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-500">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 animate-in zoom-in duration-500">
                        <div className="p-8 sm:p-10 border-b border-primary-50 flex items-center justify-between bg-gradient-to-br from-primary-900 to-primary-950 text-white relative">
                            <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
                            <div className="relative z-10">
                                <h2 className="text-xl sm:text-2xl font-black tracking-tighter uppercase italic font-heading">New Enrollment</h2>
                                <p className="text-[9px] sm:text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mt-1 lg:mt-1.5">Administrative Protocol</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="text-white/50 hover:text-white transition-colors bg-white/5 p-2 sm:p-3 rounded-xl sm:rounded-2xl relative z-10">
                                <X className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleAddStudent} className="p-8 sm:p-10 space-y-6 sm:space-y-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-3 ml-1">Registration Identifier</label>
                                    <input
                                        required
                                        className="input-field"
                                        placeholder="e.g. 21/0001"
                                        value={newStudent.reg_no}
                                        onChange={e => setNewStudent({ ...newStudent, reg_no: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-3 ml-1">Department</label>
                                        <select
                                            required
                                            className="input-field appearance-none bg-gray-50/50"
                                            value={newStudent.department_id}
                                            onChange={e => setNewStudent({ ...newStudent, department_id: e.target.value })}
                                        >
                                            <option value="">Select Departmental Node</option>
                                            {departments.map(dept => (
                                                <option key={dept.id} value={dept.id}>{dept.name} ({dept.code})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-3 ml-1">Academic Level</label>
                                        <select
                                            className="input-field appearance-none bg-gray-50/50"
                                            value={newStudent.level}
                                            onChange={e => setNewStudent({ ...newStudent, level: e.target.value })}
                                        >
                                            <option value="100">100 Level</option>
                                            <option value="200">200 Level</option>
                                            <option value="300">300 Level</option>
                                            <option value="400">400 Level</option>
                                            <option value="500">500 Level</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-3 ml-1">Profile Association UID</label>
                                    <select
                                        required
                                        className="input-field appearance-none bg-gray-50/50"
                                        value={newStudent.user_id}
                                        onChange={e => setNewStudent({ ...newStudent, user_id: e.target.value })}
                                    >
                                        <option value="">Authorize Identity Link</option>
                                        {availableProfiles.map(p => (
                                            <option key={p.id} value={p.id}>{p.full_name} ({p.email})</option>
                                        ))}
                                    </select>
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
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authorize Enrollment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEditModal && editingStudent && (
                <div className="fixed inset-0 bg-primary-950/40 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-500">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 animate-in zoom-in duration-500">
                        <div className="p-8 sm:p-10 border-b border-primary-50 flex items-center justify-between bg-primary-950 text-white relative">
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-accent-500 to-transparent"></div>
                            <div className="relative z-10">
                                <h2 className="text-xl sm:text-2xl font-black tracking-tighter uppercase italic font-heading">Modify Record</h2>
                                <p className="text-[9px] sm:text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mt-1 lg:mt-1.5">Registry Authentication</p>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="text-white/50 hover:text-white transition-colors bg-white/5 p-2 sm:p-3 rounded-xl sm:rounded-2xl relative z-10">
                                <X className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleEditStudent} className="p-8 sm:p-10 space-y-6 sm:space-y-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-3 ml-1">Registration Identifier</label>
                                    <input
                                        required
                                        className="input-field"
                                        value={editingStudent.reg_no}
                                        onChange={e => setEditingStudent({ ...editingStudent, reg_no: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-3 ml-1">Department</label>
                                        <select
                                            required
                                            className="input-field appearance-none"
                                            value={editingStudent.department_id}
                                            onChange={e => setEditingStudent({ ...editingStudent, department_id: e.target.value })}
                                        >
                                            {departments.map(dept => (
                                                <option key={dept.id} value={dept.id}>{dept.name} ({dept.code})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-3 ml-1">Academic Level</label>
                                        <select
                                            className="input-field appearance-none"
                                            value={editingStudent.level}
                                            onChange={e => setEditingStudent({ ...editingStudent, level: e.target.value })}
                                        >
                                            <option value="100">100 Level</option>
                                            <option value="200">200 Level</option>
                                            <option value="300">300 Level</option>
                                            <option value="400">400 Level</option>
                                            <option value="500">500 Level</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-3 ml-1">Administrative Status</label>
                                    <select
                                        className="input-field appearance-none"
                                        value={editingStudent.status}
                                        onChange={e => setEditingStudent({ ...editingStudent, status: e.target.value })}
                                    >
                                        <option value="active">Active Protocol</option>
                                        <option value="inactive">Inactive / Suspended</option>
                                    </select>
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
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Commit Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Students;

