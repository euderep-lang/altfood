-- Auto-assign admin role to project owner email in any environment
CREATE OR REPLACE FUNCTION public.ensure_owner_admin_role()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  IF lower(COALESCE(auth.jwt() ->> 'email', '')) = 'euder.ep@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (auth.uid(), 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_owner_admin_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_owner_admin_role() TO authenticated;