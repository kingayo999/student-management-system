import React from 'react';
import { Home, AlertCircle } from 'lucide-react';

const Accommodation = () => {
    return (
        <div className="space-y-8 animate-slide-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-primary-100/50">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="w-10 sm:w-12 h-1 bg-accent-500 rounded-full"></span>
                        <p className="text-[9px] sm:text-[10px] font-black text-primary-500 uppercase tracking-[0.4em]">Student Housing</p>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-primary-950 tracking-tighter italic font-heading">
                        Accommodation
                    </h1>
                </div>
            </div>

            <div className="academic-card p-12 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center">
                    <Home className="w-10 h-10 text-primary-400" />
                </div>
                <h2 className="text-xl font-black text-primary-950 uppercase tracking-tight">Hostel Allocation</h2>
                <p className="text-gray-500 max-w-md">
                    Accommodation status and hostel allocation details will be displayed here once the portal is fully synchronized with the Student Affairs database.
                </p>
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100 text-amber-600 text-xs font-bold uppercase tracking-widest">
                    <AlertCircle className="w-4 h-4" />
                    Pending Allocation
                </div>
            </div>
        </div>
    );
};

export default Accommodation;
