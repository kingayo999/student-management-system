import React, { useState, useEffect } from 'react';
import { CreditCard, History, CheckCircle, Clock, AlertCircle, TrendingUp, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePayments } from '../../hooks/usePayments';
import ErrorMessage from '../../components/common/ErrorMessage';
import { ROLES } from '../../constants';

const Payments = () => {
    const { profile } = useAuth();
    const { payments, loading, error, fetchPayments, recordPayment } = usePayments();
    const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'
    const [processingId, setProcessingId] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const handlePayment = async (purpose, amount) => {
        if (!window.confirm(`Are you sure you want to pay ₦${amount} for ${purpose}?`)) return;

        setProcessingId(purpose);
        setSuccessMsg('');

        try {
            await recordPayment({
                amount: amount.replace(/,/g, ''), // Remove commas
                purpose
            });
            setSuccessMsg(`Payment for ${purpose} was successful!`);
            setActiveTab('history');
        } catch (err) {
            // Error handling is managed by the hook and displayed via the clean error state
        } finally {
            setProcessingId(null);
        }
    };

    const fees = [
        { id: 'tuition', name: 'Tuition Fee', amount: '500,000.00' },
        { id: 'medical', name: 'Medical Fee', amount: '30,000.00' },
        { id: 'hostel', name: 'Hostel Fee', amount: '150,000.00' },
        { id: 'convocation', name: 'Convocation Fee', amount: '50,000.00' }
    ];

    const totalPaid = payments
        .filter(p => p.status === 'successful')
        .reduce((sum, p) => sum + Number(p.amount), 0);

    const lastPayment = payments.length > 0 ? new Date(payments[0].date || payments[0].created_at).toLocaleDateString() : 'N/A';

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

            {error && <ErrorMessage message={error} />}
            {successMsg && (
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-center gap-3 border border-emerald-100">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-bold text-sm">{successMsg}</span>
                </div>
            )}

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
                                {fees.map((fee) => (
                                    <button
                                        key={fee.id}
                                        onClick={() => handlePayment(fee.name, fee.amount)}
                                        disabled={!!processingId}
                                        className="p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-primary-200 hover:shadow-xl transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:bg-primary-50 transition-colors">
                                            {processingId === fee.name ? (
                                                <Loader2 className="w-5 h-5 text-accent-500 animate-spin" />
                                            ) : (
                                                <TrendingUp className="w-5 h-5 text-primary-400 group-hover:text-primary-600" />
                                            )}
                                        </div>
                                        <p className="font-bold text-primary-950 mb-1">{fee.name}</p>
                                        <div className="flex justify-between items-end">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select to Pay</p>
                                            <p className="text-sm font-black text-primary-950">₦{fee.amount}</p>
                                        </div>
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
                                        <span className="text-xs font-bold text-primary-300">Total Paid</span>
                                        <span className="text-xl font-black">₦ {totalPaid.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-4 border-b border-white/10">
                                        <span className="text-xs font-bold text-primary-300">Last Payment</span>
                                        <span className="text-sm font-bold">{lastPayment}</span>
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
                        {loading && payments.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 text-sm">Loading payment history...</div>
                        ) : payments.length === 0 ? (
                            <div className="p-12 text-center">
                                <History className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-400 text-sm font-medium">No payment history found.</p>
                            </div>
                        ) : (
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
                                    {payments.map((txn) => (
                                        <tr key={txn.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-6 font-mono text-xs font-bold text-gray-500">{txn.reference}</td>
                                            <td className="px-8 py-6 font-bold text-primary-950">{txn.purpose}</td>
                                            <td className="px-8 py-6 text-sm text-gray-600">
                                                {new Date(txn.payment_date || txn.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6 font-mono text-sm font-black text-primary-950">
                                                {Number(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
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
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Payments;
