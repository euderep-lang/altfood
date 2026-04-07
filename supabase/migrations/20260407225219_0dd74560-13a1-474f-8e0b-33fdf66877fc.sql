
CREATE TABLE public.patient_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug_suffix text NOT NULL,
  description text,
  hidden_food_ids text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(doctor_id, slug_suffix)
);

ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read profiles (needed for patient page)
CREATE POLICY "Anyone can read patient profiles"
  ON public.patient_profiles FOR SELECT
  TO public
  USING (true);

-- Doctors can manage their own profiles
CREATE POLICY "Doctors can insert own profiles"
  ON public.patient_profiles FOR INSERT
  TO authenticated
  WITH CHECK (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can update own profiles"
  ON public.patient_profiles FOR UPDATE
  TO authenticated
  USING (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can delete own profiles"
  ON public.patient_profiles FOR DELETE
  TO authenticated
  USING (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));
