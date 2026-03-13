import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();

  const { data: isAdmin = false, isLoading: roleLoading } = useQuery({
    queryKey: ['user-role-admin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      // Use raw rpc call with type assertion since has_role isn't in generated types
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
