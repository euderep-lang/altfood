
-- Add featured_food_id to doctors for "food of the day"
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS featured_food_id uuid REFERENCES public.foods(id) ON DELETE SET NULL;

-- Allow admin to manage foods (insert, update, delete)
CREATE POLICY "Admin can insert foods" ON public.foods
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin can update foods" ON public.foods
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Admin can delete foods" ON public.foods
  FOR DELETE TO authenticated
  USING (true);

-- Allow admin to manage food_categories
CREATE POLICY "Admin can insert categories" ON public.food_categories
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin can update categories" ON public.food_categories
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Admin can delete categories" ON public.food_categories
  FOR DELETE TO authenticated
  USING (true);
