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
import { Link } from 'react-router-dom';
import { Stethoscope, MessagesSquare, Link2 } from 'lucide-react';

const T = {
  forest: '#1a3c2e',
  lime: '#c8f044',
  textDark: '#111a14',
  bodyOnDark: '#b0c4b8',
} as const;

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const steps = [
  {
    number: '01',
    Icon: Stethoscope,
    title: 'No consultório, tudo faz sentido',
    description:
      'Você explica, prescreve, o paciente assente. O plano “entra” na cabeça dele ali. O desafio começa quando a porta fecha e a vida real abre — mercado, restaurante, viagem.',
  },
  {
    number: '02',
    Icon: MessagesSquare,
    title: 'Fora dele, a dúvida não pergunta horário',
    description:
      'Troca de carboidrato, porção, equivalência: se tudo vira mensagem sua, duas coisas acontecem — você cansa e ele adia a decisão. Quanto mais isso se repete, mais o plano perde tração.',
  },
  {
    number: '03',
    Icon: Link2,
    title: 'Um link seu encerra a novela',
    description:
      'Sua marca, alimento, gramas e substituições TACO com similaridade — na palma do paciente, sem fila no seu WhatsApp. Você ganha previsibilidade; ele ganha autonomia com critério.',
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
        background: 'rgba(255,255,255,0.13)',
        borderLeft: `3px solid ${T.lime}`,
        border: `1px solid rgba(255,255,255,0.14)`,
        borderLeftWidth: '3px',
        borderLeftColor: T.lime,
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black"
          style={{ background: T.lime, color: T.forest }}
          aria-label={`Passo ${step.number}`}
        >
          {step.number}
        </span>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: T.lime }} aria-hidden>
          <Icon size={20} style={{ color: T.forest }} strokeWidth={2.2} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-[1.1rem] font-bold leading-snug text-white">{step.title}</h3>
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
      className="relative overflow-hidden px-5 py-24 font-sans md:px-16"
      style={{ background: T.forest }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage: `radial-gradient(ellipse 60% 35% at 50% 0%, ${T.lime}50 0%, transparent 70%)`,
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-12">
        <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, ease }}
            className="text-xs font-semibold uppercase tracking-[0.12em]"
            style={{ color: T.lime }}
          >
            Como funciona
          </motion.span>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease, delay: 0.05 }}
            className="text-sm leading-relaxed md:text-base"
            style={{ color: T.bodyOnDark }}
          >
            Se nada mudar depois da consulta, o plano vira PDF bonito e o paciente continua no escuro no corredor. O
            Altfood antecipa essa hora: ele já sabe onde olhar antes de te acionar.
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease, delay: 0.08 }}
            className="text-4xl font-extrabold leading-tight text-white md:text-5xl"
          >
            Três passos.<br />
            <span style={{ color: T.lime }}>Menos ruído no seu dia.</span>
          </motion.h2>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3" role="list" aria-label="Passos da plataforma">
          {steps.map((step, i) => (
            <div key={step.number} role="listitem">
              <StepCard step={step} index={i} inView={inView} />
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease, delay: 0.5 }}
        >
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-bold shadow-lg transition-all hover:scale-105 active:scale-95"
            style={{ background: T.lime, color: T.textDark }}
          >
            Criar minha página e testar com pacientes
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default HowItWorks;
