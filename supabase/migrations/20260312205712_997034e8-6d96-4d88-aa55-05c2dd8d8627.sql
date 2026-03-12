
-- Rate limiting table for signup attempts
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  action text NOT NULL DEFAULT 'signup',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_rate_limits_ip_action ON public.rate_limits (ip_hash, action, created_at);

-- Auto-cleanup old entries (older than 2 hours)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.rate_limits WHERE created_at < now() - interval '2 hours';
$$;

-- RLS: no public access
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
