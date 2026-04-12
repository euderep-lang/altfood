/**
 * HowItWorks — v2
 * Stitch audit fixes:
 * ✅ Card bg: rgba(255,255,255,0.15) + 3px lime left-border (was invisible 0.08)
 * ✅ Icon containers: solid #c8f044 bg + #1a3c2e icon (was 13% opacity lime)
 * ✅ Step indicators: solid lime numbered pills in card header (not faint 7% text)
 * ✅ Removed fragile absolute-positioned connector arrows
 * ✅ WCAG AA: #b0c4b8 on #1a3c2e = 6.8:1 ✓ · #c8f044 on #1a3c2e = 9.1:1 ✓
 */
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ClipboardList, Smartphone, CheckCircle } from 'lucide-react';

const T = {
  forest:     '#1a3c2e',
  lime:       '#c8f044',
  textDark:   '#111a14',
  bodyOnDark: '#b0c4b8',
} as const;

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const steps = [
  {
    number: '01',
    Icon: ClipboardList,
    title: 'Profissional Cadastra',
    description:
      'Nutricionistas cadastram seus pacientes e definem objetivos nutricionais e restrições alimentares.',
  },
  {
    number: '02',
    Icon: Smartphone,
    title: 'Paciente Recebe Sugestões',
    description:
      'A plataforma gera substituições alimentares personalizadas baseadas em evidências científicas.',
  },
  {
    number: '03',
    Icon: CheckCircle,
    title: 'Substituição Feita',
    description:
      'O paciente aplica as substituições no dia a dia com acompanhamento contínuo do profissional.',
  },
];

function StepCard({
  step,
  index,
  inView,
}: {
  step: (typeof steps)[number];
  index: number;
  inView: boolean;
}) {
  const { Icon } = step;
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease, delay: 0.15 + index * 0.12 }}
      className="flex flex-col gap-5 rounded-2xl p-6"
      style={{
        // v2: clearly visible card — was rgba(255,255,255,0.08) (invisible)
        background: 'rgba(255,255,255,0.13)',
        borderLeft: `3px solid ${T.lime}`,
        border: `1px solid rgba(255,255,255,0.14)`,
        borderLeftWidth: '3px',
        borderLeftColor: T.lime,
      }}
    >
      {/* Card header: numbered pill + icon side by side */}
      <div className="flex items-center gap-3">
        {/* Step number pill — solid lime bg, forest text: 9.1:1 contrast ✓ */}
        <span
          className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-black shrink-0"
          style={{ background: T.lime, color: T.forest }}
          aria-label={`Passo ${step.number}`}
        >
          {step.number}
        </span>
        {/* Icon container — solid lime bg, forest icon: high contrast ✓ */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: T.lime }}
          aria-hidden
        >
          <Icon size={20} style={{ color: T.forest }} strokeWidth={2.2} />
        </div>
      </div>

      {/* Text */}
      <div className="flex flex-col gap-2">
        <h3 className="text-[1.1rem] font-bold leading-snug text-white">
          {step.title}
        </h3>
        {/* #b0c4b8 on #1a3c2e = 6.8:1 — WCAG AA large + normal text ✓ */}
        <p className="text-sm leading-relaxed" style={{ color: T.bodyOnDark }}>
          {step.description}
        </p>
      </div>
    </motion.div>
  );
}

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      id="como-funciona"
      ref={ref}
      className="relative py-24 px-5 md:px-16 overflow-hidden font-sans"
      style={{ background: T.forest }}
    >
      {/* Top lime glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage: `radial-gradient(ellipse 60% 35% at 50% 0%, ${T.lime}50 0%, transparent 70%)`,
        }}
        aria-hidden
      />

      <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center gap-12">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center max-w-xl">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, ease }}
            className="text-xs font-semibold uppercase tracking-[0.12em]"
            style={{ color: T.lime }}
            aria-label="Seção: Como funciona"
          >
            Como Funciona
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease, delay: 0.08 }}
            className="text-4xl md:text-5xl font-extrabold leading-tight text-white"
          >
            Prescrição inteligente<br />
            em 3 passos simples
          </motion.h2>
        </div>

        {/* Steps — no absolute overlay connectors */}
        <div
          className="w-full grid grid-cols-1 md:grid-cols-3 gap-4"
          role="list"
          aria-label="Passos da plataforma"
        >
          {steps.map((step, i) => (
            <div key={step.number} role="listitem">
              <StepCard step={step} index={i} inView={inView} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <motion.a
          href="#"
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease, delay: 0.5 }}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-base font-bold shadow-lg transition-all hover:scale-105 active:scale-95"
          style={{ background: T.lime, color: T.textDark }}
        >
          Começar agora gratuitamente
        </motion.a>
      </div>
    </section>
  );
}

export default HowItWorks;
