export const RESERVED_SLUGS = [
  'login', 'register', 'signup', 'dashboard', 'onboarding', 'profile',
  'billing', 'planos', 'admin', 'support', 'changelog', 'reset-password',
  'forgot-password', 'p', 'ref', 'compartilhar', 'novidades', 'assinatura',
];

export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  if (RESERVED_SLUGS.includes(base)) {
    return `${base}-2`;
  }
  return base;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-BR');
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('pt-BR');
}

export function formatNumber(num: number): string {
  return num.toLocaleString('pt-BR');
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

export function getShareableUrl(slug: string): string {
  const base = window.location.origin;
  const projectId = 'yjdwdovvisymgfduzyao';
  return `https://${projectId}.supabase.co/functions/v1/meta-preview?slug=${slug}&base=${encodeURIComponent(base)}`;
}

export function daysRemaining(date: string): number {
  const end = new Date(date);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
