/** Hero — roteiro Altfood (textos fixos). Visual e motion: marca real + estilo “21st” (blur-in, mesh, orbs). */
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
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

  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden font-sans text-white">
      {/* Base + textura (tokens globais) */}
      <div className="absolute inset-0 gradient-dark" aria-hidden />
      <div
        className="absolute inset-0 hero-pattern opacity-[0.28]"
        style={{ maskImage: 'linear-gradient(180deg, black 0%, transparent 85%)' }}
        aria-hidden
      />

      {/* Orbs — movimento lento só se motion ok */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <motion.div
          className="absolute -left-[15%] top-[10%] h-[min(90vw,420px)] w-[min(90vw,420px)] rounded-full blur-[100px]"
          style={{ background: `color-mix(in srgb, ${B.primary} 45%, transparent)` }}
          animate={
            reduced
              ? undefined
              : {
                  opacity: [0.35, 0.55, 0.35],
                  scale: [1, 1.08, 1],
                  x: [0, 24, 0],
                }
          }
          transition={reduced ? undefined : { duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-[10%] top-[35%] h-[min(70vw,340px)] w-[min(70vw,340px)] rounded-full blur-[90px]"
          style={{ background: `color-mix(in srgb, ${B.secondary} 38%, transparent)` }}
          animate={
            reduced
              ? undefined
              : {
                  opacity: [0.25, 0.45, 0.25],
                  scale: [1.05, 1, 1.05],
                  y: [0, -20, 0],
                }
          }
          transition={reduced ? undefined : { duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#060a08] to-transparent"
          aria-hidden
        />
      </div>

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
          <Link
            to="/planos"
            className="hidden min-h-11 items-center rounded-full px-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c8f044] sm:inline-flex"
          >
            Planos
          </Link>
          <Link
            to="/login"
            className="min-h-11 inline-flex items-center rounded-full px-4 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c8f044]"
          >
            Entrar
          </Link>
        </div>
      </nav>

      <motion.div
        className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-5 pb-20 pt-8 text-center md:pb-24 md:pt-10"
        initial="hidden"
        animate="visible"
        variants={vStagger}
      >
        <motion.h1
          variants={vItem}
          className="text-3xl font-extrabold leading-[1.12] tracking-tight sm:text-4xl md:text-5xl"
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
              className="group relative inline-flex min-h-[52px] min-w-[min(100%,320px)] touch-manipulation items-center justify-center overflow-hidden rounded-full px-8 py-3.5 text-center text-sm font-black uppercase tracking-wide focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c8f044] sm:text-base"
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
          <p className="text-sm font-medium" style={{ color: B.onDarkMuted }}>
            Apenas R$ 19,90/mês. Pacientes ilimitados.
          </p>
        </motion.div>

        <motion.div variants={vFade} className="mt-14 w-full max-w-[300px] md:mt-16">
          <motion.div
            animate={reduced ? undefined : { y: [0, -6, 0] }}
            transition={reduced ? undefined : { duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <PatientPagePhoneMockup brand={CLINIC_BRAND} />
          </motion.div>
          <p className="mt-4 text-center text-xs leading-relaxed" style={{ color: B.onDarkMuted }}>
            Exemplo visual: página do paciente com a identidade da sua clínica — cores, logo e link exclusivos.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default HeroSection;
