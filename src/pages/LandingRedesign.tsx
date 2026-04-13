/**
 * Altfood — Landing (roteiro: hero → dor → white label → como funciona → prova social → preço/garantia → rodapé).
 */
import { useEffect } from 'react';
import { useScroll, useTransform, useSpring, motion } from 'framer-motion';
import { HeroSection } from '@/components/landing/HeroSection';
import { landingBrand as B } from '@/lib/landingBrand';
import {
  LandingPainSection,
  LandingWhiteLabelSection,
  LandingHowScriptSection,
  LandingTestimonialsScriptSection,
  LandingPricingGuaranteeSection,
} from '@/components/landing/LandingScriptSections';
import { LandingScriptFooter } from '@/components/landing/LandingScriptFooter';

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1]), { stiffness: 120, damping: 28, mass: 0.4 });
  return (
    <motion.div
      style={{ scaleX, transformOrigin: '0%' }}
      className="fixed top-0 left-0 right-0 z-50 h-[3px]"
      aria-hidden
    >
      <div
        className="h-full w-full"
        style={{
          background: `linear-gradient(90deg, ${B.primary}, ${B.secondary}, ${B.lime})`,
        }}
      />
    </motion.div>
  );
}

function PageMeta() {
  useEffect(() => {
    document.title = 'Altfood — Web app white label de substituições para seu paciente';
    const setMeta = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement('meta');
        if (property) el.setAttribute('property', name);
        else el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta(
      'description',
      'Sua consultoria no bolso do paciente: web app white label com sua marca, substituições oficiais em segundos, pacientes ilimitados. A partir de R$ 19,90/mês. Garantia de 7 dias.'
    );
    setMeta('og:title', 'Altfood — Sua marca. Autonomia para o paciente. Menos WhatsApp.', true);
    setMeta(
      'og:description',
      'White label: personalize cores e logo, envie seu link. Pacientes ilimitados sem taxa de adesão.',
      true
    );
    setMeta('og:image', '/images/og-image.jpg', true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:image', '/images/og-image.jpg');
  }, []);

  return null;
}

export default function LandingRedesign() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <>
      <PageMeta />
      <ScrollProgressBar />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:px-4 focus:py-2 focus:font-semibold focus:shadow-lg focus:ring-2 focus:ring-[#1a3c2e] focus:ring-offset-2 focus:ring-offset-white"
        style={{ background: B.lime, color: B.dark }}
      >
        Ir para conteúdo principal
      </a>

      <main id="main-content">
        <HeroSection />
        <LandingPainSection />
        <LandingWhiteLabelSection />
        <LandingHowScriptSection />
        <LandingTestimonialsScriptSection />
        <LandingPricingGuaranteeSection />
      </main>

      <LandingScriptFooter />
    </>
  );
}
