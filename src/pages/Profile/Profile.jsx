import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { User, Mail, Shield, Calendar, Edit2, Key, X, Loader2, CheckCircle, ArrowRight, Lock } from 'lucide-react';
import { logAudit } from '../../utils/logger';

const Profile = () => {
    const { profile, user, refreshProfile } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [showEditName, setShowEditName] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [newName, setNewName] = useState(profile?.full_name || '');
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleUpdateName = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: '', text: '' });
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ full_name: newName })
                .eq('id', user.id);

            if (error) throw error;
            await logAudit('update_profile', 'profiles', user.id);
            await refreshProfile();
            setMessage({ type: 'success', text: 'Identity designated successfully' });
            setTimeout(() => {
                setShowEditName(false);
                setMessage({ type: '', text: '' });
            }, 2000);
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            setMessage({ type: 'error', text: 'Security keys do not match' });
            return;
        }

        setSubmitting(true);
        setMessage({ type: '', text: '' });
        try {
            const { error } = await supabase.auth.updateUser({ password: passwords.new });
            if (error) throw error;
            await logAudit('change_password', 'profiles', user.id);
            setMessage({ type: 'success', text: 'Security key rotated successfully' });
            setTimeout(() => {
                setShowChangePassword(false);
                setPasswords({ new: '', confirm: '' });
                setMessage({ type: '', text: '' });
            }, 2000);
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* High-Fidelity Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-6 border-b border-primary-100/50">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="w-12 h-1 bg-primary-950 rounded-full"></span>
                        <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em]">Personal Protocol</p>
                    </div>
                    <h1 className="text-5xl font-black text-primary-950 tracking-tighter italic font-heading">
                        User <span className="text-primary-600">Command</span>
                    </h1>
                </div>
            </div>

            {/* Profile Matrix Card */}
            <div className="academic-card overflow-hidden group">
                <div className="h-40 bg-gradient-to-r from-primary-900 via-primary-950 to-indigo-950 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl"></div>
                </div>

                <div className="px-10 pb-12 relative">
                    <div className="flex flex-col md:flex-row md:items-end gap-8 -mt-16 mb-12">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-white p-2 shadow-2xl relative group/avatar">
                            <div className="w-full h-full rounded-[2rem] bg-gradient-to-br from-primary-600 to-indigo-800 flex items-center justify-center text-white text-4xl font-black shadow-inner">
                                {profile?.full_name?.charAt(0)}
                            </div>
                            <div className="absolute bottom-1 right-1 w-8 h-8 bg-emerald-500 border-4 border-white rounded-2xl shadow-lg"></div>
                        </div>
                        <div className="space-y-2 flex-1">
                            <h2 className="text-3xl font-black text-primary-950 tracking-tighter uppercase italic font-heading">{profile?.full_name}</h2>
                            <div className="flex flex-wrap gap-4">
                                <span className="flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-xl text-[10px] font-black text-primary-700 uppercase tracking-widest border border-primary-100/50">
                                    <Shield className="w-3.5 h-3.5 text-accent-500" />
                                    {profile?.role} Authorization
                                </span>
                                <span className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-widest border border-gray-100/50">
                                    <Mail className="w-3.5 h-3.5" />
                                    {user?.email}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setNewName(profile?.full_name || '');
                                setShowEditName(true);
                            }}
                            className="btn-primary !py-4 group"
                        >
                            <User className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                            Modify Identity
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-8 rounded-3xl bg-slate-50/50 border border-slate-100 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100">
                                    <Key className="w-4 h-4 text-primary-600" />
                                </div>
                                <h3 className="text-xs font-black text-primary-900 uppercase tracking-widest">Authentication Protocol</h3>
                            </div>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed">Ensure your terminal access is secure by rotating your authorized secure key regularly.</p>
                            <button
                                onClick={() => setShowChangePassword(true)}
                                className="text-[10px] font-black text-primary-700 uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-4 transition-all"
                            >
                                Rotate Access Key <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="p-8 rounded-3xl bg-primary-50/30 border border-primary-50 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white rounded-xl shadow-sm border border-primary-50">
                                    <Calendar className="w-4 h-4 text-primary-600" />
                                </div>
                                <h3 className="text-xs font-black text-primary-900 uppercase tracking-widest">Command History</h3>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-primary-400 uppercase tracking-widest mb-1">Last Entrance Detected</p>
                                <p className="text-sm font-black text-primary-950">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Modals */}
            {(showEditName || showChangePassword) && (
                <div className="fixed inset-0 bg-primary-950/40 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-500">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20 animate-in zoom-in duration-500">
                        <div className="p-10 border-b border-primary-50 flex items-center justify-between bg-gradient-to-br from-primary-900 to-indigo-950 text-white relative">
                            <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
                            <div className="relative z-10">
                                <h2 className="text-2xl font-black tracking-tighter uppercase italic font-heading">
                                    {showEditName ? 'Identity Update' : 'Key Rotation'}
                                </h2>
                                <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mt-1.5">Authorized Protocol</p>
                            </div>
                            <button onClick={() => {
                                setShowEditName(false);
                                setShowChangePassword(false);
                                setMessage({ type: '', text: '' });
                            }} className="text-white/50 hover:text-white transition-colors bg-white/5 p-3 rounded-2xl relative z-10">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-10">
                            {message.text && (
                                <div className={`mb-8 p-5 rounded-2xl border flex items-center gap-4 animate-in slide-in-from-top duration-500 ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
                                    }`}>
                                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                                    <p className="text-[11px] font-black uppercase tracking-tight">{message.text}</p>
                                </div>
                            )}

                            {showEditName ? (
                                <form onSubmit={handleUpdateName} className="space-y-8">
                                    <div>
                                        <label className="block text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-3 ml-1">New Identity Designation</label>
                                        <div className="relative group">
                                            <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary-600 transition-colors" />
                                            <input
                                                required
                                                className="w-full pl-16 pr-8 py-5 bg-gray-50/50 rounded-2xl border border-gray-100 focus:bg-white focus:border-primary-600 focus:ring-4 focus:ring-primary-100/50 outline-none text-sm font-bold text-primary-950 transition-all"
                                                value={newName}
                                                onChange={e => setNewName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <button disabled={submitting} className="btn-primary w-full py-5 !rounded-2xl shadow-xl shadow-primary-900/20 active:scale-95 transition-all">
                                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Identity'}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleUpdatePassword} className="space-y-8">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-3 ml-1">New Secure Key</label>
                                            <div className="relative group">
                                                <Key className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary-600 transition-colors" />
                                                <input
                                                    type="password"
                                                    required
                                                    className="w-full pl-16 pr-8 py-5 bg-gray-50/50 rounded-2xl border border-gray-100 focus:bg-white focus:border-primary-600 focus:ring-4 focus:ring-primary-100/50 outline-none text-sm font-bold text-primary-950 transition-all"
                                                    value={passwords.new}
                                                    onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-3 ml-1">Confirm Matrix Entry</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary-600 transition-colors" />
                                                <input
                                                    type="password"
                                                    required
                                                    className="w-full pl-16 pr-8 py-5 bg-gray-50/50 rounded-2xl border border-gray-100 focus:bg-white focus:border-primary-600 focus:ring-4 focus:ring-primary-100/50 outline-none text-sm font-bold text-primary-950 transition-all"
                                                    value={passwords.confirm}
                                                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button disabled={submitting} className="btn-primary w-full py-5 !rounded-2xl shadow-xl shadow-primary-900/20 active:scale-95 transition-all">
                                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Execute Key Rotation'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
