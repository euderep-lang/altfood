/**
 * Rodapé da landing (roteiro). Textos mantidos; fundo e CTA com tokens de marca.
 */
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { landingBrand as B } from '@/lib/landingBrand';
import { fadeUpVariants, viewportOnce } from '@/components/landing/landingMotion';
import { LandingCtaPriceSubline } from '@/components/landing/LandingCtaPriceSubline';

export function LandingScriptFooter() {
  const reduced = useReducedMotion();
  const v = fadeUpVariants(reduced);

  return (
    <footer className="relative overflow-hidden font-sans" style={{ background: B.forest }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, color-mix(in srgb, ${B.lime} 35%, transparent), transparent),
            radial-gradient(circle at 100% 100%, color-mix(in srgb, ${B.primary} 25%, transparent), transparent)`,
        }}
        aria-hidden
      />
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" aria-hidden />

      <motion.div
        className="relative mx-auto max-w-2xl px-5 py-16 text-center md:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={v}
      >
        <p className="text-xl font-semibold leading-snug text-white md:text-2xl">
          O próximo nível do seu atendimento custa menos que um café por semana. Comece agora.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <motion.div
            className="inline-block"
            whileHover={reduced ? undefined : { scale: 1.03 }}
            whileTap={reduced ? undefined : { scale: 0.98 }}
          >
            <Link
              to="/register"
              className="inline-flex min-h-12 touch-manipulation items-center justify-center gap-2 rounded-full px-10 py-4 text-base font-bold shadow-lg ring-2 ring-black/10 transition-shadow hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              style={{ background: B.lime, color: B.forest }}
            >
              Garantir meu Altfood PRO agora
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
          </motion.div>
          <LandingCtaPriceSubline tone="onDark" initialIndex={1} className="max-w-md px-2" />
        </div>
        <p className="mt-10 text-sm" style={{ color: B.onDarkMuted }}>
          Altfood © {new Date().getFullYear()} – Todos os direitos reservados.
        </p>
      </motion.div>
    </footer>
  );
}

export default LandingScriptFooter;
