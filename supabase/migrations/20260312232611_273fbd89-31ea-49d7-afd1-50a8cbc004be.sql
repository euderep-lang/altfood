
-- Add theme_layout column to doctors
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS theme_layout text NOT NULL DEFAULT 'minimal';

-- Create doctor_sections table
CREATE TABLE public.doctor_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.doctor_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can read own sections" ON public.doctor_sections
  FOR SELECT TO authenticated
  USING (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can insert own sections" ON public.doctor_sections
  FOR INSERT TO authenticated
  WITH CHECK (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can update own sections" ON public.doctor_sections
  FOR UPDATE TO authenticated
  USING (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can delete own sections" ON public.doctor_sections
  FOR DELETE TO authenticated
  USING (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));

-- Public can read sections for patient page
CREATE POLICY "Anyone can read sections" ON public.doctor_sections
  FOR SELECT TO public
  USING (true);

-- Create domain_interest table
CREATE TABLE public.domain_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(doctor_id)
);

ALTER TABLE public.domain_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can insert own interest" ON public.domain_interests
  FOR INSERT TO authenticated
  WITH CHECK (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can read own interest" ON public.domain_interests
  FOR SELECT TO authenticated
  USING (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));
