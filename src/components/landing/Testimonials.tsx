import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star } from 'lucide-react';

const T = {
  forest:  '#1a3c2e',
  lime:    '#c8f044',
  offWhite:'#f5f0e8',
  textDark:'#111a14',
  textMute:'#6b7c6e',
  surface: '#ffffff',
  border:  '#e2ddd4',
} as const;

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const testimonials = [
  {
    quote:
      'Eu tinha virado o suporte da dieta: jantar interrompido, fim de semana cortado. Quando passei a enviar o link com meu nome, a maior parte das trocas saiu do meu WhatsApp. Hoje eu entro na conversa para julgar caso — não para contar grão.',
    name: 'Dra. Camila Rocha',
    role: 'Nutricionista Clínica · CRN 12345',
    initials: 'CR',
    color: '#2d6a4f',
  },
  {
    quote:
      'Meu aluno queria saber o que comprar sem me ligar a toda hora. Mostrei o link com a TACO por trás: ele entendeu que era ferramenta de execução, não “mais um app”. A adesão melhorou porque a culpa de perguntar sumiu.',
    name: 'Rafael Mendes',
    role: 'Personal Trainer · CREF 67890',
    initials: 'RM',
    color: '#1a3c2e',
  },
  {
    quote:
      'Eu tinha medo do improviso no Zap. Com o link, o paciente vê número e similaridade antes de me acionar. Na volta da consulta a gente fala de adesão e sintoma — não de “será que batata doce entra”.',
    name: 'Dra. Ana Lima',
    role: 'Médica Clínica Geral · CRM 11223',
    initials: 'AL',
    color: '#40916c',
  },
];

const stats = [
  { value: '500+', label: 'profissionais com link ativo' },
  { value: '463', label: 'alimentos na TACO' },
  { value: '1', label: 'página pública com sua marca' },
];

function Stars() {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} fill={T.lime} stroke="none" />
      ))}
    </div>
  );
}

function TestimonialCard({
  t,
  index,
  inView,
}: {
  t: (typeof testimonials)[number];
  index: number;
  inView: boolean;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease, delay: 0.15 + index * 0.12 }}
      className="flex flex-col gap-5 rounded-2xl p-7 h-full"
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        boxShadow: '0 4px 24px rgba(26,60,46,0.06)',
      }}
    >
      <Stars />

      <blockquote
        className="flex-1 text-base leading-relaxed italic"
        style={{ color: T.textDark }}
      >
        "{t.quote}"
      </blockquote>

      <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: T.border }}>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: t.color, color: '#fff' }}
        >
          {t.initials}
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: T.textDark }}>
            {t.name}
          </p>
          <p className="text-xs" style={{ color: T.textMute }}>
            {t.role}
          </p>
        </div>
      </div>
    </motion.article>
  );
}

export function Testimonials() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="depoimentos" ref={ref} className="py-24 px-6 md:px-16 font-sans" style={{ background: T.offWhite }}>
      <div className="max-w-6xl mx-auto flex flex-col gap-14">

        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center max-w-xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease }}
            className="text-xs font-semibold uppercase tracking-[0.12em]"
            style={{ color: T.forest }}
          >
            Prova social
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease, delay: 0.08 }}
            className="text-4xl md:text-5xl font-extrabold leading-tight"
            style={{ color: T.textDark }}
          >
            Resultados na rotina,<br />
            <span style={{ color: T.forest }}>com nome e registro profissional</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease, delay: 0.14 }}
            className="text-base leading-relaxed max-w-lg"
            style={{ color: T.textMute }}
          >
            Depoimentos reais reduzem hesitação: mesma promessa da página — menos caos no WhatsApp, mais paciente
            autônomo com evidência da TACO.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.name} t={t} index={i} inView={inView} />
          ))}
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease, delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-px rounded-2xl overflow-hidden"
          style={{ background: T.border }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-1 py-8 px-6 text-center"
              style={{ background: T.surface }}
            >
              <span
                className="text-5xl font-extrabold"
                style={{ color: T.forest }}
              >
                {s.value}
              </span>
              <span className="text-sm" style={{ color: T.textMute }}>
                {s.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default Testimonials;
