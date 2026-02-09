import React, { useState } from 'react';
import { CreditCard, History, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Payments = () => {
    const { profile } = useAuth();
    const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'

    // Mock Data for Payment History
    const paymentHistory = [
        { id: 1, purpose: 'Tuition Fee 2025/2026', amount: '500,000.00', date: '2025-09-15', status: 'successful', ref: 'REF-839201' },
        { id: 2, purpose: 'Acceptance Fee', amount: '50,000.00', date: '2025-08-20', status: 'successful', ref: 'REF-112394' },
    ];

    return (
        <div className="space-y-8 animate-slide-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-primary-100/50">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="w-10 sm:w-12 h-1 bg-accent-500 rounded-full"></span>
                        <p className="text-[9px] sm:text-[10px] font-black text-primary-500 uppercase tracking-[0.4em]">Bursary Portal</p>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-primary-950 tracking-tighter italic font-heading">
                        Payments
                    </h1>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-4 p-1 bg-primary-100/50 rounded-[1.25rem] w-fit">
                <button
                    onClick={() => setActiveTab('new')}
                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'new' ? 'bg-white text-primary-950 shadow-lg' : 'text-primary-500 hover:text-primary-700'}`}
                >
                    <CreditCard className="w-4 h-4" />
                    Make New Payment
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-white text-primary-950 shadow-lg' : 'text-primary-500 hover:text-primary-700'}`}
                >
                    <History className="w-4 h-4" />
                    Payment History
                </button>
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {activeTab === 'new' && (
                    <>
                        <div className="lg:col-span-2 academic-card p-8 sm:p-10 space-y-8">
                            <div>
                                <h3 className="text-xl font-black text-primary-950 uppercase tracking-tight mb-2">Initiate Transaction</h3>
                                <p className="text-sm text-gray-500">Select a payment category to proceed with your transaction securely via Paystack.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {['Tuition Fee', 'Medical Fee', 'Hostel Fee', 'Convocation Fee'].map((fee) => (
                                    <button key={fee} className="p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-primary-200 hover:shadow-xl transition-all text-left group">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:bg-primary-50 transition-colors">
                                            <TrendingUp className="w-5 h-5 text-primary-400 group-hover:text-primary-600" />
                                        </div>
                                        <p className="font-bold text-primary-950 mb-1">{fee}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select to Pay</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <div className="bg-primary-950 rounded-[2rem] p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/10 rounded-full blur-3xl"></div>
                                <h3 className="text-lg font-black uppercase tracking-widest mb-6 relative z-10">Payment Summary</h3>
                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-center py-4 border-b border-white/10">
                                        <span className="text-xs font-bold text-primary-300">Outstanding Balance</span>
                                        <span className="text-xl font-black">₦ 0.00</span>
                                    </div>
                                    <div className="flex justify-between items-center py-4 border-b border-white/10">
                                        <span className="text-xs font-bold text-primary-300">Last Payment</span>
                                        <span className="text-sm font-bold">15 Sept, 2025</span>
                                    </div>
                                </div>
                                <button className="w-full mt-8 py-4 bg-accent-500 text-primary-950 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all shadow-lg active:scale-95">
                                    View Statement
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'history' && (
                    <div className="lg:col-span-3 academic-card p-0 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-primary-50 text-primary-950 uppercase tracking-widest text-[9px] font-black">
                                <tr>
                                    <th className="px-8 py-6">Reference</th>
                                    <th className="px-8 py-6">Purpose</th>
                                    <th className="px-8 py-6">Date</th>
                                    <th className="px-8 py-6">Amount (NGN)</th>
                                    <th className="px-8 py-6 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paymentHistory.map((txn) => (
                                    <tr key={txn.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6 font-mono text-xs font-bold text-gray-500">{txn.ref}</td>
                                        <td className="px-8 py-6 font-bold text-primary-950">{txn.purpose}</td>
                                        <td className="px-8 py-6 text-sm text-gray-600">{txn.date}</td>
                                        <td className="px-8 py-6 font-mono text-sm font-black text-primary-950">{txn.amount}</td>
                                        <td className="px-8 py-6 text-right">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${txn.status === 'successful' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                                }`}>
                                                {txn.status === 'successful' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                {txn.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Payments;
