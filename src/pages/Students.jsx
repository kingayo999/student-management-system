import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Edit2, Trash2, Filter, X, Loader2 } from 'lucide-react';
import { logAudit } from '../utils/logger';

const Students = () => {
    const { profile } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [newStudent, setNewStudent] = useState({
        reg_no: '',
        department: 'COLENG',
        level: '100',
        user_id: ''
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const { data, error } = await supabase
                .from('students')
                .select(`
                    *,
                    profiles:user_id (full_name)
                `)
                .is('deleted_at', null);

            if (error) throw error;
            setStudents(data || []);
        } catch (err) {
            console.error('Error fetching students:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { data, error } = await supabase
                .from('students')
                .insert([{
                    ...newStudent,
                    user_id: newStudent.user_id || user.id
                }])
                .select()
                .single();

            if (error) throw error;

            logAudit('create_student', 'students', data.id);
            setShowAddModal(false);
            setNewStudent({ reg_no: '', department: 'COLENG', level: '100', user_id: '' });
            fetchStudents();
        } catch (err) {
            alert('Error adding student: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditStudent = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('students')
                .update({
                    reg_no: editingStudent.reg_no,
                    department: editingStudent.department,
                    level: editingStudent.level,
                    status: editingStudent.status
                })
                .eq('id', editingStudent.id);

            if (error) throw error;

            logAudit('update_student', 'students', editingStudent.id);
            setShowEditModal(false);
            setEditingStudent(null);
            fetchStudents();
        } catch (err) {
            alert('Error updating student: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSoftDelete = async (studentId) => {
        if (!window.confirm('Are you sure you want to deactivate this student record?')) return;

        try {
            const { error } = await supabase
                .from('students')
                .update({
                    deleted_at: new Date().toISOString(),
                    status: 'inactive'
                })
                .eq('id', studentId);

            if (error) throw error;

            logAudit('deactivate_student', 'students', studentId);
            fetchStudents();
        } catch (err) {
            alert('Failed to deactivate student: ' + err.message);
        }
    };

    const filteredStudents = students.filter(s =>
        s.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.reg_no?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-12 animate-slide-up">
            {/* High-Fidelity Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-6 border-b border-primary-100/50">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="w-12 h-1 bg-primary-600 rounded-full"></span>
                        <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em]">Official Registry</p>
                    </div>
                    <h1 className="text-5xl font-black text-primary-950 tracking-tighter italic font-heading">
                        Student <span className="text-primary-600">Directory</span>
                    </h1>
                </div>
                {profile?.role === 'admin' && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn-primary group"
                    >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
                        Enroll New Student
                    </button>
                )}
            </div>

            {/* Premium Search & Filter */}
            <div className="academic-card p-4 flex flex-col md:flex-row gap-4 items-center bg-white shadow-2xl shadow-primary-950/5">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 transition-colors group-focus-within:text-primary-600" />
                    <input
                        type="text"
                        placeholder="Search records by registration identifier or name..."
                        className="w-full pl-16 pr-8 py-5 bg-transparent rounded-2xl focus:outline-none font-medium placeholder:text-gray-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 px-6 py-4 bg-primary-50 rounded-2xl border border-primary-100/50">
                    <Filter className="w-4 h-4 text-primary-600" />
                    <span className="text-[10px] font-black text-primary-900 uppercase tracking-widest">Global Filter</span>
                </div>
            </div>

            {/* Refined Student Ledger */}
            <div className="academic-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-primary-950 text-white uppercase tracking-[0.25em] text-[9px] font-black">
                            <tr>
                                <th className="px-10 py-7">Reg Identifier</th>
                                <th className="px-10 py-7">Full Identity</th>
                                <th className="px-10 py-7">Department</th>
                                <th className="px-10 py-7">Current Level</th>
                                <th className="px-10 py-7">Status</th>
                                <th className="px-10 py-7 text-right">Actions</th>
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
                                    <tr key={student.id} className="hover:bg-primary-50/20 transition-all group duration-500">
                                        <td className="px-10 py-8">
                                            <span className="font-mono font-bold text-xs text-primary-800 bg-primary-50 px-4 py-2 rounded-xl border border-primary-100 shadow-sm">{student.reg_no}</span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-800 flex items-center justify-center text-white text-lg font-black shadow-xl shadow-primary-900/20 group-hover:rotate-3 transition-transform">
                                                    {student.profiles?.full_name?.charAt(0)}
                                                </div>
                                                <span className="text-sm font-black text-primary-950 uppercase tracking-tight">{student.profiles?.full_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-xs font-black text-primary-400 uppercase tracking-widest">{student.department}</td>
                                        <td className="px-10 py-8 text-[11px] font-black text-primary-700">{student.level} Level</td>
                                        <td className="px-10 py-8">
                                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${student.status === 'active'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                : 'bg-amber-50 text-amber-700 border-amber-100'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                                                {student.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                                                <button
                                                    className="p-3 text-primary-700 hover:bg-white rounded-xl transition-all border border-transparent hover:border-primary-100 hover:shadow-xl active:scale-90"
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
                                                        className="p-3 text-red-500 hover:bg-white rounded-xl transition-all border border-transparent hover:border-red-100 hover:shadow-xl active:scale-90"
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
                        <div className="p-10 border-b border-primary-50 flex items-center justify-between bg-gradient-to-br from-primary-900 to-primary-950 text-white relative">
                            <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
                            <div className="relative z-10">
                                <h2 className="text-2xl font-black tracking-tighter uppercase italic font-heading">New Enrollment</h2>
                                <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mt-1.5">Administrative Protocol</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="text-white/50 hover:text-white transition-colors bg-white/5 p-3 rounded-2xl relative z-10">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleAddStudent} className="p-10 space-y-8">
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
                                            className="input-field appearance-none bg-gray-50/50"
                                            value={newStudent.department}
                                            onChange={e => setNewStudent({ ...newStudent, department: e.target.value })}
                                        >
                                            <option value="COLENG">COLENG</option>
                                            <option value="COLNAS">COLNAS</option>
                                            <option value="COLMANS">COLMANS</option>
                                            <option value="COLENVS">COLENVS</option>
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
                                    <input
                                        required
                                        className="input-field text-xs font-mono"
                                        placeholder="Enter Supabase Auth UUID..."
                                        value={newStudent.user_id}
                                        onChange={e => setNewStudent({ ...newStudent, user_id: e.target.value })}
                                    />
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
                        <div className="p-10 border-b border-primary-50 flex items-center justify-between bg-primary-950 text-white relative">
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-accent-500 to-transparent"></div>
                            <div className="relative z-10">
                                <h2 className="text-2xl font-black tracking-tighter uppercase italic font-heading">Modify Record</h2>
                                <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mt-1.5">Registry Authentication</p>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="text-white/50 hover:text-white transition-colors bg-white/5 p-3 rounded-2xl relative z-10">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleEditStudent} className="p-10 space-y-8">
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
                                            className="input-field appearance-none"
                                            value={editingStudent.department}
                                            onChange={e => setEditingStudent({ ...editingStudent, department: e.target.value })}
                                        >
                                            <option value="COLENG">COLENG</option>
                                            <option value="COLNAS">COLNAS</option>
                                            <option value="COLMANS">COLMANS</option>
                                            <option value="COLENVS">COLENVS</option>
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

