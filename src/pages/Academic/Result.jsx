import React from 'react';
import { FileText, Lock } from 'lucide-react';

const Result = () => {
    return (
        <div className="space-y-8 animate-slide-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-primary-100/50">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="w-10 sm:w-12 h-1 bg-accent-500 rounded-full"></span>
                        <p className="text-[9px] sm:text-[10px] font-black text-primary-500 uppercase tracking-[0.4em]">Academic Records</p>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-primary-950 tracking-tighter italic font-heading">
                        Semester Results
                    </h1>
                </div>
            </div>

            <div className="academic-card p-12 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center shadow-inner">
                    <FileText className="w-10 h-10 text-primary-400" />
                </div>
                <h2 className="text-xl font-black text-primary-950 uppercase tracking-tight">Statement of Result</h2>
                <p className="text-gray-500 max-w-md">
                    Your semester results typically appear here after Senate approval.
                </p>
                <div className="flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-xl border border-gray-200 text-gray-500 text-xs font-bold uppercase tracking-widest">
                    <Lock className="w-4 h-4" />
                    Results Not Yet Published
                </div>
            </div>
        </div>
    );
};

export default Result;
