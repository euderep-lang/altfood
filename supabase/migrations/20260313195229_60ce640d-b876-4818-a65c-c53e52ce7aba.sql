
-- Payments history table
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  mp_payment_id text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'BRL',
  plan text NOT NULL, -- 'monthly' or 'annual'
  status text NOT NULL DEFAULT 'approved',
  payer_email text,
  paid_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Doctors can read own payments
CREATE POLICY "Doctors can read own payments"
ON public.payments
FOR SELECT
TO authenticated
USING (doctor_id IN (SELECT doctors.id FROM doctors WHERE doctors.user_id = auth.uid()));

-- Service role inserts via webhook (no insert policy needed for authenticated users)
-- Admin can read all payments
CREATE POLICY "Admin can read all payments"
ON public.payments
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
