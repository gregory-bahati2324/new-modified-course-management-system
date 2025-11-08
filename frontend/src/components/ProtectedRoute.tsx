import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem('auth_token');
  const userRole = localStorage.getItem('user_role');

  // Check if user is authenticated
  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  // Check if user has the required role
  if (userRole && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === 'instructor') {
      return <Navigate to="/instructor" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
