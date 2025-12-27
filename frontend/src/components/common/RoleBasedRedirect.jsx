import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RoleBasedRedirect = () => {
    const { user, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && isAuthenticated && user) {
            if (user.isAdmin) {
                navigate('/admin', { replace: true });
            } else {
                navigate('/user', { replace: true });
            }
        }
    }, [loading, isAuthenticated, user, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
            Loading your environment...
        </div>
    );
};

export default RoleBasedRedirect;
