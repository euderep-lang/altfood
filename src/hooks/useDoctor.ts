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
        .select('id, user_id, name, email, phone, document_number, document_type, specialty, logo_url, slug, primary_color, secondary_color, subscription_status, subscription_end_date, mp_subscription_id, mp_payer_email, trial_ends_at, created_at, updated_at, bio, whatsapp_link, instagram_link, welcome_message, onboarding_completed, email_weekly_summary, email_tips, referral_code, referred_by, theme_layout, featured_food_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .abortSignal(createTimeoutSignal(15000));

      if (error) throw error;
      return data?.[0] ?? null;
    },
    enabled: !!user,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
    staleTime: 1000 * 30,
  });
}
