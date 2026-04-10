/** Evita open-redirect: só caminhos relativos internos. */
export function getSafeInternalPath(next: string | null | undefined): string | null {
  if (next == null || typeof next !== 'string') return null;
  const trimmed = next.trim();
  if (!trimmed.startsWith('/')) return null;
  if (trimmed.startsWith('//')) return null;
  if (trimmed.includes('://')) return null;
  return trimmed;
}
