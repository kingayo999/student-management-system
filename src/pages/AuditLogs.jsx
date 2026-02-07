import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { History, Search, Filter, Shield, User, Database, Clock, X } from 'lucide-react';

const AuditLogs = () => {
    const { profile } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [entityFilter, setEntityFilter] = useState('all');

    useEffect(() => {
        fetchLogs();
    }, [entityFilter]);

    const fetchLogs = async () => {
        try {
            let query = supabase
                .from('audit_logs')
                .select(`
                    *,
                    profiles:actor_id (full_name, role)
                `)
                .order('created_at', { ascending: false });

            if (entityFilter !== 'all') {
                query = query.eq('entity', entityFilter);
            }

            const { data, error } = await query.limit(100);
            if (error) throw error;
            setLogs(data || []);
        } catch (err) {
            console.error('Error fetching logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action) => {
        if (action.includes('create')) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        if (action.includes('delete') || action.includes('deactivate')) return 'bg-red-50 text-red-700 border-red-100';
        if (action.includes('update') || action.includes('edit')) return 'bg-indigo-50 text-indigo-700 border-indigo-100';
        return 'bg-gray-50 text-gray-700 border-gray-100';
    };

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-12">
            {/* High-Fidelity Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-6 border-b border-primary-100/50">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="w-12 h-1 bg-primary-950 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]"></span>
                        <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em]">Mainframe Audit</p>
                    </div>
                    <h1 className="text-5xl font-black text-primary-950 tracking-tighter italic font-heading">
                        Security <span className="text-primary-600">Protocol</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4 bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100/50">
                    <Shield className="w-5 h-5 text-emerald-600 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">System Integrity: Nominal</span>
                </div>
            </div>

            {/* Premium Search & Filter Bar */}
            <div className="academic-card p-4 flex flex-col md:flex-row gap-4 items-center bg-white shadow-2xl shadow-primary-950/5">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 transition-colors group-focus-within:text-primary-600" />
                    <input
                        type="text"
                        placeholder="Intercept records by action, entity ID or authorized actor..."
                        className="w-full pl-16 pr-8 py-5 bg-transparent rounded-2xl focus:outline-none font-medium placeholder:text-gray-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 px-6 py-4 bg-primary-50 rounded-2xl border border-primary-100/50 min-w-[260px]">
                    <Filter className="w-4 h-4 text-primary-600" />
                    <select
                        className="bg-transparent text-[10px] font-black text-primary-900 uppercase tracking-widest focus:outline-none flex-1 appearance-none cursor-pointer"
                        value={entityFilter}
                        onChange={(e) => setEntityFilter(e.target.value)}
                    >
                        <option value="all">Global Matrix</option>
                        <option value="students">Student Ledger</option>
                        <option value="courses">Academic Catalog</option>
                        <option value="student_courses">Enrollment Node</option>
                        <option value="profiles">Identity Matrix</option>
                    </select>
                </div>
            </div>

            {/* Refined Audit Ledger */}
            <div className="academic-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-primary-950 text-white uppercase tracking-[0.25em] text-[9px] font-black">
                            <tr>
                                <th className="px-10 py-7">Access Timestamp</th>
                                <th className="px-10 py-7">Authorized Actor</th>
                                <th className="px-10 py-7">Action Protocol</th>
                                <th className="px-10 py-7">Entity Class</th>
                                <th className="px-10 py-7 text-right">Reference ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary-50">
                            {loading ? (
                                [1, 2, 3, 4, 5, 6].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-10 py-8 bg-gray-50/20"></td>
                                    </tr>
                                ))
                            ) : filteredLogs.length > 0 ? (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-primary-50/20 transition-all group duration-500">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3 text-xs font-bold text-gray-400 group-hover:text-primary-600 transition-colors">
                                                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-white group-hover:shadow-lg transition-all">
                                                    <Clock className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-primary-950 font-black">{new Date(log.created_at).toLocaleDateString()}</span>
                                                    <span className="text-[10px] font-medium tracking-widest">{new Date(log.created_at).toLocaleTimeString()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-800 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-primary-900/10 group-hover:rotate-6 transition-transform">
                                                    {log.profiles?.full_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-primary-950 uppercase tracking-tight">{log.profiles?.full_name}</p>
                                                    <p className="text-[9px] font-black text-primary-400 uppercase tracking-widest mt-0.5">{log.profiles?.role} AUTH</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${getActionColor(log.action)}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${log.action.includes('delete') ? 'bg-red-500 animate-pulse' : log.action.includes('create') ? 'bg-emerald-500' : 'bg-indigo-500'}`}></span>
                                                {log.action.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3 text-xs font-black text-primary-700 uppercase tracking-widest">
                                                <Database className="w-3.5 h-3.5 text-primary-300" />
                                                {log.entity.replace('_', ' ')}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <code className="text-[10px] font-mono font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 group-hover:text-primary-600 group-hover:border-primary-100 transition-all">
                                                #{log.entity_id?.substring(0, 12)}...
                                            </code>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-10 py-32 text-center">
                                        <div className="max-w-xs mx-auto text-center">
                                            <div className="bg-primary-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary-100 shadow-inner">
                                                <X className="w-10 h-10 text-primary-200" />
                                            </div>
                                            <h3 className="text-primary-950 font-black text-xl mb-2 tracking-tight font-heading uppercase italic">Zero Data Capture</h3>
                                            <p className="text-gray-500 text-sm font-medium">No encrypted protocol records match your current intercept parameters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer Cryptography Note */}
            <div className="flex items-center justify-center gap-6 pt-8 border-t border-primary-50">
                <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-primary-400" />
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">End-to-End Encrypted Logs</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-primary-100"></div>
                <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-primary-400" />
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Immutable Cold Storage</span>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
