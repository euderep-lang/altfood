/**
 * Secções inspiradas na estrutura de páginas tipo Dieta.ai (dieta.ai):
 * benefícios em destaque, grelha de funcionalidades, FAQ em acordeão, CTA final de dúvidas.
 * Copy específico do produto Altfood (B2B / white label).
 */
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgePercent,
  BookOpen,
  Gift,
  LayoutDashboard,
  Link2,
  MessageCircle,
  Palette,
  ShieldCheck,
  Smartphone,
  Users,
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { landingBrand as B } from '@/lib/landingBrand';
import { fadeUpSoftVariants, fadeUpVariants, viewportOnce, landingEase } from '@/components/landing/landingMotion';
import { LandingCtaPriceSubline } from '@/components/landing/LandingCtaPriceSubline';

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: B.primary }}>
      {children}
    </p>
  );
}

/** Duas faixas de benefício + CTA secundário (ritmo tipo dieta.ai). */
export function LandingBenefitSplitSection() {
  const reduced = useReducedMotion();
  const v = fadeUpVariants(reduced);
  const cards = [
    {
      title: 'O paciente consulta substituições em segundos',
      body: 'Em vez de esperar resposta no WhatsApp, ele acessa o web app com a sua marca e troca alimentos com base em tabelas de referência oficiais.',
      href: '#como-funciona',
      cta: 'Ver como funciona',
      external: false as const,
    },
    {
      title: 'Você recupera horas da semana',
      body: 'Menos interrupções, mais tempo para novos pacientes e para aprofundar o acompanhamento — por um valor simbólico em relação ao tempo economizado.',
      href: '/planos',
      cta: 'Ver planos',
      external: false as const,
    },
  ] as const;

  return (
    <section
      className="border-y px-5 py-16 font-sans md:px-16 md:py-24"
      style={{ borderColor: B.border, background: B.surface }}
      aria-labelledby="beneficios-altfood-heading"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-10 max-w-3xl md:mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={v}
        >
          <Eyebrow>Para o seu consultório</Eyebrow>
          <h2 id="beneficios-altfood-heading" className="mt-3 text-3xl font-black tracking-tight md:text-4xl lg:text-[2.65rem] lg:leading-[1.1]" style={{ color: B.forest }}>
            Tudo o que o paciente precisa para trocar alimentos, sem sobrecarregar você.
          </h2>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 md:gap-8">
          {cards.map((c) => (
            <motion.div
              key={c.title}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={fadeUpSoftVariants(reduced)}
              whileHover={reduced ? undefined : { y: -3, transition: { duration: 0.25, ease: landingEase } }}
              className="flex flex-col rounded-3xl border p-7 shadow-sm md:p-9"
              style={{ borderColor: B.border, background: B.paper }}
            >
              <h3 className="text-xl font-extrabold leading-snug md:text-2xl" style={{ color: B.forest }}>
                {c.title}
              </h3>
              <p className="mt-4 flex-1 text-base leading-[1.65]" style={{ color: B.muted }}>
                {c.body}
              </p>
              {c.href.startsWith('/') ? (
                <Link
                  to={c.href}
                  className="mt-6 inline-flex touch-manipulation items-center gap-2 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(170_60%_30%)]"
                  style={{ color: B.primary }}
                >
                  {c.cta}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              ) : (
                <a
                  href={c.href}
                  className="mt-6 inline-flex touch-manipulation items-center gap-2 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(170_60%_30%)]"
                  style={{ color: B.primary }}
                >
                  {c.cta}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const featureItems = [
  { Icon: BookOpen, title: 'Substituições com referência', text: 'Trocas guiadas por tabelas nutricionais oficiais, no contexto do seu plano.' },
  { Icon: Palette, title: 'Marca e cores suas', text: 'Logo, paleta e link exclusivo — o paciente vê o app como extensão do seu consultório.' },
  { Icon: Link2, title: 'Um link para enviar', text: 'Depois da consulta, envie o acesso; nada de instalar app de terceiros com outro nome.' },
  { Icon: Users, title: 'Pacientes ilimitados', text: 'Cresça a carteira sem limite artificial de cadastros no plano profissional.' },
  { Icon: BadgePercent, title: 'Sem taxa de adesão', text: 'Assinatura mensal simples; sem fidelidade forçada no discurso comercial do produto.' },
  { Icon: LayoutDashboard, title: 'Painel enxuto', text: 'Configure white label e acompanhe o essencial sem curva de aprendizado longa.' },
  { Icon: Gift, title: 'Grátis para o paciente', text: 'Quem paga a assinatura é o profissional; o acesso do paciente ao app não é cobrado por paciente.' },
  { Icon: MessageCircle, title: 'Suporte humano', text: 'Dúvidas sobre a plataforma: fale com a equipe Altfood quando precisar.' },
] as const;

/** Grelha densa de funcionalidades (padrão “Mais funcionalidades” do Dieta.ai). */
export function LandingFeatureMatrixSection() {
  const reduced = useReducedMotion();
  const vHead = fadeUpSoftVariants(reduced);
  const v = fadeUpVariants(reduced);

  return (
    <section
      className="px-5 py-16 font-sans md:px-16 md:py-24"
      style={{ background: B.offwhite }}
      aria-labelledby="funcionalidades-altfood-heading"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={vHead}
        >
          <Eyebrow>Funcionalidades</Eyebrow>
          <h2 id="funcionalidades-altfood-heading" className="mt-3 text-3xl font-black tracking-tight md:text-4xl lg:text-[2.5rem]" style={{ color: B.forest }}>
            Mais ferramentas para facilitar o seu dia a dia
          </h2>
          <p className="mt-4 text-base leading-[1.65] md:text-lg" style={{ color: B.muted }}>
            Além do white label e do link exclusivo, o Altfood concentra o que importa para reduzir ruído no WhatsApp e
            dar autonomia ao paciente.
          </p>
        </motion.div>

        <motion.ul
          className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={v}
        >
          {featureItems.map(({ Icon, title, text }) => (
            <li
              key={title}
              className="rounded-2xl border p-5 transition-shadow duration-300 hover:shadow-md"
              style={{ borderColor: B.border, background: B.surface }}
            >
              <div
                className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: `color-mix(in srgb, ${B.lime} 45%, white)`, color: B.forest }}
                aria-hidden
              >
                <Icon className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <h3 className="text-sm font-bold md:text-base" style={{ color: B.forest }}>
                {title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed md:text-sm" style={{ color: B.muted }}>
                {text}
              </p>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

const faqItems = [
  {
    q: 'O Altfood substitui a consulta nutricional?',
    a: 'Não. O Altfood é uma ferramenta de apoio para substituições de alimentos com base em referências oficiais. O planejamento, a individualização e a responsabilidade clínica continuam com você, o profissional.',
  },
  {
    q: 'Como funciona o white label?',
    a: 'Você define cores e envia seu logotipo no painel. O paciente acessa um web app que exibe a identidade da sua marca e um link exclusivo (formato tipo altfood.app/seunome), reforçando percepção de valor.',
  },
  {
    q: 'Meus pacientes precisam pagar para usar?',
    a: 'No modelo atual do Altfood para profissionais, a assinatura é sua; o acesso do paciente ao app não é cobrado por paciente. Consulte sempre os termos e o plano ativo na página de planos.',
  },
  {
    q: 'Posso cancelar a assinatura?',
    a: 'Sim. A renovação é recorrente; você pode gerenciar ou cancelar conforme as regras exibidas na sua área de cobrança e nos termos de uso. Em caso de dúvida, fale com o suporte.',
  },
  {
    q: 'O que está incluso no plano profissional?',
    a: 'White label (cores e logo), link exclusivo, pacientes ilimitados no discurso comercial do produto e substituições com base nas tabelas disponibilizadas na plataforma. Detalhes atualizados em /planos.',
  },
  {
    q: 'Como funciona a garantia de 7 dias?',
    a: 'Se nos primeiros 7 dias você não sentir que o Altfood ajudou a economizar tempo e a profissionalizar sua marca, pode solicitar reembolso conforme a política vigente — sem burocracia desnecessária.',
  },
] as const;

/** FAQ em acordeão (padrão Dieta.ai / SEO + conversão). */
export function LandingFaqSection() {
  const reduced = useReducedMotion();
  const vHead = fadeUpSoftVariants(reduced);

  return (
    <section
      id="faq"
      className="scroll-mt-24 border-t px-5 py-16 font-sans md:scroll-mt-28 md:px-16 md:py-24"
      style={{ borderColor: B.border, background: B.surface }}
      aria-labelledby="faq-altfood-heading"
    >
      <div className="mx-auto max-w-3xl">
        <motion.div
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={vHead}
        >
          <Eyebrow>Perguntas frequentes</Eyebrow>
          <h2 id="faq-altfood-heading" className="mt-3 text-3xl font-black tracking-tight md:text-4xl" style={{ color: B.forest }}>
            Tudo o que você precisa saber sobre o Altfood
          </h2>
        </motion.div>

        <Accordion type="single" collapsible className="mt-10 w-full rounded-2xl border px-2 md:px-4" style={{ borderColor: B.border }}>
          {faqItems.map((item, i) => (
            <AccordionItem key={item.q} value={`item-${i}`} className="border-b last:border-b-0" style={{ borderColor: B.border }}>
              <AccordionTrigger className="text-left text-base font-semibold text-[#1a3c2e] hover:no-underline md:text-[1.05rem]">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-[#6b7c6e] md:text-base">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/** Bloco final “Ainda tem dúvidas?” + suporte (inspirado no rodapé do Dieta.ai). */
export function LandingDoubtsCtaSection() {
  const reduced = useReducedMotion();
  const v = fadeUpSoftVariants(reduced);

  return (
    <section
      className="px-5 py-14 font-sans md:px-16 md:py-20"
      style={{ background: `linear-gradient(180deg, ${B.paper} 0%, ${B.offwhite} 100%)` }}
      aria-labelledby="duvidas-altfood-heading"
    >
      <motion.div
        className="mx-auto flex max-w-4xl flex-col items-center rounded-3xl border px-6 py-10 text-center shadow-sm md:px-12 md:py-12"
        style={{ borderColor: B.border, background: B.surface }}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={v}
      >
        <div
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: `color-mix(in srgb, ${B.primary} 12%, ${B.surface})`, color: B.forest }}
          aria-hidden
        >
          <Smartphone className="h-7 w-7" strokeWidth={1.75} />
        </div>
        <h2 id="duvidas-altfood-heading" className="text-2xl font-black tracking-tight md:text-3xl" style={{ color: B.forest }}>
          Ainda tem dúvidas?
        </h2>
        <p className="mt-3 max-w-xl text-base leading-[1.65]" style={{ color: B.muted }}>
          Não encontrou a resposta no FAQ? Se já é assinante, entre na conta e use o suporte no painel. Ainda não assinou?
          Comece pelo cadastro — levamos menos de dois minutos.
        </p>
        <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Link
            to="/login"
            className="inline-flex min-h-12 touch-manipulation items-center justify-center gap-2 rounded-full border-2 px-8 py-3.5 text-sm font-bold transition-colors hover:bg-muted/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(170_60%_30%)]"
            style={{ borderColor: B.forest, color: B.forest }}
          >
            <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
            Entrar na minha conta
          </Link>
          <div className="flex w-full flex-col items-center gap-2 sm:w-auto">
            <Link
              to="/register"
              className="inline-flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(170_60%_30%)] sm:w-auto"
              style={{ background: B.lime, color: B.forest }}
            >
              Assinar agora
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
            </Link>
            <LandingCtaPriceSubline initialIndex={2} className="w-full max-w-xs sm:max-w-none" />
          </div>
        </div>
        <Link to="/planos" className="mt-6 text-sm font-semibold underline-offset-4 hover:underline" style={{ color: B.primary }}>
          Ver planos e detalhes
        </Link>
      </motion.div>
    </section>
  );
}
