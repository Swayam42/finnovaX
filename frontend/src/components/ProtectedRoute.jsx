import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, getRoleDefaultRoute } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, isLoading, isAuthenticated } = useAuth();
    const location = useLocation();

    // While session is being restored from localStorage, shows a centered spinner
    if (isLoading) {
        return (
            <div>
                <div>
                    <div  />
                    <p>Validating session...</p>
                </div>
            </div>
        );
    }

    // Not authenticated then redirect to /login, preserving the intended destination
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Authenticated but wrong role then redirect to their default home
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={getRoleDefaultRoute(user.role)} replace />;
    }

    return children;
};

export default ProtectedRoute;
