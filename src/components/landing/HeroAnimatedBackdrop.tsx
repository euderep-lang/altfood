/**
 * Fundo do hero — motivos de dieta/alimentação: ícones discretos em movimento suave.
 * Desliga animação com reducedMotion (mantém composição estática).
 */
import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { Apple, Carrot, Cherry, Citrus, Grape, Leaf, LeafyGreen, Salad, Sprout } from 'lucide-react';

type Props = { reducedMotion: boolean };

type FloatSpec = {
  Icon: typeof Apple;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  size: number;
  duration: number;
  delay: number;
  /** tom no fundo escuro */
  tone: 'lime' | 'mint' | 'gold' | 'coral';
};

const tones: Record<FloatSpec['tone'], string> = {
  lime: 'hsl(78 85% 62% / 0.32)',
  mint: 'hsl(165 55% 52% / 0.28)',
  gold: 'hsl(48 90% 58% / 0.26)',
  coral: 'hsl(18 75% 58% / 0.22)',
};

const floats: FloatSpec[] = [
  { Icon: Apple, top: '7%', left: '5%', size: 46, duration: 10, delay: 0, tone: 'lime' },
  { Icon: Leaf, top: '12%', right: '6%', size: 40, duration: 12, delay: 0.5, tone: 'mint' },
  { Icon: Carrot, top: '38%', left: '2%', size: 44, duration: 9, delay: 0.2, tone: 'coral' },
  { Icon: Grape, bottom: '28%', left: '8%', size: 42, duration: 11, delay: 0.8, tone: 'mint' },
  { Icon: Cherry, top: '22%', left: '42%', size: 36, duration: 8.5, delay: 0.3, tone: 'coral' },
  { Icon: Citrus, bottom: '18%', right: '10%', size: 48, duration: 10.5, delay: 0.6, tone: 'gold' },
  { Icon: LeafyGreen, top: '48%', right: '4%', size: 44, duration: 9.5, delay: 0.1, tone: 'lime' },
  { Icon: Sprout, bottom: '42%', right: '18%', size: 38, duration: 11.5, delay: 0.4, tone: 'mint' },
  { Icon: Salad, top: '58%', left: '14%', size: 40, duration: 12.5, delay: 0.7, tone: 'lime' },
  { Icon: Apple, bottom: '12%', left: '22%', size: 34, duration: 8, delay: 0.9, tone: 'gold' },
];

export function HeroAnimatedBackdrop({ reducedMotion }: Props) {
  const on = !reducedMotion;

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {floats.map((f, i) => {
        const pos: CSSProperties = {
          top: f.top,
          bottom: f.bottom,
          left: f.left,
          right: f.right,
          color: tones[f.tone],
        };
        const Icon = f.Icon;
        return (
          <motion.div
            key={`float-${i}`}
            className="absolute will-change-transform"
            style={pos}
            initial={false}
            animate={
              on
                ? {
                    y: [0, -16, 4, 0],
                    rotate: [0, f.size % 2 === 0 ? 10 : -10, 0],
                    opacity: [0.18, 0.4, 0.22, 0.18],
                    scale: [1, 1.06, 0.98, 1],
                  }
                : { y: 0, rotate: 0, opacity: 0.2, scale: 1 }
            }
            transition={
              on
                ? {
                    duration: f.duration,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: f.delay,
                  }
                : { duration: 0.3 }
            }
          >
            <Icon
              className="drop-shadow-[0_0_12px_rgba(200,240,68,0.15)]"
              size={f.size}
              strokeWidth={1.35}
              aria-hidden
            />
          </motion.div>
        );
      })}

      {/* Micro-partículas (pontos) — pulso suave */}
      {[
        { l: '18%', t: '25%' },
        { l: '55%', t: '18%' },
        { l: '88%', t: '35%' },
        { l: '30%', t: '72%' },
        { l: '70%', t: '62%' },
      ].map((d, i) => (
        <motion.span
          key={`dot-${i}`}
          className="absolute block h-1.5 w-1.5 rounded-full bg-[hsl(165_55%_50%)]"
          style={{ left: d.l, top: d.t }}
          animate={on ? { opacity: [0.12, 0.4, 0.12], scale: [1, 1.4, 1] } : { opacity: 0.18 }}
          transition={
            on ? { duration: 4 + i * 0.35, repeat: Infinity, ease: 'easeInOut', delay: i * 0.25 } : { duration: 0.2 }
          }
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030504]/85" />
    </div>
  );
}
