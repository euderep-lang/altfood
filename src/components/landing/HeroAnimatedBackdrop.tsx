/**
 * Fundo animado do hero — aurora / malha visível em fundo escuro (referência Dieta.ai).
 * Usa mix-blend-screen + cores mais claras para o movimento aparecer; desliga com reducedMotion.
 */
import { cn } from '@/lib/utils';

type Props = { reducedMotion: boolean };

export function HeroAnimatedBackdrop({ reducedMotion }: Props) {
  const on = !reducedMotion;

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {/*
        Camada de luz: mix-blend-screen “acende” o escuro do gradient-dark por baixo.
        Cores em hsl claros para o drift ser perceptível.
      */}
      <div
        className={cn(
          'absolute inset-0 mix-blend-screen',
          reducedMotion && 'opacity-50'
        )}
      >
        <div
          className={cn(
            'absolute -left-[30%] -top-[40%] h-[min(150vw,980px)] w-[min(150vw,980px)] rounded-[40%] blur-[72px] will-change-transform sm:blur-[100px]',
            on && 'motion-reduce:animate-none animate-hero-mesh-a'
          )}
          style={{
            background:
              'radial-gradient(ellipse 58% 52% at 50% 45%, hsl(165 72% 52% / 0.72) 0%, hsl(170 55% 38% / 0.35) 42%, transparent 68%)',
          }}
        />
        <div
          className={cn(
            'absolute -right-[25%] top-[5%] h-[min(120vw,780px)] w-[min(120vw,780px)] rounded-[44%] blur-[68px] will-change-transform sm:blur-[95px]',
            on && 'motion-reduce:animate-none animate-hero-mesh-b'
          )}
          style={{
            background:
              'radial-gradient(ellipse 52% 50% at 48% 50%, hsl(155 60% 48% / 0.65) 0%, hsl(160 45% 32% / 0.28) 45%, transparent 70%)',
          }}
        />
        <div
          className={cn(
            'absolute bottom-[-35%] left-[5%] h-[min(110vw,700px)] w-[min(110vw,700px)] rounded-[46%] blur-[80px] will-change-transform sm:blur-[105px]',
            on && 'motion-reduce:animate-none animate-hero-mesh-c'
          )}
          style={{
            background:
              'radial-gradient(ellipse 55% 48% at 50% 40%, hsl(78 85% 62% / 0.55) 0%, hsl(78 70% 40% / 0.2) 40%, transparent 68%)',
          }}
        />
        <div
          className={cn(
            'absolute left-[10%] top-[35%] h-[min(90vw,560px)] w-[min(90vw,560px)] rounded-full blur-[64px] will-change-transform sm:blur-[88px]',
            on && 'motion-reduce:animate-none animate-hero-mesh-d'
          )}
          style={{
            background:
              'radial-gradient(circle at 42% 42%, hsl(175 45% 42% / 0.5) 0%, transparent 62%)',
          }}
        />
      </div>

      {/* Grelha em pan — um pouco mais visível */}
      <div
        className={cn(
          'absolute inset-0 opacity-[0.22] mix-blend-overlay',
          on && 'motion-reduce:animate-none animate-hero-grid-pan'
        )}
        style={{
          backgroundImage: `linear-gradient(hsl(165 50% 55% / 0.14) 1px, transparent 1px), linear-gradient(90deg, hsl(165 50% 55% / 0.14) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          maskImage: 'linear-gradient(180deg, black 0%, black 50%, transparent 100%)',
        }}
      />

      <div
        className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-[#030504] via-[#030504]/90 to-transparent sm:h-48"
        aria-hidden
      />
    </div>
  );
}
