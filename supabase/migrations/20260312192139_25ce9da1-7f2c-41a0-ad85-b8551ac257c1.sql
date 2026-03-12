
-- Create food_categories table
CREATE TABLE public.food_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🍽️',
  color TEXT NOT NULL DEFAULT '#0F766E',
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Create foods table
CREATE TABLE public.foods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_short TEXT NOT NULL,
  category_id UUID REFERENCES public.food_categories(id) ON DELETE SET NULL,
  calories NUMERIC NOT NULL DEFAULT 0,
  protein NUMERIC NOT NULL DEFAULT 0,
  carbohydrates NUMERIC NOT NULL DEFAULT 0,
  fat NUMERIC NOT NULL DEFAULT 0,
  fiber NUMERIC NOT NULL DEFAULT 0,
  photo_url TEXT,
  source TEXT NOT NULL DEFAULT 'TACO 4ª Ed. - NEPA/UNICAMP',
  preparation TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create doctors table
CREATE TABLE public.doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  document_number TEXT,
  document_type TEXT NOT NULL DEFAULT 'CRM' CHECK (document_type IN ('CRM', 'CRN')),
  specialty TEXT NOT NULL DEFAULT 'Nutrologia',
  logo_url TEXT,
  slug TEXT NOT NULL UNIQUE,
  primary_color TEXT NOT NULL DEFAULT '#0F766E',
  secondary_color TEXT NOT NULL DEFAULT '#059669',
  subscription_status TEXT NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'inactive')),
  subscription_end_date TIMESTAMPTZ,
  mp_subscription_id TEXT,
  mp_payer_email TEXT,
  trial_ends_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '14 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create page_views table
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  ip_hash TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create substitution_queries table
CREATE TABLE public.substitution_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  weight_grams NUMERIC NOT NULL,
  queried_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.food_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substitution_queries ENABLE ROW LEVEL SECURITY;

-- food_categories: public read
CREATE POLICY "Anyone can read food categories" ON public.food_categories FOR SELECT USING (true);

-- foods: public read
CREATE POLICY "Anyone can read foods" ON public.foods FOR SELECT USING (true);

-- doctors: public read (needed for patient page slug lookup)
CREATE POLICY "Anyone can read doctors" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Doctors can update own row" ON public.doctors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Doctors can insert own row" ON public.doctors FOR INSERT WITH CHECK (auth.uid() = user_id);

-- page_views: public insert, doctor reads own
CREATE POLICY "Anyone can insert page views" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Doctors can read own page views" ON public.page_views FOR SELECT USING (
  doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
);

-- substitution_queries: public insert, doctor reads own
CREATE POLICY "Anyone can insert substitution queries" ON public.substitution_queries FOR INSERT WITH CHECK (true);
CREATE POLICY "Doctors can read own substitution queries" ON public.substitution_queries FOR SELECT USING (
  doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_foods_category ON public.foods(category_id);
CREATE INDEX idx_foods_active ON public.foods(is_active);
CREATE INDEX idx_doctors_slug ON public.doctors(slug);
CREATE INDEX idx_doctors_user_id ON public.doctors(user_id);
CREATE INDEX idx_page_views_doctor ON public.page_views(doctor_id);
CREATE INDEX idx_page_views_viewed_at ON public.page_views(viewed_at);
CREATE INDEX idx_substitution_queries_doctor ON public.substitution_queries(doctor_id);
CREATE INDEX idx_substitution_queries_queried_at ON public.substitution_queries(queried_at);

-- Storage bucket for doctor logos
INSERT INTO storage.buckets (id, name, public) VALUES ('doctor-logos', 'doctor-logos', true);

CREATE POLICY "Anyone can view doctor logos" ON storage.objects FOR SELECT USING (bucket_id = 'doctor-logos');
CREATE POLICY "Authenticated users can upload logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'doctor-logos' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update logos" ON storage.objects FOR UPDATE USING (bucket_id = 'doctor-logos' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete logos" ON storage.objects FOR DELETE USING (bucket_id = 'doctor-logos' AND auth.role() = 'authenticated');
