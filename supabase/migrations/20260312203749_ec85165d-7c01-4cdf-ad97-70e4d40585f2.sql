
ALTER TABLE public.doctors
  ADD COLUMN IF NOT EXISTS email_weekly_summary boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_tips boolean NOT NULL DEFAULT true;
