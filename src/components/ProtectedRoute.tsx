import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user, isAuthenticated } = useAuth();

    // Debug
    console.log("🛡️ ProtectedRoute Check");
    console.log("User:", user);
    console.log("Authenticated:", isAuthenticated);
    console.log("Allowed Roles:", allowedRoles);

    if (!isAuthenticated || !user) {
        console.log("No autenticado - Redirigiendo a login");
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        // Case insensitive role check
        const userRole = user.role.toLowerCase();
        const hasPermission = allowedRoles.some(role => role.toLowerCase() === userRole);

        if (!hasPermission) {
            console.log("Acceso denegado. Rol:", user.role, "Permitido:", allowedRoles);
            return <Navigate to="/" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
