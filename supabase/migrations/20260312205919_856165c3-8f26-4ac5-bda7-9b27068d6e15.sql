
-- Add referral_code to doctors
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES public.doctors(id);

-- Generate referral codes for existing doctors
UPDATE public.doctors SET referral_code = LOWER(SUBSTRING(md5(random()::text || id::text) FROM 1 FOR 8)) WHERE referral_code IS NULL;

-- Referrals tracking table
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  reward_given_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(referred_id)
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Doctors can read their own referrals (as referrer)
CREATE POLICY "Doctors can read own referrals" ON public.referrals
  FOR SELECT TO authenticated
  USING (referrer_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));

-- System inserts referrals (via service role), but allow authenticated insert for the referred doctor
CREATE POLICY "Authenticated can insert referrals" ON public.referrals
  FOR INSERT TO authenticated
  WITH CHECK (referred_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));

-- Trigger to auto-generate referral_code on new doctor insert
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := LOWER(SUBSTRING(md5(random()::text || NEW.id::text) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_generate_referral_code
  BEFORE INSERT ON public.doctors
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_referral_code();
