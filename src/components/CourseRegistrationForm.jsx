
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';

const CourseRegistrationForm = ({ courses, student, totalUnits }) => {
    // Generate a unique reference for the QR code
    const qrValue = `Name:${student?.full_name || 'N/A'}|Matric:${student?.matric_no || 'N/A'}|Session:2024/2025|Units:${totalUnits}`;

    return (
        <div className="bg-white p-8 max-w-[210mm] mx-auto min-h-[297mm] shadow-2xl print:shadow-none print:w-full print:max-w-none">
            {/* Header Section */}
            <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
                <div className="mb-4 flex flex-col items-center">
                    {/* Placeholder for Logo - You might want to add an actual img tag here if available */}
                    <div className="w-16 h-16 bg-gray-200 rounded-full mb-2 flex items-center justify-center text-[10px] font-bold text-gray-500">LOGO</div>
                    <img
                        src="/path/to/logo.png"
                        alt="University Logo"
                        className="w-20 h-20 object-contain mb-2 hidden" // Hidden by default until real logo is added
                        onError={(e) => e.target.style.display = 'none'}
                    />

                    <h1 className="text-lg font-bold uppercase tracking-wide text-gray-900 font-serif">Bells University of Technology, Ota, Ogun State</h1>
                    <p className="text-sm font-bold uppercase text-gray-700 font-serif">College of Engineering</p>
                    <p className="text-xs font-bold uppercase text-gray-600 font-serif">Department of Computer Engineering</p>
                </div>

                {/* Student Details Strip */}
                <div className="flex flex-wrap justify-between items-center text-[10px] sm:text-xs font-bold border-y border-gray-300 py-2 mt-4 font-sans">
                    <div className="w-full sm:w-auto mb-1 sm:mb-0"><span className="text-gray-500 mr-1">Name:</span> {student?.full_name || 'OLAYANJU AYOBAMI ABRAHAM'}</div>
                    <div className="w-full sm:w-auto mb-1 sm:mb-0"><span className="text-gray-500 mr-1">Matric No:</span> {student?.matric_no || '2024/13522'}</div>
                    <div className="w-full sm:w-auto mb-1 sm:mb-0"><span className="text-gray-500 mr-1">Level:</span> 200</div>
                    <div className="w-full sm:w-auto mb-1 sm:mb-0"><span className="text-gray-500 mr-1">Session:</span> 2024/2025</div>
                    <div className="w-full sm:w-auto"><span className="text-gray-500 mr-1">Semester:</span> FIRST</div>
                </div>
            </div>

            {/* Title */}
            <h2 className="text-center font-bold text-base uppercase mb-6 font-sans tracking-wider border-b border-gray-200 pb-2 w-fit mx-auto">Course Registration</h2>

            {/* Course Table */}
            <div className="border border-gray-300 rounded-sm overflow-hidden mb-8">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-300">
                            <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase border-r border-gray-300 w-1/4">Course Code</th>
                            <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase border-r border-gray-300 w-1/2">Course Title</th>
                            <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase text-center w-1/4">Units</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {courses.length > 0 ? (
                            courses.map((course, index) => (
                                <tr key={course.id || index} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-2.5 text-xs font-bold text-gray-800 border-r border-gray-200 font-mono">{course.code}</td>
                                    <td className="px-4 py-2.5 text-xs font-medium text-gray-700 border-r border-gray-200 uppercase">{course.name}</td>
                                    <td className="px-4 py-2.5 text-xs font-bold text-gray-800 text-center">{course.credit_unit}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="px-4 py-8 text-center text-xs text-gray-400 italic">No courses registered.</td>
                            </tr>
                        )}
                        <tr className="bg-gray-50 border-t-2 border-gray-300">
                            <td colSpan="2" className="px-4 py-3 text-right text-xs font-bold text-gray-900 uppercase">Total Units Registered:</td>
                            <td className="px-4 py-3 text-center text-sm font-black text-gray-900">{totalUnits}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-4 gap-4 mt-16 pt-8 text-center bg-transparent">
                <div className="flex flex-col items-center">
                    <div className="w-full h-px bg-black mb-2"></div>
                    <p className="text-[10px] font-bold uppercase text-gray-900">Student</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-full h-px bg-black mb-2"></div>
                    <p className="text-[10px] font-bold uppercase text-gray-900">Course Advisor</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-full h-px bg-black mb-2"></div>
                    <p className="text-[10px] font-bold uppercase text-gray-900">Head of Department</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-full h-px bg-black mb-2"></div>
                    <p className="text-[10px] font-bold uppercase text-gray-900">College Dean</p>
                </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mt-12">
                <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <QRCodeSVG value={qrValue} size={96} />
                </div>
            </div>

            <div className="text-center mt-4">
                <p className="text-[8px] text-gray-400 font-mono">Generated via Student Portal • {new Date().toLocaleDateString()}</p>
            </div>
        </div>
    );
};

export default CourseRegistrationForm;
