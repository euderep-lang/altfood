import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useDoctor() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['doctor', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      return data?.[0] ?? null;
    },
    enabled: !!user,
    retry: false,
  });
}
