import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();

  const { data: isAdmin = false, isLoading: roleLoading } = useQuery({
    queryKey: ['user-role-admin', user?.id],
    queryFn: async () => {
      if (!user) return false;

      // Keep owner admin access across separate test/live environments
      await (supabase.rpc as any)('ensure_owner_admin_role');

      const { data, error } = await (supabase.rpc as any)('has_role', {
        _user_id: user.id,
        _role: 'admin',
      });
      if (error) {
        console.error('Admin role check failed:', error.message);
        return false;
      }
      return !!data;
    },
    enabled: !!user,
  });

  return {
    isAdmin,
    loading: authLoading || roleLoading,
    user,
  };
}
