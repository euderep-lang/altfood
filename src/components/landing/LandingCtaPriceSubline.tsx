/**
 * Linha de preço sob CTAs da landing — três mensagens em rotação.
 * `initialIndex` desfaseia cada bloco na página para não ficarem todos iguais ao mesmo tempo.
 */
import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { landingBrand as B } from '@/lib/landingBrand';

export const LANDING_CTA_PRICE_SUBLINES = [
  'Altfood PRO por R$ 19,90/mês. Pacientes ilimitados.',
  'Altfood PRO por R$ 19,90/mês. Seus pacientes não pagam.',
  'Altfood PRO: condição de lançamento por tempo limitado.',
] as const;

type Tone = 'onDark' | 'onLight';

type Props = {
  className?: string;
  /** 0–2: mensagem inicial (e desfasagem entre secções) */
  initialIndex?: number;
  tone?: Tone;
};

const INTERVAL_MS = 5000;

export function LandingCtaPriceSubline({ className, initialIndex = 0, tone = 'onLight' }: Props) {
  const reduced = useReducedMotion();
  const [i, setI] = useState(() => initialIndex % LANDING_CTA_PRICE_SUBLINES.length);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setI((n) => (n + 1) % LANDING_CTA_PRICE_SUBLINES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduced]);

  const color = tone === 'onDark' ? B.onDarkMuted : B.muted;

  return (
    <p
      className={cn('text-center text-sm font-medium leading-snug transition-opacity duration-300', className)}
      style={{ color }}
      aria-live="polite"
    >
      {LANDING_CTA_PRICE_SUBLINES[i]}
    </p>
  );
}
