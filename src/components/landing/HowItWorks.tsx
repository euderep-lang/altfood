/**
 * HowItWorks — três passos (consultório → fora dele → link); fundo forest, cards com borda lime.
 * Stitch: card rgba + borda lime; ícones lime sólido; pills 01/02/03; WCAG #b0c4b8 / #c8f044 em #1a3c2e.
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
    title: 'Benefício: consultório que “segura” depois da porta',
    description:
      'Função: você combina meta e porções. Ganho para você: menos paciente perdido na primeira ida ao mercado porque “não lembrava o combinado”.',
  },
  {
    number: '02',
    Icon: MessagesSquare,
    title: 'Benefício: seu WhatsApp deixa de ser o suporte da dieta',
    description:
      'Função: dar um canal oficial. Ganho: cada troca resolvida fora do seu privado reduz atrito, culpa no paciente e sensação de plano que “não pega”.',
  },
  {
    number: '03',
    Icon: Link2,
    title: 'Benefício: conversão em adesão com evidência',
    description:
      'Função: link com sua marca + TACO + gramas + similaridade. Ganho: ele executa com número; você vende continuidade do cuidado sem virar buscador 24h.',
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
            Argumentos em sequência
          </motion.span>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease, delay: 0.05 }}
            className="text-sm leading-relaxed md:text-base max-w-2xl mx-auto"
            style={{ color: T.bodyOnDark }}
          >
            Clareza técnica vende: em três blocos você entende <strong className="text-white">o ganho</strong>, não só
            a lista de funções. O Altfood existe para o paciente executar com a{' '}
            <strong className="text-white">TACO</strong> antes de estourar o seu limite no WhatsApp.
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease, delay: 0.08 }}
            className="text-4xl font-extrabold leading-tight text-white md:text-5xl"
          >
            3 passos.<br />
            <span style={{ color: T.lime }}>1 objetivo: conversão em uso.</span>
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
          className="flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-bold shadow-lg transition-all hover:scale-105 active:scale-95"
            style={{ background: T.lime, color: T.textDark }}
          >
            Começar teste grátis
          </Link>
          <Link
            to="/planos"
            className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-7 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10"
          >
            Ver planos
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default HowItWorks;
