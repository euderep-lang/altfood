import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { createTimeoutSignal } from '@/lib/supabaseHelpers';
import { useAuth } from './useAuth';

export function useDoctor() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['doctor', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('doctors')
        // select('*') evita erro 42703 se favicon_mode/favicon_url ainda não existirem (migração pendente).
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .abortSignal(createTimeoutSignal(8000));

      if (error) throw error;
      return data?.[0] ?? null;
    },
    enabled: !!user,
    networkMode: 'always',
    retry: 1,
    retryDelay: 1000,
    staleTime: 1000 * 30,
  });
}
