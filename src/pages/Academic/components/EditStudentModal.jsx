import React from 'react';
import PropTypes from 'prop-types';
import { X, Loader2 } from 'lucide-react';

const EditStudentModal = ({
    isOpen,
    onClose,
    onSubmit,
    studentData,
    onStudentDataChange,
    departments,
    submitting
}) => {
    if (!isOpen || !studentData) return null;

    return (
        <div className="fixed inset-0 bg-primary-950/40 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 animate-in zoom-in duration-500">
                <div className="p-8 sm:p-10 border-b border-primary-50 flex items-center justify-between bg-primary-950 text-white relative">
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-accent-500 to-transparent"></div>
                    <div className="relative z-10">
                        <h2 className="text-xl sm:text-2xl font-black tracking-tighter uppercase italic font-heading">Modify Record</h2>
                        <p className="text-[9px] sm:text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mt-1 lg:mt-1.5">Registry Authentication</p>
                    </div>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors bg-white/5 p-2 sm:p-3 rounded-xl sm:rounded-2xl relative z-10">
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>
                <form onSubmit={onSubmit} className="p-8 sm:p-10 space-y-6 sm:space-y-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-3 ml-1">Registration Identifier</label>
                            <input
                                required
                                className="input-field"
                                value={studentData.reg_no}
                                onChange={e => onStudentDataChange({ ...studentData, reg_no: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-3 ml-1">Department</label>
                                <select
                                    required
                                    className="input-field appearance-none"
                                    value={studentData.department_id}
                                    onChange={e => onStudentDataChange({ ...studentData, department_id: e.target.value })}
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
                                    value={studentData.level}
                                    onChange={e => onStudentDataChange({ ...studentData, level: e.target.value })}
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
                                value={studentData.status}
                                onChange={e => onStudentDataChange({ ...studentData, status: e.target.value })}
                            >
                                <option value="active">Active Protocol</option>
                                <option value="inactive">Inactive / Suspended</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
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
    );
};

EditStudentModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    studentData: PropTypes.object,
    onStudentDataChange: PropTypes.func.isRequired,
    departments: PropTypes.array.isRequired,
    submitting: PropTypes.bool
};

export default EditStudentModal;
