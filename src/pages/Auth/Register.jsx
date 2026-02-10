import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, User, Mail, Lock, Loader2, CheckCircle } from 'lucide-react';
import logo from '../../assets/bells-logo.jpg';
import { handleError, isValidEmail, validatePassword } from '../../utils/errorHandler';
import { ROLES } from '../../constants';


const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        role: ROLES.STUDENT
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Client-side validation
        if (!formData.fullName || formData.fullName.trim().length < 3) {
            setError('Please enter your full name (at least 3 characters).');
            return;
        }

        if (!isValidEmail(formData.email)) {
            setError('Please enter a valid email address.');
            return;
        }

        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
            setError(passwordValidation.message);
            return;
        }

        setLoading(true);

        try {
            const { error: signUpError } = await signUp(formData.email, formData.password, {
                full_name: formData.fullName,
                role: formData.role
            });

            if (signUpError) throw signUpError;

            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(handleError(err, 'register'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden font-sans">
            {/* Left Column: Visual Brand Experience */}
            <div className="hidden lg:flex lg:w-1/2 bg-primary-950 relative overflow-hidden items-center justify-center p-20">
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:32px_32px]"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/20 via-transparent to-primary-500/10 active:opacity-50 transition-opacity"></div>

                {/* Floating Elements */}
                <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-indigo-600 rounded-full blur-[140px] opacity-30 animate-pulse"></div>
                <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-primary-400 rounded-full blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '3s' }}></div>

                <div className="relative z-10 text-center space-y-12">
                    <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl shadow-black/50 inline-block -rotate-3 hover:rotate-0 transition-transform duration-700">
                        <img src={logo} alt="Bells University Logo" className="w-32 h-32 object-cover rounded-[2rem]" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-7xl font-black text-white tracking-tighter italic uppercase font-heading leading-none">
                            Join <span className="text-accent-500">Bells</span>
                        </h1>
                        <p className="text-primary-400 font-black text-xs uppercase tracking-[0.5em]">Global Academic Registry Initiative</p>
                    </div>
                    <div className="flex items-center gap-4 justify-center">
                        <div className="h-0.5 w-12 bg-primary-500 rounded-full shadow-[0_0_10px_#6366f1]"></div>
                        <div className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Identity Protocol Entrance</div>
                        <div className="h-0.5 w-12 bg-primary-500 rounded-full shadow-[0_0_10px_#6366f1]"></div>
                    </div>
                </div>

                {/* Bottom Stats Badge */}
                <div className="absolute bottom-12 left-12 right-12 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/10">
                        <div className="w-2 h-2 rounded-full bg-accent-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Enrollment Node: Online</span>
                    </div>
                    <div className="text-[9px] font-black text-primary-600 uppercase tracking-[0.4em]">Official Bellstech API</div>
                </div>
            </div>

            {/* Right Column: Portal Registration */}
            <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-24 bg-gray-50/30 relative overflow-y-auto">
                <div className="sm:mx-auto sm:w-full sm:max-w-md my-12">
                    {/* Mobile Only Header */}
                    <div className="lg:hidden text-center mb-12">
                        <div className="bg-white p-3 rounded-3xl shadow-xl inline-block mb-6 border border-primary-100">
                            <img src={logo} alt="Bells University Logo" className="w-16 h-16 object-cover rounded-2xl" />
                        </div>
                        <h2 className="text-4xl font-black text-primary-950 tracking-tighter uppercase italic">Join Bells</h2>
                    </div>

                    <div className="space-y-3 mb-10">
                        <div className="flex items-center gap-3">
                            <span className="w-10 h-1 bg-primary-950 rounded-full"></span>
                            <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em]">Configuration</p>
                        </div>
                        <h2 className="text-4xl font-black text-primary-950 tracking-tighter font-heading italic">Account <span className="text-primary-600">Request</span></h2>
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-widest leading-loose">Initialize your digital identity within the university's central management mainframe.</p>
                    </div>

                    <div className="academic-card p-1 shadow-2xl shadow-primary-900/10 mb-20 md:mb-0">
                        <div className="bg-white rounded-[1.75rem] p-6 sm:p-10">
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                {success && (
                                    <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex items-center gap-4 animate-in fade-in duration-300">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <p className="text-[11px] font-black text-emerald-800 uppercase tracking-tight">Registration successful! Redirecting to login...</p>
                                    </div>
                                )}

                                {error && (
                                    <div className="bg-red-50 border border-red-100 p-5 rounded-2xl flex items-center gap-4 animate-in fade-in duration-300">
                                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Lock className="w-5 h-5 text-red-600" />
                                        </div>
                                        <p className="text-[11px] font-black text-red-800 uppercase tracking-tight">{error}</p>
                                    </div>
                                )}

                                <div className="space-y-5">
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-primary-950 uppercase tracking-[0.2em] mb-2 ml-1">Legal Identity (Full Name)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-gray-300 group-focus-within:text-primary-600 transition-colors" />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                className="w-full pl-16 pr-8 py-5 bg-gray-50/50 rounded-2xl border border-gray-100 focus:bg-white focus:border-primary-600 focus:ring-4 focus:ring-primary-100/50 outline-none text-sm font-bold text-primary-950 transition-all placeholder:text-gray-300"
                                                placeholder="e.g. Olayinka Gabriel"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-[10px] font-black text-primary-950 uppercase tracking-[0.2em] mb-2 ml-1">Portal Identifier (Email)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-gray-300 group-focus-within:text-primary-600 transition-colors" />
                                            </div>
                                            <input
                                                type="email"
                                                required
                                                className="w-full pl-16 pr-8 py-5 bg-gray-50/50 rounded-2xl border border-gray-100 focus:bg-white focus:border-primary-600 focus:ring-4 focus:ring-primary-100/50 outline-none text-sm font-bold text-primary-950 transition-all placeholder:text-gray-300"
                                                placeholder="you@bellsuniversity.edu.ng"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-[10px] font-black text-primary-950 uppercase tracking-[0.2em] mb-2 ml-1">Secure Key (Password)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-300 group-focus-within:text-primary-600 transition-colors" />
                                            </div>
                                            <input
                                                type="password"
                                                required
                                                minLength={6}
                                                className="w-full pl-16 pr-8 py-5 bg-gray-50/50 rounded-2xl border border-gray-100 focus:bg-white focus:border-primary-600 focus:ring-4 focus:ring-primary-100/50 outline-none text-sm font-bold text-primary-950 transition-all placeholder:text-gray-300"
                                                placeholder="Min. 6 characters"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-[10px] font-black text-primary-950 uppercase tracking-[0.2em] mb-2 ml-1">Authorized Protocol (Account Type)</label>
                                        <div className="flex gap-2">
                                            {[ROLES.STUDENT, ROLES.STAFF, ROLES.ADMIN].map((role) => (
                                                <button
                                                    key={role}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, role })}
                                                    className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.role === role
                                                        ? 'bg-primary-950 text-white shadow-lg shadow-primary-950/20'
                                                        : 'bg-gray-50 text-primary-400 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {role}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-primary w-full py-5 !rounded-2xl group relative overflow-hidden active:scale-95 transition-all shadow-xl shadow-primary-900/20"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-3">
                                            {loading ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    Initialize Enrollment
                                                    <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                </>
                                            )}
                                        </span>
                                    </button>
                                </div>
                            </form>

                            <div className="mt-10 text-center border-t border-gray-50 pt-8">
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                    Already Registered?{' '}
                                    <Link to="/login" className="text-primary-700 hover:text-primary-950 transition-colors font-black underline decoration-primary-700/30 decoration-2 underline-offset-8">
                                        Establish Connection
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Security Note */}
                <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">Official Registration Node • Bells University Mainframe</p>
                </div>
            </div>
        </div>
    );
};

export default Register;
