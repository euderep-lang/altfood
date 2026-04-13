/**
 * Cores da landing alinhadas ao logo + `tailwind.config` (`altfood.*`) + `:root` em `index.css`.
 * Evita paleta “genérica” (navy/oliva arbitrários) fora da marca.
 */
export const landingBrand = {
  forest: '#1a3c2e',
  lime: '#c8f044',
  dark: '#111a14',
  offwhite: '#f5f0e8',
  surface: '#ffffff',
  border: '#e2ddd4',
  muted: '#6b7c6e',
  /** Texto secundário sobre fundo escuro (token `altfood-on-dark`) */
  onDarkMuted: '#b0c4b8',
  /** Primary / secondary do tema (mesmos HSL que `--primary` e `--secondary`) */
  primary: 'hsl(170 60% 30%)',
  secondary: 'hsl(160 50% 42%)',
  /** Fundo de seção clara levemente aquecido */
  paper: 'hsl(45 25% 98%)',
} as const;
