/** Hero — roteiro Altfood (textos fixos). Visual e motion: marca real + estilo “21st” (blur-in, mesh, orbs). */
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { HeroAnimatedBackdrop } from '@/components/landing/HeroAnimatedBackdrop';
import { LandingCtaPriceSubline } from '@/components/landing/LandingCtaPriceSubline';
import { PatientPagePhoneMockup } from '@/components/landing/PatientPagePhoneMockup';
import { BRAND_MARK_SRC } from '@/components/AltfoodLogo';
import { landingBrand as B } from '@/lib/landingBrand';
import { fadeUpVariants, landingEase, staggerContainer, staggerItem } from '@/components/landing/landingMotion';

/** Demo white label com cor primária da marca (floresta), não paleta genérica */
const CLINIC_BRAND = {
  primaryColor: B.forest,
  brandName: 'Clínica Saúde & Bem-Estar',
  brandSubtitle: 'White label · Consultoria integrativa',
  initials: 'CS',
} as const;

export function HeroSection() {
  const reduced = useReducedMotion();
  const vFade = fadeUpVariants(reduced);
  const vStagger = staggerContainer(reduced, 0.09);
  const vItem = staggerItem(reduced);
  const vTextGroup: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduced ? 0 : 0.09,
        delayChildren: reduced ? 0 : 0.04,
      },
    },
  };

  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden font-sans text-white">
      {/* Base + malha animada (estilo Dieta.ai) + textura */}
      <div className="absolute inset-0 gradient-dark" aria-hidden />
      <HeroAnimatedBackdrop reducedMotion={reduced} />
      <div
        className="absolute inset-0 z-[1] hero-pattern opacity-[0.14]"
        style={{ maskImage: 'linear-gradient(180deg, black 0%, transparent 88%)' }}
        aria-hidden
      />

      <nav
        className="relative z-20 flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4 backdrop-blur-xl md:px-12"
        style={{ background: 'color-mix(in srgb, #060a08 55%, transparent)' }}
        aria-label="Navegação"
      >
        <Link to="/" className="flex min-w-0 items-center gap-2.5 rounded-xl pr-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c8f044]" aria-label="Altfood — início">
          <img
            src={BRAND_MARK_SRC}
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-2xl object-cover ring-1 ring-white/25"
            decoding="async"
          />
          <span className="text-xl font-bold tracking-tight text-white">Altfood</span>
        </Link>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <a
            href="#como-funciona"
            className="hidden min-h-11 items-center rounded-full px-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c8f044] sm:inline-flex"
          >
            Como funciona
          </a>
          <a
            href="#planos"
            className="hidden min-h-11 items-center rounded-full px-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c8f044] sm:inline-flex"
          >
            Planos
          </a>
          <a
            href="#faq"
            className="hidden min-h-11 items-center rounded-full px-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c8f044] md:inline-flex"
          >
            FAQ
          </a>
          <Link
            to="/login"
            className="min-h-11 inline-flex items-center rounded-full px-4 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c8f044]"
          >
            Entrar
          </Link>
        </div>
      </nav>

      <motion.div
        className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 py-12 text-center sm:py-14 lg:max-w-6xl lg:flex-row lg:items-center lg:justify-center lg:gap-8 lg:px-8 lg:py-10 lg:text-left xl:gap-12"
        initial="hidden"
        animate="visible"
        variants={vStagger}
      >
        <motion.div
          variants={vTextGroup}
          className="flex min-w-0 w-full max-w-2xl flex-col items-center lg:w-auto lg:max-w-[min(100%,540px)] lg:flex-none lg:items-start lg:text-left"
        >
        <motion.h1
          variants={vItem}
          className="text-3xl font-extrabold leading-[1.12] tracking-tight sm:text-4xl md:text-5xl lg:text-[2.35rem] lg:leading-[1.1] xl:text-5xl"
        >
          Sua consultoria no bolso do seu paciente.
          <br />
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-[#dff9a8] via-[#c8f044] to-[#9fcc2c] bg-clip-text text-transparent">
              Sua marca em cada substituição.
            </span>
            {!reduced && (
              <motion.span
                className="absolute -inset-x-1 -bottom-1 h-3 rounded-full bg-[#c8f044]/20 blur-md"
                initial={{ opacity: 0, scaleX: 0.3 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.45, duration: 0.7, ease: landingEase }}
                aria-hidden
              />
            )}
          </span>
        </motion.h1>

        <motion.p
          variants={vItem}
          className="mt-6 max-w-2xl text-base leading-[1.65] sm:text-lg sm:leading-[1.65]"
          style={{ color: B.onDarkMuted }}
        >
          O Altfood é o Web App White Label que dá autonomia total para seus pacientes trocarem alimentos em segundos.
          Elimine as dúvidas no WhatsApp e profissionalize seu atendimento por um valor simbólico.
        </motion.p>

        <motion.div variants={vItem} className="mt-9 flex flex-col items-center gap-3">
          <motion.div whileHover={reduced ? undefined : { scale: 1.02 }} whileTap={reduced ? undefined : { scale: 0.98 }}>
            <Link
              to="/register"
              className="group relative inline-flex min-h-[52px] min-w-[min(100%,320px)] touch-manipulation items-center justify-center overflow-hidden rounded-full px-8 py-3.5 text-center text-sm font-black uppercase tracking-wide focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c8f044] sm:text-base lg:min-w-0 lg:self-start"
              style={{ background: B.lime, color: B.forest }}
            >
              <span className="relative z-10">Quero meu web app personalizado</span>
              {!reduced && (
                <span
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                  aria-hidden
                />
              )}
            </Link>
          </motion.div>
          <p
            className="w-full max-w-[min(100%,320px)] text-center text-xs font-semibold tracking-wide"
            style={{ color: 'color-mix(in srgb, white 85%, transparent)' }}
          >
            Condição de lançamento: desconto por tempo limitado.
          </p>
          <LandingCtaPriceSubline tone="onDark" initialIndex={0} className="w-full max-w-[min(100%,320px)] text-center" />
        </motion.div>
        </motion.div>

        <motion.div
          variants={vFade}
          className="mt-10 flex w-full shrink-0 flex-col items-center sm:mt-12 lg:mt-0 lg:w-[min(100%,344px)] lg:min-w-[280px] lg:max-w-[344px] lg:items-center lg:justify-center"
        >
          <motion.div
            className="mx-auto w-full max-w-[min(92vw,320px)] sm:max-w-[300px] lg:mx-0 lg:max-w-[328px]"
            animate={reduced ? undefined : { y: [0, -5, 0] }}
            transition={reduced ? undefined : { duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <PatientPagePhoneMockup brand={CLINIC_BRAND} className="max-w-full" />
          </motion.div>
          <p
            className="mx-auto mt-3 w-full max-w-lg px-2 text-center text-xs leading-relaxed sm:max-w-xl sm:px-4 lg:mx-0 lg:max-w-[300px] lg:px-0 lg:text-center"
            style={{ color: B.onDarkMuted }}
          >
            Exemplo visual: página do paciente com a identidade da sua clínica — cores, logo e link exclusivos.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default HeroSection;
