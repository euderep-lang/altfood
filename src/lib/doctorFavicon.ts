export type DoctorFaviconMode = 'default' | 'logo' | 'custom';

export function normalizeFaviconMode(v: string | null | undefined): DoctorFaviconMode {
  if (v === 'logo' || v === 'custom') return v;
  return 'default';
}

/** href absoluto para <link rel="icon"> na página pública do médico */
export function resolveDoctorFaviconHref(
  doctor: {
    favicon_mode?: string | null;
    favicon_url?: string | null;
    logo_url?: string | null;
  },
  origin: string,
): string {
  const mode = normalizeFaviconMode(doctor.favicon_mode);
  const fallback = `${origin}/icon-192.png`;
  if (mode === 'logo' && doctor.logo_url?.trim()) return doctor.logo_url.trim();
  if (mode === 'custom' && doctor.favicon_url?.trim()) return doctor.favicon_url.trim();
  return fallback;
}
