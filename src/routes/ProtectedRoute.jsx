import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { FullPageSpinner } from '@/components/common/LoadingSpinner';

export function ProtectedRoute({ children }) {
  const { session, loading } = useAuthStore();
  const location = useLocation();

  if (loading) return <FullPageSpinner />;

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function AdminRoute({ children }) {
  const { session, loading } = useAuthStore();
  const location = useLocation();

  if (loading) return <FullPageSpinner />;

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check happens at component level via useBank().role
  return children;
}

export function PublicRoute({ children }) {
  const { session, loading } = useAuthStore();

  if (loading) return <FullPageSpinner />;

  if (session) {
    return <Navigate to="/" replace />;
  }

  return children;
}
