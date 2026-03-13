import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading, user } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
