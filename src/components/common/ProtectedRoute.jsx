import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, profile, role, loading } = useAuth();

    // Fast Path: If we have a profile/role already (from cache), let them through immediately
    // even if background synchronization is still ongoing.
    if (loading && !role) {
        return <Loading />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Role-based access control
    // If we have a user but no profile/role yet, show a re-syncing state instead of redirecting
    if (!role) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="text-center space-y-6 animate-pulse">
                    <Loading />
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-primary-900 uppercase tracking-[0.4em]">Security Handshake</p>
                        <p className="text-sm font-medium text-gray-500">Re-synchronizing Registry... Please wait.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Role-based access control
    // If no roles specified, allow all authenticated users
    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Enforce student status (Active/Inactive/Deleted)
    if (role === 'student' && (profile?.isDeleted || profile?.studentStatus === 'inactive')) {
        return <Navigate
            to="/unauthorized"
            state={{ message: "Your student account has been deactivated. Please contact the administrative office." }}
            replace
        />;
    }


    return <Outlet />;
};

export default ProtectedRoute;
