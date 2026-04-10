-- ============================================================
-- ALTFOOD — SCHEMA COMPLETO PARA NOVO PROJETO SUPABASE
-- Execute no SQL Editor do novo projeto Supabase
-- Passo 1 de 3
-- ============================================================

-- ============================================================
-- EXTENSÕES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- ============================================================
-- TABELAS
-- ============================================================

-- food_categories
CREATE TABLE public.food_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🍽️',
  color TEXT NOT NULL DEFAULT '#0F766E',
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- foods
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

-- doctors
CREATE TABLE public.doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  document_number TEXT,
  document_type TEXT NOT NULL DEFAULT 'CRM' CHECK (document_type IN ('CRM', 'CRN')),
  specialty TEXT NOT NULL DEFAULT 'Nutrologia',
  bio TEXT DEFAULT NULL,
  logo_url TEXT,
  slug TEXT NOT NULL UNIQUE,
  primary_color TEXT NOT NULL DEFAULT '#0F766E',
  secondary_color TEXT NOT NULL DEFAULT '#059669',
  whatsapp_link TEXT DEFAULT NULL,
  instagram_link TEXT DEFAULT NULL,
  welcome_message TEXT DEFAULT NULL,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  email_weekly_summary BOOLEAN NOT NULL DEFAULT true,
  email_tips BOOLEAN NOT NULL DEFAULT true,
  theme_layout TEXT NOT NULL DEFAULT 'minimal',
  featured_food_id UUID REFERENCES public.foods(id) ON DELETE SET NULL,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES public.doctors(id),
  subscription_status TEXT NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'inactive', 'blocked')),
  subscription_end_date TIMESTAMPTZ,
  mp_subscription_id TEXT,
  mp_payer_email TEXT,
  trial_ends_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '3 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- page_views
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  ip_hash TEXT,
  user_agent TEXT,
  referrer TEXT,
  source TEXT DEFAULT 'direct',
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- substitution_queries
CREATE TABLE public.substitution_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  weight_grams NUMERIC NOT NULL,
  queried_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- rate_limits
CREATE TABLE public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'signup',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- referrals
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  reward_given_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(referred_id)
);

-- hidden_foods
CREATE TABLE public.hidden_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  food_id UUID NOT NULL REFERENCES public.foods(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(doctor_id, food_id)
);

-- support_tickets
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  admin_reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- patient_feedback
CREATE TABLE public.patient_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  is_positive BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- nps_responses
CREATE TABLE public.nps_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(doctor_id)
);

-- doctor_sections
CREATE TABLE public.doctor_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- domain_interests
CREATE TABLE public.domain_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(doctor_id)
);

-- site_settings
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  mp_payment_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'approved',
  payer_email TEXT,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- patient_profiles
CREATE TABLE public.patient_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug_suffix TEXT NOT NULL,
  description TEXT,
  hidden_food_ids TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(doctor_id, slug_suffix)
);

-- ============================================================
-- SEED: CONFIGURAÇÕES
-- ============================================================
INSERT INTO public.site_settings (key, value) VALUES ('maintenance_mode', 'false');

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX idx_foods_category ON public.foods(category_id);
CREATE INDEX idx_foods_active ON public.foods(is_active);
CREATE INDEX idx_foods_name ON public.foods(name);
CREATE INDEX idx_doctors_slug ON public.doctors(slug);
CREATE INDEX idx_doctors_user_id ON public.doctors(user_id);
CREATE INDEX idx_page_views_doctor ON public.page_views(doctor_id);
CREATE INDEX idx_page_views_viewed_at ON public.page_views(viewed_at);
CREATE INDEX idx_page_views_date ON public.page_views(viewed_at);
CREATE INDEX idx_substitution_queries_doctor ON public.substitution_queries(doctor_id);
CREATE INDEX idx_substitution_queries_queried_at ON public.substitution_queries(queried_at);
CREATE INDEX idx_rate_limits_ip_action ON public.rate_limits(ip_hash, action, created_at);
CREATE INDEX idx_hidden_foods_doctor ON public.hidden_foods(doctor_id);

-- ============================================================
-- REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.page_views;

-- ============================================================
-- TRIGGERS & FUNÇÕES
-- ============================================================

-- updated_at automático
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

-- Gerar referral_code automaticamente
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := LOWER(SUBSTRING(md5(random()::text || NEW.id::text) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_generate_referral_code
  BEFORE INSERT ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code();

-- Limpeza de rate_limits
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  DELETE FROM public.rate_limits WHERE created_at < now() - interval '1 hour';
$$;

-- Admin: visualizar page_views
CREATE OR REPLACE FUNCTION public.admin_get_page_views_since(since_date TIMESTAMPTZ)
RETURNS TABLE(viewed_at TIMESTAMPTZ)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT pv.viewed_at FROM public.page_views pv WHERE pv.viewed_at >= since_date;
$$;

-- Admin: listar tickets de suporte
CREATE OR REPLACE FUNCTION public.admin_get_support_tickets()
RETURNS TABLE(
  id UUID, doctor_id UUID, message TEXT, status TEXT,
  admin_reply TEXT, created_at TIMESTAMPTZ, resolved_at TIMESTAMPTZ,
  doctor_name TEXT, doctor_email TEXT
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT st.id, st.doctor_id, st.message, st.status,
    st.admin_reply, st.created_at, st.resolved_at,
    d.name AS doctor_name, d.email AS doctor_email
  FROM public.support_tickets st
  JOIN public.doctors d ON d.id = st.doctor_id
  ORDER BY st.created_at DESC;
$$;

-- Admin: atualizar ticket
CREATE OR REPLACE FUNCTION public.admin_update_ticket_status(
  ticket_id UUID, new_status TEXT, reply TEXT DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.support_tickets
  SET status = new_status,
      admin_reply = COALESCE(reply, admin_reply),
      resolved_at = CASE WHEN new_status = 'closed' THEN now() ELSE resolved_at END
  WHERE id = ticket_id;
END;
$$;

-- Verificar role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Auto-admin para o dono do projeto
CREATE OR REPLACE FUNCTION public.ensure_owner_admin_role()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  IF lower(COALESCE(auth.jwt() ->> 'email', '')) = 'euder.ep@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (auth.uid(), 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_owner_admin_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_owner_admin_role() TO authenticated;

-- ============================================================
-- RLS — ENABLE
-- ============================================================
ALTER TABLE public.food_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substitution_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hidden_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nps_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS — POLICIES
-- ============================================================

-- food_categories
CREATE POLICY "Anyone can read food categories" ON public.food_categories FOR SELECT USING (true);
CREATE POLICY "Admin can insert categories" ON public.food_categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin can update categories" ON public.food_categories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin can delete categories" ON public.food_categories FOR DELETE TO authenticated USING (true);

-- foods
CREATE POLICY "Anyone can read foods" ON public.foods FOR SELECT USING (true);
CREATE POLICY "Admin can insert foods" ON public.foods FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin can update foods" ON public.foods FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin can delete foods" ON public.foods FOR DELETE TO authenticated USING (true);

-- doctors
CREATE POLICY "Anyone can read doctors" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Doctors can insert own row" ON public.doctors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Doctors can update own row" ON public.doctors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin can update doctors" ON public.doctors FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin can delete doctors" ON public.doctors FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- page_views
CREATE POLICY "Anyone can insert page views" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Doctors can read own page views" ON public.page_views FOR SELECT USING (
  doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
);

-- substitution_queries
CREATE POLICY "Anyone can insert substitution queries" ON public.substitution_queries FOR INSERT WITH CHECK (true);
CREATE POLICY "Doctors can read own substitution queries" ON public.substitution_queries FOR SELECT USING (
  doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
);

-- referrals
CREATE POLICY "Doctors can read own referrals" ON public.referrals FOR SELECT TO authenticated
  USING (referrer_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));
CREATE POLICY "Authenticated can insert referrals" ON public.referrals FOR INSERT TO authenticated
  WITH CHECK (referred_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));

-- hidden_foods
CREATE POLICY "Doctors can read own hidden foods" ON public.hidden_foods FOR SELECT TO authenticated
  USING (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));
CREATE POLICY "Doctors can insert own hidden foods" ON public.hidden_foods FOR INSERT TO authenticated
  WITH CHECK (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));
CREATE POLICY "Doctors can delete own hidden foods" ON public.hidden_foods FOR DELETE TO authenticated
  USING (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));

-- support_tickets
CREATE POLICY "Doctors can read own tickets" ON public.support_tickets FOR SELECT TO authenticated
  USING (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));
CREATE POLICY "Doctors can insert own tickets" ON public.support_tickets FOR INSERT TO authenticated
  WITH CHECK (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));

-- patient_feedback
CREATE POLICY "Anyone can insert feedback" ON public.patient_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Doctors can read own feedback" ON public.patient_feedback FOR SELECT TO authenticated
  USING (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));

-- nps_responses
CREATE POLICY "Doctors can read own nps" ON public.nps_responses FOR SELECT TO authenticated
  USING (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));
CREATE POLICY "Doctors can insert own nps" ON public.nps_responses FOR INSERT TO authenticated
  WITH CHECK (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));

-- doctor_sections
CREATE POLICY "Anyone can read sections" ON public.doctor_sections FOR SELECT TO public USING (true);
CREATE POLICY "Doctors can insert own sections" ON public.doctor_sections FOR INSERT TO authenticated
  WITH CHECK (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));
CREATE POLICY "Doctors can update own sections" ON public.doctor_sections FOR UPDATE TO authenticated
  USING (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));
CREATE POLICY "Doctors can delete own sections" ON public.doctor_sections FOR DELETE TO authenticated
  USING (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));

-- domain_interests
CREATE POLICY "Doctors can insert own interest" ON public.domain_interests FOR INSERT TO authenticated
  WITH CHECK (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));
CREATE POLICY "Doctors can read own interest" ON public.domain_interests FOR SELECT TO authenticated
  USING (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));

-- site_settings
CREATE POLICY "Anyone can read site settings" ON public.site_settings FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated can update site settings" ON public.site_settings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can insert site settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (true);

-- user_roles
CREATE POLICY "Admins can read all roles" ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- payments
CREATE POLICY "Doctors can read own payments" ON public.payments FOR SELECT TO authenticated
  USING (doctor_id IN (SELECT doctors.id FROM doctors WHERE doctors.user_id = auth.uid()));
CREATE POLICY "Admin can read all payments" ON public.payments FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin can insert payments" ON public.payments FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- patient_profiles
CREATE POLICY "Anyone can read patient profiles" ON public.patient_profiles FOR SELECT TO public USING (true);
CREATE POLICY "Doctors can insert own profiles" ON public.patient_profiles FOR INSERT TO authenticated
  WITH CHECK (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));
CREATE POLICY "Doctors can update own profiles" ON public.patient_profiles FOR UPDATE TO authenticated
  USING (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));
CREATE POLICY "Doctors can delete own profiles" ON public.patient_profiles FOR DELETE TO authenticated
  USING (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));

-- ============================================================
-- STORAGE
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('doctor-logos', 'doctor-logos', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view doctor logos" ON storage.objects FOR SELECT USING (bucket_id = 'doctor-logos');
CREATE POLICY "Authenticated users can upload logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'doctor-logos' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update logos" ON storage.objects FOR UPDATE USING (bucket_id = 'doctor-logos' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete logos" ON storage.objects FOR DELETE USING (bucket_id = 'doctor-logos' AND auth.role() = 'authenticated');

-- ============================================================
-- FIM DO SCHEMA
-- ============================================================
