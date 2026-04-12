/**
 * Altfood — Homepage Redesign
 * Framework: Vite + React 18 + TypeScript
 * Design: DESIGN.md tokens (forest #1a3c2e · lime #c8f044 · off-white #f5f0e8)
 * Fonts: Playfair Display (display) · DM Sans (body) · Plus Jakarta Sans (heads)
 * Images: public/images/ (Unsplash placeholders; swap with nano-banana AI images)
 */

import { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HeroSection,
  HowItWorks,
  ForProfessionals,
  Testimonials,
  FooterNewsletter,
} from '@/components/landing';

// ─── Design tokens (mirrors DESIGN.md) ───────────────────────────────────────
const T = {
  forest:   '#1a3c2e',
  lime:     '#c8f044',
  offWhite: '#f5f0e8',
  dark:     '#111a14',
  muted:    '#6b7c6e',
  surface:  '#ffffff',
  border:   '#e2ddd4',
} as const;

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

// ─── Scroll-progress bar ─────────────────────────────────────────────────────
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <motion.div
      style={{ scaleX, transformOrigin: '0%' }}
      className="fixed top-0 left-0 right-0 z-50 h-[3px]"
      aria-hidden
    >
      <div className="h-full w-full" style={{ background: T.lime }} />
    </motion.div>
  );
}

// ─── SEO head helper (Vite: we manage via index.html + this sets page-level meta) ──
function PageMeta() {
  useEffect(() => {
    document.title = 'Altfood — Substituição Alimentar Inteligente para Nutricionistas';
    const setMeta = (name: string, content: string, property?: boolean) => {
      const selector = property
        ? `meta[property="${name}"]`
        : `meta[name="${name}"]`;
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement('meta');
        if (property) { el.setAttribute('property', name); } else { el.setAttribute('name', name); }
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', 'Plataforma de substituição alimentar inteligente para nutricionistas. Mais de 10.000 alimentos. Prescrição digital. Acompanhamento de pacientes.');
    setMeta('og:title', 'Altfood — Substituição Alimentar Inteligente', true);
    setMeta('og:description', 'A plataforma que conecta nutricionistas a alternativas alimentares personalizadas.', true);
    setMeta('og:image', '/images/og-image.jpg', true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:image', '/images/og-image.jpg');
  }, []);

  return null;
}

// ─── Announcement banner ─────────────────────────────────────────────────────
function AnnouncementBanner() {
  return (
    <div
      className="relative z-40 flex items-center justify-center gap-3 py-2.5 px-4 text-sm font-medium text-center"
      style={{ background: T.forest, color: T.lime }}
    >
      <span className="hidden sm:inline">✨</span>
      <span>
        Novo: Prescrição digital agora disponível para todos os planos —{' '}
        <Link
          to="/planos"
          className="underline underline-offset-2 font-semibold hover:opacity-80 transition-opacity"
        >
          Saiba mais
        </Link>
      </span>
    </div>
  );
}

// ─── Image section: professionals (uses public/images/professionals.jpg) ─────
function ProfessionalsImageBreak() {
  return (
    <div className="relative h-[320px] md:h-[440px] overflow-hidden" aria-hidden>
      <img
        src="/images/professionals.jpg"
        alt="Nutricionista usando a plataforma Altfood"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: 'center 30%' }}
      />
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to right, ${T.forest}cc 0%, ${T.forest}66 40%, transparent 100%)`,
        }}
      />
      {/* Pull-quote */}
      <div className="absolute inset-0 flex items-center px-8 md:px-20">
        <div className="max-w-xl">
          <p
            className="text-3xl md:text-4xl font-bold leading-snug mb-4"
            style={{
              color: '#fff',
              fontFamily: '"Playfair Display", Georgia, serif',
            }}
          >
            "A ciência da nutrição,<br />
            <em>na palma da mão dos seus pacientes.</em>"
          </p>
          <div className="w-12 h-1 rounded-full" style={{ background: T.lime }} />
        </div>
      </div>
    </div>
  );
}

// ─── How-it-works image accent ───────────────────────────────────────────────
function HowItWorksImageAccent() {
  return (
    <div
      className="relative overflow-hidden py-10"
      style={{ background: T.offWhite }}
    >
      <div className="max-w-4xl mx-auto px-6 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <span
            className="text-xs font-semibold uppercase tracking-[0.12em] block mb-3"
            style={{ color: T.forest, fontFamily: '"Inter", sans-serif' }}
          >
            Banco de Dados
          </span>
          <h3
            className="text-3xl md:text-4xl font-bold leading-tight mb-4"
            style={{
              color: T.dark,
              fontFamily: '"Playfair Display", Georgia, serif',
            }}
          >
            10.000+ alimentos.<br />
            <span style={{ color: T.forest }}>Infinitas possibilidades.</span>
          </h3>
          <p
            className="text-base leading-relaxed mb-6"
            style={{ color: T.muted, fontFamily: '"DM Sans", sans-serif' }}
          >
            Dados nutricionais completos baseados na Tabela TACO e fontes internacionais,
            atualizados continuamente pela equipe Altfood.
          </p>
          <Link
            to="/planos"
            className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ color: T.forest }}
          >
            Ver planos e preços →
          </Link>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
          <img
            src="/images/how-it-works.jpg"
            alt="Variedade de alimentos frescos e nutritivos"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

// ─── CTA strip ───────────────────────────────────────────────────────────────
function CTAStrip() {
  return (
    <section
      className="py-20 px-6 md:px-16 text-center"
      style={{ background: T.offWhite }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease }}
        className="max-w-2xl mx-auto flex flex-col items-center gap-6"
      >
        <span
          className="text-xs font-semibold uppercase tracking-[0.12em]"
          style={{ color: T.forest, fontFamily: '"Inter", sans-serif' }}
        >
          Pronto para começar?
        </span>
        <h2
          className="text-4xl md:text-5xl font-bold leading-tight"
          style={{
            color: T.dark,
            fontFamily: '"Playfair Display", Georgia, serif',
          }}
        >
          Transforme sua prática nutricional hoje
        </h2>
        <p
          className="text-lg leading-relaxed"
          style={{ color: T.muted, fontFamily: '"DM Sans", sans-serif' }}
        >
          Junte-se a mais de 500 nutricionistas que já prescrevem substituições
          com inteligência e eficiência.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-base font-bold shadow-lg transition-all hover:scale-105 active:scale-95"
            style={{ background: T.lime, color: T.dark }}
          >
            Criar conta gratuita
          </Link>
          <Link
            to="/planos"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-base font-semibold border-2 transition-all hover:opacity-80"
            style={{ borderColor: T.forest, color: T.forest }}
          >
            Ver planos
          </Link>
        </div>
        <p
          className="text-sm"
          style={{ color: T.muted, fontFamily: '"DM Sans", sans-serif' }}
        >
          Sem cartão de crédito · Cancele quando quiser
        </p>
      </motion.div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingRedesign() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <>
      <PageMeta />
      <ScrollProgressBar />

      {/* Skip-to-content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold"
        style={{ background: T.lime, color: T.dark }}
      >
        Ir para conteúdo principal
      </a>

      <AnnouncementBanner />

      <main id="main-content">
        {/* 1 ─ Hero */}
        <HeroSection />

        {/* 2 ─ How it works */}
        <HowItWorks />

        {/* 3 ─ Image break: professionals photo */}
        <ProfessionalsImageBreak />

        {/* 4 ─ For professionals (split layout + dashboard mockup) */}
        <ForProfessionals />

        {/* 5 ─ How-it-works image accent (food db) */}
        <HowItWorksImageAccent />

        {/* 6 ─ Testimonials + stats */}
        <Testimonials />

        {/* 7 ─ Final CTA strip */}
        <CTAStrip />
      </main>

      {/* 8 ─ Footer + newsletter */}
      <FooterNewsletter />
    </>
  );
}
