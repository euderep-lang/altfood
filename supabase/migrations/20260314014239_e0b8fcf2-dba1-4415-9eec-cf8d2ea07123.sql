ALTER TABLE public.doctors
  ADD CONSTRAINT doctors_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
  NOT VALID;

ALTER TABLE public.doctors VALIDATE CONSTRAINT doctors_user_id_fkey;