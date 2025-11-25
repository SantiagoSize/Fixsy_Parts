import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types/auth';

type GuardProps = { element: React.ReactElement; redirectTo?: string };

export function PrivateRoute({ element, redirectTo = '/login' }: GuardProps) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;
  return element;
}

type RoleRouteProps = GuardProps & { allowed: Role[] };

export function RoleRoute({ element, allowed, redirectTo = '/' }: RoleRouteProps) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowed.includes(user.role)) return <Navigate to={redirectTo} replace />;
  return element;
}
