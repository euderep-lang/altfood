/**
 * Origem para redirect em e-mails do Supabase (ex.: reset de senha).
 * No browser, usa o host atual; fora do browser, VITE_SITE_URL.
 */
export function getSiteOriginForAuth(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  const fromEnv = import.meta.env.VITE_SITE_URL?.trim().replace(/\/$/, '');
  return fromEnv || '';
}
