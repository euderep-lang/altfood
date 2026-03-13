-- Allow admin to delete doctors
CREATE POLICY "Admin can delete doctors"
ON public.doctors
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
