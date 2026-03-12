-- Create hidden_foods table
CREATE TABLE public.hidden_foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  food_id uuid NOT NULL REFERENCES public.foods(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(doctor_id, food_id)
);

ALTER TABLE public.hidden_foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can read own hidden foods"
  ON public.hidden_foods FOR SELECT
  TO authenticated
  USING (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can insert own hidden foods"
  ON public.hidden_foods FOR INSERT
  TO authenticated
  WITH CHECK (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can delete own hidden foods"
  ON public.hidden_foods FOR DELETE
  TO authenticated
  USING (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));