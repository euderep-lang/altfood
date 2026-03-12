-- Support tickets table
CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  admin_reply text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can read own tickets"
  ON public.support_tickets FOR SELECT TO authenticated
  USING (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can insert own tickets"
  ON public.support_tickets FOR INSERT TO authenticated
  WITH CHECK (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));

-- Patient feedback table
CREATE TABLE public.patient_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  is_positive boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert feedback"
  ON public.patient_feedback FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Doctors can read own feedback"
  ON public.patient_feedback FOR SELECT TO authenticated
  USING (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));

-- NPS responses table
CREATE TABLE public.nps_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  score integer NOT NULL,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(doctor_id)
);

ALTER TABLE public.nps_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can read own nps"
  ON public.nps_responses FOR SELECT TO authenticated
  USING (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can insert own nps"
  ON public.nps_responses FOR INSERT TO authenticated
  WITH CHECK (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));

-- Admin functions for support tickets
CREATE OR REPLACE FUNCTION public.admin_get_support_tickets()
RETURNS TABLE(
  id uuid, doctor_id uuid, message text, status text, 
  admin_reply text, created_at timestamptz, resolved_at timestamptz,
  doctor_name text, doctor_email text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT st.id, st.doctor_id, st.message, st.status,
    st.admin_reply, st.created_at, st.resolved_at,
    d.name as doctor_name, d.email as doctor_email
  FROM public.support_tickets st
  JOIN public.doctors d ON d.id = st.doctor_id
  ORDER BY st.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_ticket_status(
  ticket_id uuid, new_status text, reply text DEFAULT NULL
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