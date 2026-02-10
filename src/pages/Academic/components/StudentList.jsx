import React from 'react';
import PropTypes from 'prop-types';
import { Search, Edit2, Trash2, Filter } from 'lucide-react';
import { ROLES } from '../../../constants';

const StudentList = ({
    students,
    loading,
    profile,
    onEdit,
    onDelete
}) => {
    return (
        <div className="academic-card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-primary-950 text-white uppercase tracking-[0.25em] text-[8px] sm:text-[9px] font-black whitespace-nowrap">
                        <tr>
                            <th className="px-4 sm:px-10 py-4 sm:py-7">Reg Identifier</th>
                            <th className="px-4 sm:px-10 py-4 sm:py-7">Full Identity</th>
                            <th className="hidden lg:table-cell px-4 sm:px-10 py-4 sm:py-7">Department</th>
                            <th className="hidden md:table-cell px-4 sm:px-10 py-4 sm:py-7">Current Level</th>
                            <th className="px-4 sm:px-10 py-4 sm:py-7">Status</th>
                            <th className="px-4 sm:px-10 py-4 sm:py-7 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-50">
                        {loading ? (
                            [1, 2, 3, 4, 5].map(i => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan="6" className="px-10 py-8 bg-gray-50/20"></td>
                                </tr>
                            ))
                        ) : students.length > 0 ? (
                            students.map((student) => (
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
                                                onClick={() => onEdit(student)}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            {profile?.role === ROLES.ADMIN && (
                                                <button
                                                    className="p-2 sm:p-3 text-red-500 hover:bg-white rounded-xl transition-all border border-transparent hover:border-red-100 hover:shadow-xl active:scale-90"
                                                    title="Revoke Access"
                                                    onClick={() => onDelete(student.id)}
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
    );
};

StudentList.propTypes = {
    students: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    profile: PropTypes.object,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

export default StudentList;
