import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    History,
    LogOut,
    Bell,
    Menu,
    X,
    Clock,
    Shield,
    CreditCard,
    FileText,
    Home
} from 'lucide-react';
import logo from '../../assets/bells-logo.jpg';

const Layout = ({ children }) => {
    const { profile, signOut } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navigation = [];

    if (profile?.role === 'admin' || profile?.role === 'staff') {
        navigation.push(
            { name: 'Dashboard', href: '/', icon: LayoutDashboard },
            { name: 'Student Directory', href: '/students', icon: Users },
            { name: 'Academic Courses', href: '/courses', icon: BookOpen }
        );
        if (profile?.role === 'admin') {
            navigation.push({ name: 'Security Logs', href: '/audit', icon: History });
        }
    } else {
        // Student Navigation
        navigation.push(
            { name: 'Dashboard', href: '/', icon: Home },
            { name: 'My Courses', href: '/courses', icon: BookOpen },
            { name: 'Payments', href: '/payments', icon: CreditCard },
            { name: 'Semester Result', href: '/result', icon: FileText },
            { name: 'Accommodation', href: '/accommodation', icon: Home }, // Using Home icon as placeholder for Bed/Hostel if not available
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 selection:bg-primary-100 selection:text-primary-900">
            {/* Mobile Menu Button - Premium Style */}
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden fixed top-3 left-3 z-50 p-3 bg-primary-950 text-white rounded-xl shadow-2xl active:scale-90 transition-all duration-300 border border-white/10 backdrop-blur-md"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Backdrop Blur Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-primary-950/20 backdrop-blur-md z-40 lg:hidden animate-in fade-in duration-500"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar - The Command Center */}
            <aside className={`
                fixed inset-y-0 left-0 w-80 bg-primary-950 text-white z-50 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Decorative Elements */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary-600/10 rounded-full blur-[80px]"></div>

                <div className="flex flex-col h-full relative z-10">
                    {/* Brand Header */}
                    <div className="p-8 lg:p-10 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3 lg:gap-4 group">
                            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white rounded-xl lg:rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-black/40 overflow-hidden border border-primary-800 p-1 group-hover:rotate-3 transition-transform duration-500">
                                <img src={logo} alt="Bells University Logo" className="w-full h-full object-cover rounded-lg" />
                            </div>
                            <div>
                                <h1 className="text-xl lg:text-2xl font-black tracking-tighter leading-none italic uppercase font-heading">
                                    Bells<span className="text-accent-500">tech</span>
                                </h1>
                                <p className="text-[9px] lg:text-[10px] uppercase font-black tracking-[0.3em] text-primary-400 mt-1 lg:mt-1.5 flex items-center gap-1.5">
                                    <span className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-primary-500"></span>
                                    Registry Portal
                                </p>
                            </div>
                        </Link>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-primary-400 hover:text-white transition-colors bg-white/5 p-2 rounded-xl">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation - High End Menu */}
                    <nav className="flex-1 px-6 space-y-3 mt-4">
                        <p className="px-4 text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-4 ml-1">Main Protocol</p>
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`flex items-center gap-4 px-6 py-4.5 rounded-[1.25rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 group relative overflow-hidden ${isActive
                                        ? 'bg-gradient-to-r from-primary-900 to-primary-950 text-white shadow-xl border border-white/5'
                                        : 'text-primary-400 hover:text-white hover:bg-white/[0.03]'
                                        }`}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent-500 rounded-r-full shadow-[0_0_15px_#f59e0b]"></div>
                                    )}
                                    <item.icon className={`w-5 h-5 transition-all duration-500 ${isActive ? 'text-accent-500 scale-110' : 'text-primary-500 group-hover:text-primary-300'}`} />
                                    {item.name}
                                    {!isActive && (
                                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-1 h-1 rounded-full bg-primary-400"></div>
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Profile System Section */}
                    <div className="p-8 mt-auto">
                        <div className="bg-gradient-to-b from-primary-900/40 to-primary-950/60 rounded-[2rem] p-6 border border-white/[0.03] backdrop-blur-xl shadow-inner relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-500/5 rounded-full blur-2xl group-hover:bg-accent-500/10 transition-colors"></div>

                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                <Link to="/profile" className="relative">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center text-primary-950 font-black text-sm shadow-xl shadow-black/20 uppercase ring-2 ring-white/10 group-hover:ring-accent-500/30 transition-all">
                                        {profile?.full_name?.charAt(0)}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-primary-950 rounded-full"></div>
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-black text-white truncate uppercase tracking-tight leading-none">{profile?.full_name}</p>
                                    <p className="text-[9px] font-bold text-primary-500 truncate uppercase mt-1.5 flex items-center gap-1.5">
                                        <Shield className="w-3 h-3 text-accent-500" />
                                        {profile?.role} Auth
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={signOut}
                                className="w-full flex items-center justify-center gap-3 px-5 py-4 bg-red-500/5 hover:bg-red-500 text-red-400 hover:text-white rounded-[1rem] text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 border border-red-500/10 hover:border-red-500 shadow-lg shadow-red-500/5 active:scale-95 group/logout"
                            >
                                <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                                Terminate Session
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Application Area */}
            <main className="lg:pl-80 min-h-screen transition-all duration-700">
                {/* Visual Header - High Fidelity */}
                <header className="h-[70px] lg:h-[100px] bg-white/[0.02] backdrop-blur-3xl border-b border-primary-100/10 flex items-center justify-between px-4 sm:px-6 lg:px-12 sticky top-0 z-40 relative">
                    <div className="flex items-center gap-4 pl-12 lg:pl-0">
                        {/* Top Navigation for Students - Hidden on Mobile, Visible on Desktop */}
                        {profile?.role === 'student' && (
                            <div className="hidden lg:flex items-center gap-6 mr-8">
                                <Link to="/" className="text-sm font-bold text-primary-600 hover:text-accent-500 transition-colors">Home</Link>
                                <Link to="/courses" className="text-sm font-bold text-primary-600 hover:text-accent-500 transition-colors">Courses</Link>
                                <Link to="/news" className="text-sm font-bold text-primary-600 hover:text-accent-500 transition-colors">News</Link>
                                <Link to="/support" className="text-sm font-bold text-primary-600 hover:text-accent-500 transition-colors">Support</Link>
                            </div>
                        )}
                        <div className="hidden sm:flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-primary-50 shadow-sm">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></div>
                            <span className="text-[10px] font-black text-primary-900 uppercase tracking-[0.2em]">Registry Core v2.0</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 lg:gap-8">
                        <div className="hidden lg:flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-r border-gray-100 pr-8">
                            <Clock className="w-4 h-4 text-primary-400" />
                            {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}
                        </div>

                        <div className="flex items-center gap-3 lg:gap-4">
                            <button className="p-3 lg:p-3.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl lg:rounded-2xl transition-all relative group">
                                <div className="absolute top-3.5 right-3.5 w-2 h-2 bg-accent-500 rounded-full border-2 border-white ring-2 ring-accent-500/20 group-hover:scale-110 transition-transform"></div>
                                <Bell className="w-5 h-5" />
                            </button>
                            <Link to="/profile" className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl overflow-hidden border-2 border-white shadow-xl hover:border-primary-200 transition-all active:scale-95">
                                <div className="w-full h-full bg-primary-100 flex items-center justify-center text-primary-700 font-black text-xs lg:text-sm uppercase">
                                    {profile?.full_name?.charAt(0)}
                                </div>
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="p-4 sm:p-6 lg:p-14 max-w-[1700px] mx-auto animate-slide-up">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
