import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';
import Unauthorized from '../pages/Unauthorized';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return <Loading />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check if account is active (Soft Delete enforcement)
    if (profile?.role === 'student' && (profile?.isDeleted || profile?.studentStatus === 'inactive')) {
        return <Unauthorized message="Your student account has been deactivated. Please contact the administrative office." />;
    }

    if (allowedRoles && !allowedRoles.includes(profile?.role)) {
        return <Unauthorized />;
    }


    return <Outlet />;
};

export default ProtectedRoute;
