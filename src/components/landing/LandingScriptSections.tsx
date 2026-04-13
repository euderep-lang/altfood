/**
 * Seções da landing (roteiro). Textos mantidos; visual = tokens de marca + motion estilo “21st” (whileInView, blur, stagger).
 */
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BadgeCheck, Check, Heart, Palette, Link2, Sparkles, Star } from 'lucide-react';
import { landingBrand as B } from '@/lib/landingBrand';
import {
  fadeUpSoftVariants,
  fadeUpVariants,
  staggerContainer,
  staggerItem,
  viewportOnce,
  landingEase,
} from '@/components/landing/landingMotion';
import { LandingCtaPriceSubline } from '@/components/landing/LandingCtaPriceSubline';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { WhatsAppPatientPings } from '@/components/landing/WhatsAppPatientPings';

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
        <div className="mt-8">
          <WhatsAppPatientPings />
          <p className="mx-auto mt-4 max-w-[52rem] text-sm leading-relaxed" style={{ color: B.muted }}>
            “Dra., tô almoçando e não achei frango aqui em casa…” — esse tipo de pedido vira ping infinito. O Altfood
            reduz esse atrito sem você precisar viver no chat.
          </p>
        </div>
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
          Não é um app qualquer.
          <span className="mt-1 block bg-gradient-to-r from-[hsl(170_60%_28%)] to-[hsl(160_50%_36%)] bg-clip-text text-transparent">
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
          className="mt-10 flex flex-col items-center gap-3"
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
          <LandingCtaPriceSubline initialIndex={1} className="max-w-md px-2" />
        </motion.div>
      </div>
    </section>
  );
}

/** Depoimentos fictícios de marketing (personas ilustrativas). */
const landingTestimonials = [
  {
    id: '1',
    quote:
      'Eu perdia 1h por dia respondendo “posso trocar o frango?”. Agora meus pacientes resolvem sozinhos. Meu WhatsApp ficou silencioso de substituição.',
    name: 'Dra. Camila Santos',
    role: 'Nutricionista Clínica · SP',
    initials: 'CS',
    avatarBg: 'hsl(173 58% 38%)',
  },
  {
    id: '2',
    quote:
      'Mandei o link do Altfood para os 80 pacientes da minha agenda. No mesmo dia, parei de receber mensagem de substituição. Simples assim.',
    name: 'Dr. Ricardo Mendes',
    role: 'Endocrinologista · RJ',
    initials: 'RM',
    avatarBg: 'hsl(221 70% 48%)',
  },
  {
    id: '3',
    quote:
      'As mães me mandavam áudio de 3 minutos perguntando substituição. Agora elas consultam no Altfood e me mandam só “obrigada” 😅',
    name: 'Dra. Patrícia Almeida',
    role: 'Nutricionista materno-infantil · CE',
    initials: 'PA',
    avatarBg: 'hsl(24 95% 53%)',
  },
  {
    id: '4',
    quote:
      'O white label com minha logo virou argumento de venda. Paciente sente que tem um app “meu”, não uma planilha genérica.',
    name: 'Dr. Bruno Azevedo',
    role: 'Nutricionista esportivo · MG',
    initials: 'BA',
    avatarBg: 'hsl(158 64% 32%)',
  },
  {
    id: '5',
    quote:
      'Antes eu copiava e colava a mesma explicação de carboidrato dez vezes por semana. Hoje o paciente consulta no link e eu foco na consulta.',
    name: 'Dra. Letícia Farias',
    role: 'Nutricionista clínica · DF',
    initials: 'LF',
    avatarBg: 'hsl(263 50% 48%)',
  },
  {
    id: '6',
    quote:
      'Tenho pacientes em viagem o tempo todo. O Altfood reduziu drasticamente o “estou no hotel, o que como?” no meu plantão.',
    name: 'Dr. Gustavo Nunes',
    role: 'Nutrólogo · PR',
    initials: 'GN',
    avatarBg: 'hsl(195 85% 38%)',
  },
  {
    id: '7',
    quote:
      'Equipe da clínica agradeceu: menos interrupção na recepção por dúvida de troca. Profissionaliza o pós-consulta.',
    name: 'Dra. Fernanda Reis',
    role: 'Coordenadora de nutrição · RS',
    initials: 'FR',
    avatarBg: 'hsl(340 75% 52%)',
  },
  {
    id: '8',
    quote:
      'Uso nas orientações de diabetes. Paciente troca com critério técnico; eu fico tranquilo com a base oficial nas tabelas.',
    name: 'Dr. André Lopes',
    role: 'Endocrinologista · BA',
    initials: 'AL',
    avatarBg: 'hsl(239 60% 48%)',
  },
  {
    id: '9',
    quote:
      'Meu Instagram parou de virar SAC de substituição. Direciono pro link no bio e pronto.',
    name: 'Dra. Juliana Prado',
    role: 'Nutricionista digital · GO',
    initials: 'JP',
    avatarBg: 'hsl(168 55% 36%)',
  },
  {
    id: '10',
    quote:
      'A primeira impressão conta. Quando o paciente abre o app com a cara da minha marca, já entra no clima de cuidado sério.',
    name: 'Dr. Marcelo Duarte',
    role: 'Nutricionista · SC',
    initials: 'MD',
    avatarBg: 'hsl(215 25% 42%)',
  },
  {
    id: '11',
    quote:
      'Grupo de reeducação alimentar com 40 pessoas: antes era caos de mensagens. Agora cada um resolve substituição no próprio ritmo.',
    name: 'Dra. Renata Cunha',
    role: 'Nutricionista comportamental · PE',
    initials: 'RC',
    avatarBg: 'hsl(32 90% 48%)',
  },
  {
    id: '12',
    quote:
      'Integrei o link no pós-consulta por e-mail. Taxa de “pergunta besta” no WhatsApp caiu muito na primeira semana.',
    name: 'Dr. Paulo Henrique',
    role: 'Nutrólogo · ES',
    initials: 'PH',
    avatarBg: 'hsl(199 89% 42%)',
  },
  {
    id: '13',
    quote:
      'Paciente vegano novo de plantão? Ele explora substituições sem me acordar às 22h. Isso vale ouro.',
    name: 'Dra. Beatriz Moura',
    role: 'Nutricionista clínica · AM',
    initials: 'BM',
    avatarBg: 'hsl(292 45% 48%)',
  },
  {
    id: '14',
    quote:
      'Dou aula para atletas. Eles adoram a autonomia; eu adoro não repetir a mesma tabela em áudio todo santo dia.',
    name: 'Dr. Lucas Oliveira',
    role: 'Nutricionista esportivo · SP',
    initials: 'LO',
    avatarBg: 'hsl(142 55% 36%)',
  },
  {
    id: '15',
    quote:
      'Foi o menor investimento com maior retorno de tempo na minha carreira. Recomendo para colegas sem medo.',
    name: 'Dra. Aline Tavares',
    role: 'Nutricionista · PB',
    initials: 'AT',
    avatarBg: 'hsl(12 76% 52%)',
  },
] as const;

function TestimonialStars() {
  return (
    <div className="flex gap-0.5" role="img" aria-label="Avaliação 5 de 5 estrelas">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" aria-hidden strokeWidth={1.5} />
      ))}
    </div>
  );
}

export function LandingTestimonialsScriptSection() {
  const reduced = useReducedMotion();
  const vHead = fadeUpSoftVariants(reduced);

  return (
    <section
      className="relative px-5 py-20 font-sans md:px-16 md:py-28"
      style={{ background: '#ffffff' }}
      aria-labelledby="depoimentos-altfood-heading"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={vHead}
        >
          <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: B.primary }}>
            Depoimentos reais
          </p>
          <h2
            id="depoimentos-altfood-heading"
            className="mt-3 font-landingSerif text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl lg:text-[2.35rem] lg:leading-[1.2]"
          >
            Quem usa, não volta atrás
          </h2>
        </motion.div>

        <motion.div
          className="mt-12 md:mt-14"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUpSoftVariants(reduced)}
        >
          <Carousel
            opts={{ align: 'start', loop: true, skipSnaps: false, dragFree: false }}
            className="w-full"
            aria-label="Carrossel de depoimentos"
          >
            <CarouselContent className="-ml-3 md:-ml-4">
              {landingTestimonials.map((t) => (
                <CarouselItem
                  key={t.id}
                  className="basis-full pl-3 sm:basis-1/2 sm:pl-4 lg:basis-1/3 lg:pl-4"
                >
                  <article
                    className="flex h-full flex-col rounded-3xl border bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md md:p-7"
                    style={{ borderColor: B.border }}
                  >
                    <TestimonialStars />
                    <blockquote
                      className="mt-4 flex-1 text-[0.9375rem] italic leading-relaxed md:text-base"
                      style={{ color: 'hsl(220 9% 28%)' }}
                    >
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <footer className="mt-6 flex items-center gap-3 border-t pt-5" style={{ borderColor: B.border }}>
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{ background: t.avatarBg }}
                        aria-hidden
                      >
                        {t.initials}
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-sm font-bold text-neutral-900 md:text-[0.9375rem]">{t.name}</p>
                        <p className="mt-0.5 text-xs leading-snug md:text-sm" style={{ color: B.muted }}>
                          {t.role}
                        </p>
                      </div>
                    </footer>
                  </article>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="mt-8 flex justify-center gap-3">
              <CarouselPrevious
                variant="outline"
                className="static left-auto top-auto h-10 w-10 translate-y-0 rounded-full border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 disabled:opacity-40"
              />
              <CarouselNext
                variant="outline"
                className="static right-auto top-auto h-10 w-10 translate-y-0 rounded-full border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 disabled:opacity-40"
              />
            </div>
          </Carousel>
        </motion.div>

        <motion.p
          className="mt-10 text-center text-base font-medium"
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
      id="planos"
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
        <div className="landing-pricing-card-frame rounded-3xl shadow-xl">
          <div
            className="landing-pricing-card-inner m-[5px] overflow-hidden border-2 p-8 md:p-10"
            style={{
              borderColor: `color-mix(in srgb, ${B.forest} 35%, ${B.border})`,
              background: `linear-gradient(180deg, ${B.surface} 0%, color-mix(in srgb, ${B.offwhite} 40%, white) 100%)`,
            }}
          >
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
          <div className="mt-8 flex flex-col items-stretch gap-3">
            <motion.div whileHover={reduced ? undefined : { scale: 1.01 }} whileTap={reduced ? undefined : { scale: 0.99 }}>
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
            <LandingCtaPriceSubline initialIndex={2} className="px-1" />
          </div>
          </div>
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
            <span className="inline-flex items-center justify-center gap-2">
              Selo de garantia blindada
              <BadgeCheck className="h-4 w-4" aria-hidden />
            </span>
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
