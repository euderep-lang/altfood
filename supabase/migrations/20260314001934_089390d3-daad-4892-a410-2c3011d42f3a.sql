
CREATE INDEX IF NOT EXISTS idx_foods_name ON public.foods(name);
CREATE INDEX IF NOT EXISTS idx_foods_category ON public.foods(category_id);
CREATE INDEX IF NOT EXISTS idx_page_views_doctor ON public.page_views(doctor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_date ON public.page_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_doctors_slug ON public.doctors(slug);
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON public.doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_substitution_queries_doctor ON public.substitution_queries(doctor_id);
CREATE INDEX IF NOT EXISTS idx_hidden_foods_doctor ON public.hidden_foods(doctor_id);
