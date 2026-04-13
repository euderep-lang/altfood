/**
 * Seções da landing (roteiro). Textos mantidos; visual = tokens de marca + motion estilo “21st” (whileInView, blur, stagger).
 */
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Heart, Palette, Link2, Sparkles } from 'lucide-react';
import { landingBrand as B } from '@/lib/landingBrand';
import {
  fadeUpSoftVariants,
  fadeUpVariants,
  staggerContainer,
  staggerItem,
  viewportOnce,
  landingEase,
} from '@/components/landing/landingMotion';

export function LandingPainSection() {
  const reduced = useReducedMotion();
  const v = fadeUpVariants(reduced);
  return (
    <section
      className="relative overflow-hidden px-5 py-20 font-sans md:px-16 md:py-28"
      style={{
        background: `linear-gradient(180deg, ${B.paper} 0%, ${B.offwhite} 55%, ${B.surface} 100%)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 10%, color-mix(in srgb, ${B.primary} 12%, transparent) 0%, transparent 45%),
            radial-gradient(circle at 85% 60%, color-mix(in srgb, ${B.secondary} 10%, transparent) 0%, transparent 40%)`,
        }}
        aria-hidden
      />
      <motion.div
        className="relative mx-auto max-w-3xl text-center"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={v}
      >
        <h2 className="text-3xl font-extrabold leading-tight tracking-tight md:text-4xl" style={{ color: B.forest }}>
          Chega de ser um &quot;suporte de dieta&quot; 24h por dia.
        </h2>
        <p className="mx-auto mt-6 max-w-[52rem] text-base leading-[1.65] md:text-lg" style={{ color: B.muted }}>
          Quantas vezes você interrompeu seu descanso ou o atendimento de um novo cliente para responder:{' '}
          <span className="font-semibold" style={{ color: B.forest }}>
            &quot;O que posso comer no lugar do arroz?&quot;
          </span>{' '}
          no WhatsApp?
        </p>
        <p className="mx-auto mt-5 max-w-[52rem] text-base leading-[1.65] md:text-lg" style={{ color: B.muted }}>
          O Altfood resolve isso para você. Você entrega a ferramenta personalizada, o paciente ganha liberdade para
          fazer trocas inteligentes seguindo seus critérios, e você recupera as horas perdidas com suporte manual.
        </p>
      </motion.div>
    </section>
  );
}

export function LandingWhiteLabelSection() {
  const reduced = useReducedMotion();
  const vHead = fadeUpSoftVariants(reduced);
  const vStagger = staggerContainer(reduced, 0.1);
  const vItem = staggerItem(reduced);
  const points = [
    {
      Icon: Palette,
      title: 'Identidade Visual',
      text: 'Configure suas cores e suba seu logotipo em segundos.',
    },
    {
      Icon: Link2,
      title: 'Link Exclusivo',
      text: 'Gere um link personalizado (ex.: altfood.app/seunome) para enviar após a consulta.',
    },
    {
      Icon: Sparkles,
      title: 'Percepção de Valor',
      text: 'Para o seu paciente, você desenvolveu uma tecnologia exclusiva para o acompanhamento dele.',
    },
  ] as const;

  return (
    <section
      className="relative px-5 py-20 font-sans md:px-16 md:py-28"
      style={{ background: B.offwhite }}
    >
      <div className="mx-auto max-w-5xl">
        <motion.h2
          className="text-center text-3xl font-extrabold tracking-tight md:text-4xl"
          style={{ color: B.forest }}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={vHead}
        >
          Não é um app qualquer.{' '}
          <span className="bg-gradient-to-r from-[hsl(170_60%_28%)] to-[hsl(160_50%_36%)] bg-clip-text text-transparent">
            É o SEU app.
          </span>
        </motion.h2>

        <motion.ul
          className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3 md:items-stretch md:gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={vStagger}
        >
          {points.map(({ Icon, title, text }) => (
            <motion.li
              key={title}
              variants={vItem}
              whileHover={reduced ? undefined : { y: -5, transition: { duration: 0.28, ease: landingEase } }}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg"
              style={{
                borderColor: B.border,
                background: `linear-gradient(165deg, ${B.surface} 0%, color-mix(in srgb, ${B.offwhite} 65%, ${B.surface}) 100%)`,
              }}
            >
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `color-mix(in srgb, ${B.primary} 25%, transparent)` }}
                aria-hidden
              />
              <div
                className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl ring-1 ring-black/5"
                style={{
                  background: `linear-gradient(145deg, color-mix(in srgb, ${B.lime} 55%, white), ${B.lime})`,
                  color: B.forest,
                }}
                aria-hidden
              >
                <Icon size={22} strokeWidth={2.2} />
              </div>
              <h3 className="relative text-lg font-bold" style={{ color: B.forest }}>
                {title}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed" style={{ color: B.muted }}>
                {text}
              </p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

export function LandingHowScriptSection() {
  const reduced = useReducedMotion();
  const vHead = fadeUpSoftVariants(reduced);
  const vStagger = staggerContainer(reduced, 0.08);
  const vItem = staggerItem(reduced);
  const steps = [
    {
      n: '1',
      title: 'Assine e personalize seu painel em menos de 2 minutos.',
    },
    {
      n: '2',
      title: 'Envie seu link exclusivo para quantos pacientes quiser (acesso 100% gratuito para eles).',
    },
    {
      n: '3',
      title: 'O paciente faz substituições ilimitadas baseadas em tabelas nutricionais oficiais, sem precisar te mandar mensagem.',
    },
  ] as const;

  return (
    <section
      id="como-funciona"
      className="scroll-mt-24 relative overflow-hidden px-5 py-20 font-sans md:scroll-mt-28 md:px-16 md:py-28"
      style={{ background: B.surface }}
    >
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2 max-w-xl opacity-[0.07]"
        style={{
          background: `radial-gradient(ellipse at 70% 40%, ${B.forest}, transparent 70%)`,
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-4xl">
        <motion.h2
          className="text-center text-3xl font-extrabold tracking-tight md:text-4xl"
          style={{ color: B.forest }}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={vHead}
        >
          Praticidade extrema para você e para o paciente.
        </motion.h2>

        <motion.ol
          className="mt-12 space-y-4 md:space-y-5"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={vStagger}
        >
          {steps.map((s) => (
            <motion.li
              key={s.n}
              variants={vItem}
              whileHover={reduced ? undefined : { x: 4, transition: { duration: 0.25, ease: landingEase } }}
              className="flex gap-4 rounded-2xl border p-5 shadow-sm md:p-6"
              style={{
                borderColor: B.border,
                background: `linear-gradient(90deg, color-mix(in srgb, ${B.primary} 6%, ${B.surface}) 0%, ${B.paper} 100%)`,
              }}
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-black shadow-md"
                style={{
                  background: `linear-gradient(145deg, ${B.lime}, color-mix(in srgb, ${B.lime} 70%, ${B.secondary}))`,
                  color: B.forest,
                }}
              >
                {s.n}
              </span>
              <p className="pt-1.5 text-base font-medium leading-relaxed" style={{ color: B.dark }}>
                {s.title}
              </p>
            </motion.li>
          ))}
        </motion.ol>

        <motion.div
          className="mt-10 flex justify-center"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUpSoftVariants(reduced)}
        >
          <motion.div whileHover={reduced ? undefined : { scale: 1.02 }} whileTap={reduced ? undefined : { scale: 0.98 }}>
            <Link
              to="/register"
              className="inline-flex touch-manipulation rounded-full px-8 py-3.5 text-base font-bold shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(170_60%_30%)]"
              style={{
                background: `linear-gradient(135deg, ${B.forest}, color-mix(in srgb, ${B.forest} 75%, ${B.primary}))`,
                color: B.surface,
              }}
            >
              Quero meu web app personalizado
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/** Avatares servidos de `/public` (evita Unsplash bloqueado por rede, adblock ou políticas). */
const testimonialPhotos = [
  {
    quote:
      'Recuperei meu tempo livre. Antes eu gastava horas no WhatsApp com dúvidas de trocas. O Altfood é o melhor custo-benefício que já vi.',
    name: 'Dr. Ricardo Silva',
    role: 'Nutricionista Clínico',
    src: '/images/testimonials/avatar-ricardo.svg',
  },
  {
    quote:
      'Meus alunos não furam mais a dieta em viagens porque agora sabem substituir sozinhos com o meu app.',
    name: 'Mariana Costa',
    role: 'Personal Trainer',
    src: '/images/testimonials/avatar-mariana.svg',
  },
  {
    quote:
      'O White Label passa uma imagem de tecnologia e cuidado que eleva o nível da minha consulta.',
    name: 'Dr. Felipe Augusto',
    role: 'Nutrologia Esportiva',
    src: '/images/testimonials/avatar-felipe.svg',
  },
] as const;

export function LandingTestimonialsScriptSection() {
  const reduced = useReducedMotion();
  const vHead = fadeUpSoftVariants(reduced);
  const vStagger = staggerContainer(reduced, 0.11);
  const vItem = staggerItem(reduced);

  return (
    <section
      className="relative px-5 py-20 font-sans md:px-16 md:py-28"
      style={{
        background: `linear-gradient(180deg, ${B.offwhite} 0%, ${B.paper} 100%)`,
      }}
    >
      <div className="mx-auto max-w-6xl">
        <motion.h2
          className="text-center text-3xl font-extrabold tracking-tight md:text-4xl"
          style={{ color: B.forest }}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={vHead}
        >
          Quem já transformou o atendimento com o Altfood:
        </motion.h2>

        <motion.div
          className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={vStagger}
        >
          {testimonialPhotos.map((t) => (
            <motion.article
              key={t.name}
              variants={vItem}
              whileHover={reduced ? undefined : { y: -6, transition: { duration: 0.3, ease: landingEase } }}
              className="flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-shadow duration-300 hover:shadow-xl"
              style={{ borderColor: B.border, background: B.surface }}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                <motion.img
                  src={t.src}
                  alt={`Avatar ilustrativo — ${t.name}`}
                  width={800}
                  height={600}
                  className="h-full w-full object-cover object-center"
                  loading="lazy"
                  decoding="async"
                  whileHover={reduced ? undefined : { scale: 1.04 }}
                  transition={{ duration: 0.45, ease: landingEase }}
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-60"
                  aria-hidden
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <blockquote className="flex-1 text-sm leading-relaxed md:text-base" style={{ color: B.dark }}>
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <footer className="mt-4 border-t pt-4 text-sm" style={{ borderColor: B.border }}>
                  <p className="font-bold" style={{ color: B.forest }}>
                    <cite className="font-bold not-italic">{t.name}</cite>
                  </p>
                  <p style={{ color: B.muted }}>{t.role}</p>
                </footer>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <motion.p
          className="mt-12 text-center text-base font-medium"
          style={{ color: B.muted }}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUpSoftVariants(reduced)}
        >
          Junte-se a centenas de profissionais que já automatizaram o suporte nutricional.
        </motion.p>
      </div>
    </section>
  );
}

export function LandingPricingGuaranteeSection() {
  const reduced = useReducedMotion();
  const v = fadeUpVariants(reduced);
  const vSoft = fadeUpSoftVariants(reduced);
  const perks = [
    'Pacientes Ilimitados',
    'Personalização Visual Completa',
    'Sem Taxas de Adesão ou Fidelidade',
    'Seus pacientes não pagam para usar o seu app',
  ] as const;

  return (
    <section
      id="preco"
      className="scroll-mt-24 relative overflow-hidden px-5 py-20 font-sans md:scroll-mt-28 md:px-16 md:py-28"
      style={{ background: B.paper }}
    >
      <div
        className="pointer-events-none absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: `color-mix(in srgb, ${B.lime} 22%, transparent)` }}
        aria-hidden
      />

      <motion.div
        className="relative mx-auto mb-14 max-w-xl px-2 text-center md:mb-16"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={vSoft}
      >
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm"
          style={{ background: `color-mix(in srgb, ${B.lime} 35%, white)`, color: B.forest }}
          aria-hidden
        >
          <Heart className="h-7 w-7 fill-current opacity-90" strokeWidth={1.5} />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: B.primary }}>
          Transparência
        </p>
        <h2 className="mt-2 text-2xl font-black leading-tight tracking-tight md:text-3xl" style={{ color: B.forest }}>
          Um preço para você.{' '}
          <span className="bg-gradient-to-r from-[hsl(170_55%_32%)] to-[hsl(160_45%_38%)] bg-clip-text text-transparent">
            Seus pacientes não pagam nada a mais.
          </span>
        </h2>
        <p className="mt-4 text-base leading-[1.65]" style={{ color: B.muted }}>
          Quem assina o Altfood é o profissional. O acesso dos seus pacientes ao web app com a sua marca está incluído
          no plano — sem cobrança por paciente e sem surpresa no bolso deles.
        </p>
      </motion.div>

      <motion.div
        className="relative mx-auto max-w-lg"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={v}
      >
        <div
          className="relative overflow-hidden rounded-3xl border-2 p-8 shadow-xl md:p-10"
          style={{
            borderColor: `color-mix(in srgb, ${B.forest} 35%, ${B.border})`,
            background: `linear-gradient(180deg, ${B.surface} 0%, color-mix(in srgb, ${B.offwhite} 40%, white) 100%)`,
          }}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[hsl(170_50%_42%)] to-transparent opacity-80"
            aria-hidden
          />
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em]" style={{ color: B.primary }}>
            Plano profissional ilimitado
          </p>
          <p className="mt-4 text-center text-4xl font-black tabular-nums md:text-5xl" style={{ color: B.forest }}>
            R$ 19,90
            <span className="text-lg font-semibold md:text-xl" style={{ color: B.muted }}>
              {' '}
              / mês
            </span>
          </p>
          <p className="mt-1 text-center text-sm" style={{ color: B.muted }}>
            (recorrência mensal)
          </p>
          <ul className="mt-8 space-y-3 text-sm md:text-base" style={{ color: B.dark }}>
            {perks.map((label) => (
              <li key={label} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  style={{ background: `color-mix(in srgb, ${B.lime} 55%, white)`, color: B.forest }}
                  aria-hidden
                >
                  <Check className="h-3.5 w-3.5 stroke-[3]" strokeLinecap="round" strokeLinejoin="round" />
                </span>
                <span>{label}</span>
              </li>
            ))}
          </ul>
          <motion.div className="mt-8" whileHover={reduced ? undefined : { scale: 1.01 }} whileTap={reduced ? undefined : { scale: 0.99 }}>
            <Link
              to="/register"
              className="flex w-full touch-manipulation items-center justify-center rounded-full py-4 text-base font-bold shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(170_60%_30%)]"
              style={{
                background: `linear-gradient(135deg, ${B.lime}, color-mix(in srgb, ${B.lime} 82%, ${B.secondary}))`,
                color: B.forest,
              }}
            >
              Assinar Altfood agora
            </Link>
          </motion.div>
        </div>

        <div
          className="mt-10 rounded-2xl border p-6 text-center md:p-8"
          style={{
            borderColor: `color-mix(in srgb, white 22%, transparent)`,
            background: `linear-gradient(145deg, ${B.forest}, color-mix(in srgb, ${B.forest} 88%, black))`,
            color: B.surface,
          }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: B.lime }}>
            Selo de garantia blindada
          </p>
          <p className="mt-3 text-lg font-extrabold leading-snug md:text-xl">
            7 DIAS DE SATISFAÇÃO GARANTIDA OU SEU DINHEIRO DE VOLTA.
          </p>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: B.onDarkMuted }}>
            Teste o Altfood com seus pacientes. Se você não sentir que economizou tempo e profissionalizou sua marca,
            devolvemos 100% do seu investimento. Sem perguntas.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
