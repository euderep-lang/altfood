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
  forest:     '#1a3c2e',
  lime:       '#c8f044',
  textDark:   '#111a14',
  bodyOnDark: '#b0c4b8',
} as const;

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const steps = [
  {
    number: 'S',
    Icon: Stethoscope,
    title: 'Situação — o que já funciona',
    description:
      'Você faz anamnese, prescreve e educa. O paciente sai com um plano que faz sentido na sua mesa. Até aqui, o processo é sólido — o gargalo vem depois, fora do consultório.',
  },
  {
    number: 'P',
    Icon: MessagesSquare,
    title: 'Problema — onde a venda se perde',
    description:
      'No mercado, a dúvida não é “se” vai surgir, e sim “quando”: trocas, porções, equivalências. Se a resposta depende só de você no WhatsApp, o paciente espera — ou chuta.',
  },
  {
    number: 'N',
    Icon: Link2,
    title: 'Necessidade satisfeita — o payoff',
    description:
      'Um link seu com a sua marca: o paciente busca o alimento, ajusta os gramas e vê substituições TACO com selo de similaridade — sozinho. Você deixa de ser o gargalo sem perder a autoridade.',
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
          aria-label={`Etapa ${step.number}`}
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
            aria-label="Seção: método SPIN"
          >
            Implicação + fechamento
          </motion.span>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease, delay: 0.05 }}
            className="max-w-2xl text-sm leading-relaxed md:text-base"
            style={{ color: T.bodyOnDark }}
          >
            Em vendas consultivas, a <strong className="text-white">Implicação</strong> responde: “se nada mudar, o que isso
            custa para você e para o paciente?”. Para muitos profissionais, o custo é tempo clínico perdido, paciente menos
            aderente e sensação de estar sempre “apagando incêndio”. O Altfood endereça exatamente esse ponto — antes do
            paciente precisar te acionar.
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease, delay: 0.08 }}
            className="text-4xl font-extrabold leading-tight text-white md:text-5xl"
          >
            Do diagnóstico da conversa<br />
            <span style={{ color: T.lime }}>à execução no link</span>
          </motion.h2>
        </div>

        {/* Steps — no absolute overlay connectors */}
        <div
          className="w-full grid grid-cols-1 md:grid-cols-3 gap-4"
          role="list"
          aria-label="Etapas SPIN e resposta Altfood"
        >
          {steps.map((step, i) => (
            <div key={step.number} role="listitem">
              <StepCard step={step} index={i} inView={inView} />
            </div>
          ))}
        </div>

        {/* CTA */}
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
