import React from 'react';
import PropTypes from 'prop-types';
import { X, Loader2 } from 'lucide-react';

/**
 * AddCourseModal Component
 * Modal for creating a new course in the system
 */
const AddCourseModal = ({
    isOpen,
    onClose,
    onSubmit,
    courseData,
    onCourseDataChange,
    departments,
    submitting
}) => {
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(e);
    };

    return (
        <div className="fixed inset-0 bg-primary-950/40 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 animate-in zoom-in duration-500">
                <div className="p-8 sm:p-10 border-b border-primary-50 flex items-center justify-between bg-gradient-to-br from-primary-900 to-primary-950 text-white relative">
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-accent-500 to-transparent"></div>
                    <div className="relative z-10">
                        <h2 className="text-xl sm:text-2xl font-black tracking-tighter uppercase italic font-heading">Provision Course</h2>
                        <p className="text-[9px] sm:text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mt-1 lg:mt-1.5">Curriculum Architecture</p>
                    </div>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors bg-white/5 p-2 sm:p-3 rounded-xl sm:rounded-2xl relative z-10">
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-6 sm:space-y-8">
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-3 ml-1">Course Identity Code</label>
                                <input
                                    required
                                    className="input-field uppercase font-mono tracking-widest shadow-inner !bg-gray-50/50"
                                    placeholder="e.g. ENG 201"
                                    value={courseData.code}
                                    onChange={e => onCourseDataChange({ ...courseData, code: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-3 ml-1">Departmental Node</label>
                                <select
                                    required
                                    className="input-field appearance-none bg-gray-50/50 shadow-inner"
                                    value={courseData.department_id}
                                    onChange={e => onCourseDataChange({ ...courseData, department_id: e.target.value })}
                                >
                                    <option value="">Select Dept</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name} ({dept.code})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-3 ml-1">Official Course Title</label>
                            <input
                                required
                                className="input-field shadow-inner !bg-gray-50/50"
                                placeholder="e.g. Thermodynamics"
                                value={courseData.name}
                                onChange={e => onCourseDataChange({ ...courseData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-3 ml-1">Academic Level</label>
                                <select
                                    className="input-field appearance-none bg-gray-50/50 shadow-inner"
                                    value={courseData.level}
                                    onChange={e => onCourseDataChange({ ...courseData, level: e.target.value })}
                                >
                                    <option value="100">100 Level</option>
                                    <option value="200">200 Level</option>
                                    <option value="300">300 Level</option>
                                    <option value="400">400 Level</option>
                                    <option value="500">500 Level</option>
                                    <option value="PG">Postgraduate</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-3 ml-1">Semester Cycle</label>
                                <select
                                    className="input-field appearance-none bg-gray-50/50 shadow-inner"
                                    value={courseData.semester}
                                    onChange={e => onCourseDataChange({ ...courseData, semester: e.target.value })}
                                >
                                    <option value="First">First Semester</option>
                                    <option value="Second">Second Semester</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-3 ml-1">Credit Weight Protocol</label>
                            <div className="grid grid-cols-6 gap-3">
                                {[1, 2, 3, 4, 5, 6].map(unit => (
                                    <button
                                        key={unit}
                                        type="button"
                                        onClick={() => onCourseDataChange({ ...courseData, credit_unit: unit })}
                                        className={`py-4 rounded-2xl font-black text-sm transition-all border ${courseData.credit_unit === unit
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
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authorize Course'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

AddCourseModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    courseData: PropTypes.shape({
        name: PropTypes.string,
        code: PropTypes.string,
        credit_unit: PropTypes.number,
        department_id: PropTypes.string,
        level: PropTypes.string,
        semester: PropTypes.string,
    }).isRequired,
    onCourseDataChange: PropTypes.func.isRequired,
    departments: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        code: PropTypes.string,
    })).isRequired,
    submitting: PropTypes.bool,
};

export default AddCourseModal;
