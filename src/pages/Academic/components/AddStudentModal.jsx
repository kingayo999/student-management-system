import React from 'react';
import PropTypes from 'prop-types';
import { X, Loader2 } from 'lucide-react';

const AddStudentModal = ({
    isOpen,
    onClose,
    onSubmit,
    studentData,
    onStudentDataChange,
    departments,
    availableProfiles,
    submitting
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-primary-950/40 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 animate-in zoom-in duration-500">
                <div className="p-8 sm:p-10 border-b border-primary-50 flex items-center justify-between bg-gradient-to-br from-primary-900 to-primary-950 text-white relative">
                    <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
                    <div className="relative z-10">
                        <h2 className="text-xl sm:text-2xl font-black tracking-tighter uppercase italic font-heading">New Enrollment</h2>
                        <p className="text-[9px] sm:text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mt-1 lg:mt-1.5">Administrative Protocol</p>
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
                                placeholder="e.g. 21/0001"
                                value={studentData.reg_no}
                                onChange={e => onStudentDataChange({ ...studentData, reg_no: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-3 ml-1">Department</label>
                                <select
                                    required
                                    className="input-field appearance-none bg-gray-50/50"
                                    value={studentData.department_id}
                                    onChange={e => onStudentDataChange({ ...studentData, department_id: e.target.value })}
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
                            <label className="block text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-3 ml-1">Profile Association UID</label>
                            <select
                                required
                                className="input-field appearance-none bg-gray-50/50"
                                value={studentData.user_id}
                                onChange={e => onStudentDataChange({ ...studentData, user_id: e.target.value })}
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
                            onClick={onClose}
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
    );
};

AddStudentModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    studentData: PropTypes.object.isRequired,
    onStudentDataChange: PropTypes.func.isRequired,
    departments: PropTypes.array.isRequired,
    availableProfiles: PropTypes.array.isRequired,
    submitting: PropTypes.bool
};

export default AddStudentModal;
