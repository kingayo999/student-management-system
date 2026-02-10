import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Book, CheckCircle, Plus, Edit2, Trash2 } from 'lucide-react';
import { ROLES } from '../../../constants';

/**
 * CourseList Component
 * Displays a grid of courses with enrollment actions
 * Memoized for performance
 */
const CourseList = memo(({
    courses,
    loading,
    profile,
    myEnrollments,
    submitting,
    onEnroll,
    onEdit,
    onDelete
}) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-72 bg-white rounded-[2.5rem] animate-pulse border border-primary-50 shadow-sm"></div>
                ))}
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="col-span-full py-40 text-center academic-card bg-transparent shadow-none border-dashed border-2 border-primary-100">
                <div className="bg-primary-50 w-32 h-32 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-primary-100 shadow-inner">
                    <Book className="w-16 h-16 text-primary-200" />
                </div>
                <h3 className="text-primary-950 font-black text-3xl mb-4 tracking-tighter italic font-heading uppercase">Curriculum Empty</h3>
                <p className="text-gray-400 max-w-sm mx-auto font-bold uppercase tracking-widest text-[10px] leading-loose">
                    The academic catalog is currently waiting for official protocol entries from the registry department.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
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
                                <p className="text-[9px] sm:text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mt-2">{course.departments?.code || 'N/A'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-blue-50 text-[9px] font-black uppercase tracking-widest text-blue-600 rounded-lg border border-blue-100">
                                    {course.credit_unit} Units
                                </span>
                                <span className="px-3 py-1 bg-amber-50 text-[9px] font-black uppercase tracking-widest text-amber-600 rounded-lg border border-amber-100">
                                    {course.semester} SEM
                                </span>
                            </div>
                        </div>
                        <div className="space-y-3 sm:space-y-4 relative z-10">
                            <h3 className="text-xl sm:text-2xl font-black text-primary-950 tracking-tighter leading-tight italic font-heading uppercase group-hover:text-primary-600 transition-colors duration-300">
                                {course.name}
                            </h3>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                                </div>
                                <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Registry Authenticated</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-auto p-8 sm:p-10 pt-3 sm:pt-4 relative z-10">
                        {profile?.role === ROLES.STUDENT ? (
                            <button
                                onClick={() => onEnroll(course.id)}
                                disabled={submitting || myEnrollments.some(e => e.course_id === course.id)}
                                className={`w-full py-4 sm:py-5 rounded-xl sm:rounded-[1.5rem] font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] transition-all transform active:scale-95 shadow-2xl relative overflow-hidden group/btn ${myEnrollments.some(e => e.course_id === course.id)
                                    ? 'bg-primary-50 text-primary-700 border border-primary-100 cursor-not-allowed shadow-none'
                                    : 'bg-primary-900 text-white hover:bg-primary-950 hover:-translate-y-1 shadow-primary-900/40'
                                    }`}
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                                    {myEnrollments.some(e => e.course_id === course.id) ? (
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
                                    onClick={() => onEdit(course)}
                                    className="flex-1 py-4 bg-primary-50 text-primary-950 rounded-[1.25rem] font-black text-[9px] uppercase tracking-[0.2em] hover:bg-primary-100 transition-all border border-primary-100/50 shadow-sm active:scale-95 hover:-translate-y-0.5"
                                >
                                    Modify
                                </button>
                                {profile?.role === ROLES.ADMIN && (
                                    <button
                                        onClick={() => onDelete(course.id)}
                                        className="p-4 bg-red-50 text-red-500 rounded-[1.25rem] border border-red-100 hover:bg-red-100/50 transition-all active:scale-95 shadow-sm hover:-translate-y-0.5"
                                        title="Revoke Course"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
});

CourseList.displayName = 'CourseList';

CourseList.propTypes = {
    courses: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        code: PropTypes.string.isRequired,
        credit_unit: PropTypes.number.isRequired,
        semester: PropTypes.string.isRequired,
        departments: PropTypes.shape({
            code: PropTypes.string,
        }),
    })).isRequired,
    loading: PropTypes.bool,
    profile: PropTypes.shape({
        role: PropTypes.string,
    }),
    myEnrollments: PropTypes.arrayOf(PropTypes.shape({
        course_id: PropTypes.string,
    })),
    submitting: PropTypes.bool,
    onEnroll: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

CourseList.defaultProps = {
    loading: false,
    myEnrollments: [],
    submitting: false,
};

export default CourseList;
