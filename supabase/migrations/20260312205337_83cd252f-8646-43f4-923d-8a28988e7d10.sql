
-- Function to get all page view timestamps for admin dashboard
-- Uses SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.admin_get_page_views_since(since_date timestamptz)
RETURNS TABLE(viewed_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pv.viewed_at
  FROM public.page_views pv
  WHERE pv.viewed_at >= since_date;
$$;
