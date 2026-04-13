/**
 * Fundo animado do hero (malha / blobs em drift) — referência visual: landing tipo Dieta.ai.
 * Animações só com transform (GPU); desliga com `reducedMotion` ou `motion-reduce:animate-none`.
 */
import { landingBrand as B } from '@/lib/landingBrand';
import { cn } from '@/lib/utils';

type Props = { reducedMotion: boolean };

export function HeroAnimatedBackdrop({ reducedMotion }: Props) {
  const on = !reducedMotion;

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {/* Malha de gradientes grandes (aurora) */}
      <div
        className={cn(
          'absolute -left-[25%] -top-[35%] h-[min(140vw,920px)] w-[min(140vw,920px)] rounded-[42%] blur-[90px] sm:blur-[110px]',
          on && 'motion-reduce:animate-none animate-hero-mesh-a'
        )}
        style={{
          background: `radial-gradient(ellipse 55% 50% at 50% 50%, color-mix(in srgb, ${B.primary} 70%, transparent) 0%, transparent 72%)`,
          opacity: 0.55,
        }}
      />
      <div
        className={cn(
          'absolute -right-[20%] top-[15%] h-[min(110vw,720px)] w-[min(110vw,720px)] rounded-[45%] blur-[85px] sm:blur-[105px]',
          on && 'motion-reduce:animate-none animate-hero-mesh-b'
        )}
        style={{
          background: `radial-gradient(ellipse 50% 48% at 50% 50%, color-mix(in srgb, ${B.secondary} 65%, transparent) 0%, transparent 70%)`,
          opacity: 0.45,
        }}
      />
      <div
        className={cn(
          'absolute bottom-[-25%] left-[10%] h-[min(100vw,640px)] w-[min(100vw,640px)] rounded-[48%] blur-[95px] sm:blur-[115px]',
          on && 'motion-reduce:animate-none animate-hero-mesh-c'
        )}
        style={{
          background: `radial-gradient(ellipse 52% 50% at 50% 50%, color-mix(in srgb, ${B.lime} 35%, transparent) 0%, transparent 68%)`,
          opacity: 0.35,
        }}
      />
      <div
        className={cn(
          'absolute left-[15%] top-[40%] h-[min(85vw,520px)] w-[min(85vw,520px)] rounded-full blur-[80px] sm:blur-[100px]',
          on && 'motion-reduce:animate-none animate-hero-mesh-d'
        )}
        style={{
          background: `radial-gradient(circle at 40% 40%, color-mix(in srgb, hsl(180 35% 22%) 50%, transparent) 0%, transparent 65%)`,
          opacity: 0.5,
        }}
      />

      {/* Grelha fina em movimento lento (profundidade) */}
      <div
        className={cn(
          'absolute inset-0 opacity-[0.14] mix-blend-soft-light',
          on && 'motion-reduce:animate-none animate-hero-grid-pan'
        )}
        style={{
          backgroundImage: `linear-gradient(hsl(170 40% 45% / 0.12) 1px, transparent 1px), linear-gradient(90deg, hsl(170 40% 45% / 0.12) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          maskImage: 'linear-gradient(180deg, black 0%, black 55%, transparent 100%)',
        }}
      />

      <div
        className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#050807] via-[#050807]/80 to-transparent sm:h-52"
        aria-hidden
      />
    </div>
  );
}
