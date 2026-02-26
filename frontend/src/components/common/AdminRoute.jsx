import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const AdminRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Check strict isAdmin boolean from user object
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.isAdmin !== true) {
        // Authenticated but not admin — send to user dashboard
        return <Navigate to="/user" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
