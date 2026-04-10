/**
 * Origem usada em links de e-mail (confirmação de cadastro, reset de senha).
 * Em produção, defina VITE_SITE_URL (ex.: https://altfood.com.br) no ambiente de build
 * para não depender só do browser no momento do cadastro.
 */
export function getSiteOriginForAuth(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL?.trim().replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  return typeof window !== 'undefined' ? window.location.origin : '';
}
