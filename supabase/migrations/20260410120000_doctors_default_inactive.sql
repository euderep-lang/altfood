-- Novos cadastros não entram em "trial" com acesso ao app; acesso após pagamento (status active).
ALTER TABLE public.doctors ALTER COLUMN subscription_status SET DEFAULT 'inactive';
