-- Stripe recurring subscriptions (cartão). Mantém colunas mp_* para histórico legado.
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

CREATE INDEX IF NOT EXISTS idx_doctors_stripe_customer_id ON public.doctors (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_doctors_stripe_subscription_id ON public.doctors (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- UI já usa 'cancelled'; alinha constraint do banco.
ALTER TABLE public.doctors DROP CONSTRAINT IF EXISTS doctors_subscription_status_check;
ALTER TABLE public.doctors ADD CONSTRAINT doctors_subscription_status_check
  CHECK (subscription_status IN ('trial', 'active', 'inactive', 'blocked', 'cancelled'));
