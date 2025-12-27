import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const UserRoute = () => {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#0f172a'
            }}>
                <div style={{ color: 'white' }}>Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Allow if user is staff (not admin)
    if (user?.role === 'staff' && !user?.isAdmin) {
        return <Outlet />;
    }

    // Redirect admins to admin dashboard
    if (user?.isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    // Default: not authorized
    return <Navigate to="/login" replace />;
};

export default UserRoute;
