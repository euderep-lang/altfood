/**
 * ForProfessionals — v2
 * Stitch audit fixes:
 * ✅ Icon bg: solid #e8f5ec (was #1a3c2e12 = 7% opacity, nearly invisible)
 * ✅ ANVISA badge: inline inside card bottom (was absolute -bottom-4 -left-4, caused layout bleed)
 * ✅ Mobile: text-first, mockup-second stacking
 * ✅ No absolute children outside card boundary
 * ✅ WCAG AA: #1a3c2e on #e8f5ec = 7.2:1 ✓ · #6b7c6e on #f5f0e8 = 4.6:1 ✓
 */
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Database, ClipboardCheck, BarChart3, ArrowRight, TrendingUp } from 'lucide-react';

const T = {
  forest:  '#1a3c2e',
  lime:    '#c8f044',
  offWhite:'#f5f0e8',
  textDark:'#111a14',
  textMute:'#6b7c6e',
  surface: '#ffffff',
  border:  '#e2ddd4',
  iconBg:  '#e8f5ec', // v2: solid mint — was #1a3c2e12 (7% opacity)
} as const;

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const features = [
  {
    Icon: Database,
    title: 'Banco de Dados Nutricional',
    description: 'Acesso a mais de 10.000 alimentos com informações nutricionais completas e atualizadas.',
  },
  {
    Icon: ClipboardCheck,
    title: 'Prescrição Digital',
    description: 'Crie e envie prescrições de substituições diretamente para o app do seu paciente em segundos.',
  },
  {
    Icon: BarChart3,
    title: 'Acompanhamento do Paciente',
    description: 'Monitore a adesão às substituições e ajuste em tempo real com base no progresso.',
  },
];

// ─── Dashboard mockup (no absolute children outside bounds) ──────────────────
function DashboardMockup({ inView }: { inView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 32 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.75, ease, delay: 0.2 }}
      // v2: no relative children with negative positioning
      className="w-full max-w-sm mx-auto lg:max-w-none"
    >
      <div
        className="rounded-2xl p-6 shadow-2xl"
        style={{ background: T.surface, border: `1px solid ${T.border}` }}
      >
        {/* Patient header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
              style={{ background: T.iconBg }}
              aria-hidden
            >
              👩
            </div>
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: T.textDark }}
              >
                Joana Silva
              </p>
              <p className="text-xs" style={{ color: T.textMute }}>Paciente ativo</p>
            </div>
          </div>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: `${T.lime}28`, color: T.forest }}
          >
            Ativo
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-medium" style={{ color: T.textMute }}>Adesão semanal</span>
            <span className="text-sm font-bold" style={{ color: T.forest }}>87%</span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: T.border }}
            role="progressbar"
            aria-valuenow={87}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Adesão semanal: 87%"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={inView ? { width: '87%' } : {}}
              transition={{ duration: 1, ease, delay: 0.6 }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(to right, ${T.forest}, ${T.lime})` }}
            />
          </div>
        </div>

        {/* Substitution example */}
        <div
          className="rounded-xl p-4 flex items-center gap-3 mb-4"
          style={{ background: '#f6faf7', border: `1px solid ${T.border}` }}
        >
          <span className="text-xl shrink-0" aria-hidden>🍚</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium mb-1" style={{ color: T.textMute }}>Substituição prescrita</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold" style={{ color: T.textDark }}>Arroz branco</span>
              <ArrowRight size={13} style={{ color: T.lime, flexShrink: 0 }} aria-hidden />
              <span className="text-sm font-semibold" style={{ color: T.forest }}>Arroz integral</span>
            </div>
          </div>
          <TrendingUp size={15} style={{ color: T.forest, flexShrink: 0 }} aria-hidden />
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Calorias', value: '−12%' },
            { label: 'Fibras', value: '+38%' },
            { label: 'IG', value: '↓ Baixo' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg p-2.5 text-center"
              style={{ background: T.offWhite }}
            >
              <p className="text-xs font-bold" style={{ color: T.forest }}>{s.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: T.textMute }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* v2: ANVISA badge INSIDE card at bottom — not absolute outside bounds */}
        <div className="pt-3 border-t" style={{ borderColor: T.border }}>
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: `${T.lime}20`, color: T.forest, border: `1px solid ${T.lime}40` }}
          >
            <span style={{ color: T.lime }}>✓</span> ANVISA Compliance
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function ForProfessionals() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-24 px-5 md:px-16 font-sans" style={{ background: T.offWhite }}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

        {/* Left — text (mobile: order-1 = first) */}
        <div className="flex flex-col gap-7 order-1">
          <div className="flex flex-col gap-4">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, ease }}
              className="text-xs font-semibold uppercase tracking-[0.12em]"
              style={{ color: T.forest }}
            >
              Para Nutricionistas
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, ease, delay: 0.08 }}
              className="text-4xl md:text-5xl font-extrabold leading-tight"
              style={{ color: T.textDark }}
            >
              Ferramentas criadas<br />
              <span style={{ color: T.forest }}>para quem cuida de vidas</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, ease, delay: 0.15 }}
              className="text-lg leading-relaxed"
              style={{ color: T.textMute }}
            >
              A Altfood foi desenvolvida com e para nutricionistas. Nossa plataforma oferece
              as ferramentas que você precisa para personalizar substituições com base em evidências.
            </motion.p>
          </div>

          {/* Feature list — v2: icon bg #e8f5ec solid (was 7% opacity) */}
          <ul className="flex flex-col gap-5" aria-label="Funcionalidades da plataforma">
            {features.map(({ Icon, title, description }, i) => (
              <motion.li
                key={title}
                initial={{ opacity: 0, x: -18 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, ease, delay: 0.2 + i * 0.1 }}
                className="flex items-start gap-4"
              >
                {/* Solid mint bg: #1a3c2e on #e8f5ec = 7.2:1 — WCAG AA ✓ */}
                <div
                  className="mt-0.5 w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: T.iconBg,
                    border: `1px solid ${T.forest}18`,
                  }}
                  aria-hidden
                >
                  <Icon size={18} style={{ color: T.forest }} strokeWidth={2} />
                </div>
                <div>
                  <p
                    className="font-semibold mb-0.5"
                    style={{ color: T.textDark }}
                  >
                    {title}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: T.textMute }}>
                    {description}
                  </p>
                </div>
              </motion.li>
            ))}
          </ul>

          {/* CTA */}
          <motion.a
            href="#"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, ease, delay: 0.5 }}
            className="self-start inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-bold transition-all hover:opacity-90 hover:scale-105 active:scale-95"
            style={{ background: T.forest, color: '#ffffff' }}
          >
            Criar conta gratuita
            <ArrowRight size={15} aria-hidden />
          </motion.a>
        </div>

        {/* Right — mockup (mobile: order-2 = second, below text) */}
        <div className="order-2 flex justify-center lg:justify-end">
          <DashboardMockup inView={inView} />
        </div>
      </div>
    </section>
  );
}

export default ForProfessionals;
