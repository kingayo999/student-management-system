import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import logo from '../../assets/bells-logo.jpg';


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error: signInError } = await signIn(email, password);
            if (signInError) throw signInError;
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden font-sans">
            {/* Left Column: Visual Brand Experience */}
            <div className="hidden lg:flex lg:w-1/2 bg-primary-950 relative overflow-hidden items-center justify-center p-20">
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:32px_32px]"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-600/20 via-transparent to-accent-500/10 active:opacity-50 transition-opacity"></div>

                {/* Floating Elements */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-600 rounded-full blur-[120px] opacity-30 animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500 rounded-full blur-[150px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

                <div className="relative z-10 text-center space-y-12">
                    <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl shadow-black/50 inline-block rotate-3 hover:rotate-0 transition-transform duration-700">
                        <img src={logo} alt="Bells University Logo" className="w-32 h-32 object-cover rounded-[2rem]" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-7xl font-black text-white tracking-tighter italic uppercase font-heading leading-none">
                            Bells<span className="text-accent-500">tech</span>
                        </h1>
                        <p className="text-primary-400 font-black text-xs uppercase tracking-[0.5em]">Official Registry Protocol Interface</p>
                    </div>
                    <div className="flex items-center gap-4 justify-center">
                        <div className="h-0.5 w-12 bg-accent-500 rounded-full"></div>
                        <div className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Bells University of Technology</div>
                        <div className="h-0.5 w-12 bg-accent-500 rounded-full"></div>
                    </div>
                </div>

                {/* Bottom Stats Badge */}
                <div className="absolute bottom-12 left-12 right-12 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/10">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Mainframe Link: Active</span>
                    </div>
                    <div className="text-[9px] font-black text-primary-600 uppercase tracking-[0.4em]">v2.0.4 Release</div>
                </div>
            </div>

            {/* Right Column: Portal Authorization */}
            <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-24 bg-gray-50/30 relative">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    {/* Mobile Only Header */}
                    <div className="lg:hidden text-center mb-12">
                        <div className="bg-white p-3 rounded-3xl shadow-xl inline-block mb-6 border border-primary-100">
                            <img src={logo} alt="Bells University Logo" className="w-16 h-16 object-cover rounded-2xl" />
                        </div>
                        <h2 className="text-4xl font-black text-primary-950 tracking-tighter uppercase italic">Bellstech</h2>
                    </div>

                    <div className="space-y-3 mb-12">
                        <div className="flex items-center gap-3">
                            <span className="w-10 h-1 bg-primary-950 rounded-full"></span>
                            <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em]">Authorization</p>
                        </div>
                        <h2 className="text-4xl font-black text-primary-950 tracking-tighter font-heading italic">Internal <span className="text-primary-600">Access</span></h2>
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-widest leading-loose">Enter your authorized credentials to establish a secure connection with the central registry.</p>
                    </div>

                    <div className="academic-card p-1 shadow-2xl shadow-primary-900/10">
                        <div className="bg-white rounded-[1.75rem] p-6 sm:p-10">
                            <form className="space-y-8" onSubmit={handleSubmit}>
                                {error && (
                                    <div className="bg-red-50 border border-red-100 p-5 rounded-2xl flex items-center gap-4 animate-in fade-in duration-300">
                                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Lock className="w-5 h-5 text-red-600" />
                                        </div>
                                        <p className="text-[11px] font-black text-red-800 uppercase tracking-tight">{error}</p>
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-primary-950 uppercase tracking-[0.2em] mb-3 ml-1">Portal Identifier (Email)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-gray-300 group-focus-within:text-primary-600 transition-colors" />
                                            </div>
                                            <input
                                                type="email"
                                                required
                                                className="w-full pl-16 pr-8 py-5 bg-gray-50/50 rounded-2xl border border-gray-100 focus:bg-white focus:border-primary-600 focus:ring-4 focus:ring-primary-100/50 outline-none text-sm font-bold text-primary-950 transition-all placeholder:text-gray-300"
                                                placeholder="you@bellsuniversity.edu.ng"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-[10px] font-black text-primary-950 uppercase tracking-[0.2em] mb-3 ml-1">Secure Key (Password)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-300 group-focus-within:text-primary-600 transition-colors" />
                                            </div>
                                            <input
                                                type="password"
                                                required
                                                className="w-full pl-16 pr-8 py-5 bg-gray-50/50 rounded-2xl border border-gray-100 focus:bg-white focus:border-primary-600 focus:ring-4 focus:ring-primary-100/50 outline-none text-sm font-bold text-primary-950 transition-all placeholder:text-gray-300"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-primary w-full py-5 !rounded-2xl group relative overflow-hidden active:scale-95 transition-all"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-3">
                                            {loading ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    Authorize Entrance
                                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </span>
                                    </button>
                                </div>
                            </form>

                            <div className="mt-12 text-center border-t border-gray-50 pt-10">
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                    Unregistered Entity?{' '}
                                    <Link to="/register" className="text-primary-700 hover:text-primary-950 transition-colors underline decoration-primary-700/30 decoration-2 underline-offset-8">
                                        Request Portal Access
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Security Note */}
                <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">Official Interface • SSL Encrypted • Bells University Registry</p>
                </div>
            </div>
        </div>
    );
};

export default Login;

