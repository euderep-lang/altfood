
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS user_agent text;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS referrer text;

ALTER PUBLICATION supabase_realtime ADD TABLE public.page_views;
