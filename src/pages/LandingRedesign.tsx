/**
 * Altfood — Homepage Redesign
 * Framework: Vite + React 18 + TypeScript
 * Design: DESIGN.md tokens (forest #1a3c2e · lime #c8f044 · off-white #f5f0e8)
 * Tipografia: Raleway (site inteiro; @fontsource em main.tsx)
 * Images: public/images/ (Unsplash placeholders; swap with nano-banana AI images)
 */

import { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HeroSection,
  TrustAndObjections,
  HowItWorks,
  ForProfessionals,
  Testimonials,
  FooterNewsletter,
} from '@/components/landing';
import { BRAND_MARK_SRC } from '@/components/AltfoodLogo';

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
    document.title = 'Altfood — Página do paciente com TACO e sua marca | Menos WhatsApp';
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

    setMeta(
      'description',
      'Converta visitas em execução do plano: link público com sua marca, substituições na Tabela TACO (gramas e similaridade), sem app. Planos claros, HTTPS, cancele quando quiser.'
    );
    setMeta('og:title', 'Altfood — Uma página. Sua marca. TACO no celular do paciente.', true);
    setMeta(
      'og:description',
      'Objetivo único: o paciente consulta antes de te bombardear. Você vende clareza e limite — não só uma ferramenta.',
      true
    );
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
      className="relative z-40 flex items-center justify-center gap-3 py-2.5 px-4 text-sm font-medium text-center font-sans"
      style={{ background: T.forest, color: T.lime }}
    >
      <img
        src={BRAND_MARK_SRC}
        alt=""
        width={22}
        height={22}
        className="h-5 w-5 shrink-0 rounded-lg object-cover opacity-95 hidden sm:block"
        decoding="async"
        aria-hidden
      />
      <span className="hidden sm:inline">✨</span>
      <span>
        Teste grátis na prática:{' '}
        <Link to="/register" className="font-semibold underline underline-offset-2 transition-opacity hover:opacity-80">
          criar minha página
        </Link>
        {' · '}
        <Link to="/planos" className="font-semibold underline underline-offset-2 transition-opacity hover:opacity-80">
          ver planos
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
      <div className="absolute inset-0 flex items-center px-8 md:px-20 font-sans">
        <div className="max-w-xl">
          <p className="mb-4 text-2xl font-bold leading-snug text-white md:text-3xl">
            O visitante compra o que enxerga: <em>profissional no consultório</em>, não o caos do pós-consulta no
            celular.
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
    <div className="relative overflow-hidden py-10 font-sans" style={{ background: T.offWhite }}>
      <div className="max-w-4xl mx-auto px-6 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: T.forest }}>
            Prova de valor
          </span>
          <h3 className="mb-4 text-2xl font-bold leading-tight md:text-3xl" style={{ color: T.dark }}>
            Interface real.<br />
            <span style={{ color: T.forest }}>Confiança em segundos.</span>
          </h3>
          <p className="mb-6 text-sm leading-relaxed md:text-base" style={{ color: T.muted }}>
            Quem compra software quer ver a tela: macros, gramas e etiquetas de similaridade iguais às que o paciente vê
            no link. Menos promessa vaga, mais “é isso que vou enviar para a minha base”.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: T.lime, color: T.dark }}
            >
              Começar agora
            </Link>
            <Link
              to="/planos"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
              style={{ color: T.forest }}
            >
              Ver planos →
            </Link>
          </div>
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
    <section className="py-20 px-6 md:px-16 text-center font-sans" style={{ background: T.offWhite }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease }}
        className="max-w-2xl mx-auto flex flex-col items-center gap-6"
      >
        <span className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: T.forest }}>
          Call to action
        </span>
        <h2 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color: T.dark }}>
          Um objetivo nesta página:<br />
          <span style={{ color: T.forest }}>você começar hoje.</span>
        </h2>
        <p className="text-base leading-relaxed max-w-lg" style={{ color: T.muted }}>
          Cadastro leva poucos minutos. Em seguida você personaliza o link e já pode mandar para o primeiro paciente. Sem
          instalação do lado dele — só o que importa para converter confiança em adesão.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-base font-bold shadow-lg transition-all hover:scale-105 active:scale-95"
            style={{ background: T.lime, color: T.dark }}
          >
            Começar teste grátis
          </Link>
          <Link
            to="/planos"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-base font-semibold border-2 transition-all hover:opacity-80"
            style={{ borderColor: T.forest, color: T.forest }}
          >
            Ver planos e preços
          </Link>
        </div>
        <p className="text-sm" style={{ color: T.muted }}>
          Transparência: veja o que cada plano inclui. Assinatura cancelável.
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
        {/* 1 ─ Hero (gancho + demo) */}
        <HeroSection />

        {/* 2 ─ Confiança + objeções */}
        <TrustAndObjections />

        {/* 3 ─ Como funciona (benefícios em passos) */}
        <HowItWorks />

        {/* 4 ─ Image break: professionals photo */}
        <ProfessionalsImageBreak />

        {/* 5 ─ Benefícios + mock painel */}
        <ForProfessionals />

        {/* 6 ─ Prova visual + CTAs secundários */}
        <HowItWorksImageAccent />

        {/* 7 ─ Prova social */}
        <Testimonials />

        {/* 8 ─ Fechamento conversão */}
        <CTAStrip />
      </main>

      {/* 8 ─ Footer + newsletter */}
      <FooterNewsletter />
    </>
  );
}
