-- Favicon da página pública do profissional (aba do navegador / atalho)
alter table public.doctors
  add column if not exists favicon_mode text not null default 'default';

alter table public.doctors
  add column if not exists favicon_url text;

alter table public.doctors
  drop constraint if exists doctors_favicon_mode_check;

alter table public.doctors
  add constraint doctors_favicon_mode_check
  check (favicon_mode in ('default', 'logo', 'custom'));

comment on column public.doctors.favicon_mode is 'default = ícone Altfood; logo = mesma imagem da logo; custom = favicon_url';
comment on column public.doctors.favicon_url is 'URL pública (storage) quando favicon_mode = custom';
