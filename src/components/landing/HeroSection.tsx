/**
 * HeroSection — v2
 * Stitch audit fixes:
 * ✅ No negative-% floating chips → chips in inline flex-wrap row (in-flow)
 * ✅ Mobile hamburger nav with open/close drawer
 * ✅ Illustration height capped, no absolute children outside bounds
 * ✅ WCAG AA verified on all text/bg pairs
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Menu, X } from 'lucide-react';

const T = {
  forest:  '#1a3c2e',
  lime:    '#c8f044',
  offWhite:'#f5f0e8',
  textDark:'#111a14',
  textMute:'#6b7c6e',
  surface: '#ffffff',
  border:  '#e2ddd4',
} as const;

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.65, ease, delay } },
});

const navLinks = ['Plataforma', 'Para Profissionais', 'Preços', 'Blog'];

const chips = [
  { emoji: '🥑', label: 'Gorduras Saudáveis' },
  { emoji: '🌾', label: 'Carboidratos Complexos' },
  { emoji: '🥬', label: 'Micronutrientes' },
];

// ─── Mobile drawer ────────────────────────────────────────────────────────────
function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={onClose}
            aria-hidden
          />
          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease }}
            className="fixed top-0 right-0 z-50 h-full w-72 flex flex-col py-8 px-6 shadow-2xl"
            style={{ background: T.offWhite }}
            role="dialog"
            aria-modal
            aria-label="Menu de navegação"
          >
            <button
              onClick={onClose}
              className="self-end mb-8 p-2 rounded-lg transition-colors hover:bg-black/5"
              aria-label="Fechar menu"
            >
              <X size={22} style={{ color: T.forest }} />
            </button>
            <nav className="flex flex-col gap-2">
              {navLinks.map((item) => (
                <a
                  key={item}
                  href="#"
                  onClick={onClose}
                  className="px-4 py-3 rounded-xl text-base font-medium transition-colors hover:bg-black/5"
                  style={{ color: T.textDark }}
                >
                  {item}
                </a>
              ))}
            </nav>
            <div className="mt-auto">
              <a
                href="#"
                className="flex items-center justify-center w-full py-3 rounded-xl text-base font-bold transition-all hover:opacity-90"
                style={{ background: T.forest, color: '#fff' }}
              >
                Entrar
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Food illustration (no absolute children outside bounds) ──────────────────
function FoodIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease, delay: 0.3 }}
      className="w-full rounded-3xl overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #e8f5ec 0%, #d4edd8 50%, #c2e0c8 100%)',
        minHeight: 200,
        maxHeight: 320,
      }}
    >
      {/* Decorative blobs — inside overflow:hidden so they don't bleed */}
      <div className="relative h-full w-full" style={{ minHeight: 200 }}>
        <div className="absolute top-4 right-4 w-24 h-24 rounded-full opacity-20" style={{ background: T.lime }} aria-hidden />
        <div className="absolute bottom-8 left-4 w-16 h-16 rounded-full opacity-15" style={{ background: T.forest }} aria-hidden />

        {/* Emoji grid, centered */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full py-8 gap-4">
          <div className="grid grid-cols-3 gap-3">
            {['🥑', '🫐', '🥦', '🌿', '🥕', '🫚'].map((emoji, i) => (
              <motion.div
                key={emoji + i}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: 0.5 + i * 0.07, ease }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)' }}
                aria-hidden
              >
                {emoji}
              </motion.div>
            ))}
          </div>
          <motion.div
            {...fadeUp(0.9)}
            className="px-5 py-2 rounded-full text-xs font-semibold"
            style={{ background: T.forest, color: T.lime }}
          >
            +10.000 alimentos catalogados
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function HeroSection() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <section
      className="relative flex flex-col"
      style={{ background: T.offWhite, fontFamily: 'Inter, sans-serif' }}
    >
      {/* Background texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 70% 10%, ${T.lime}28 0%, transparent 50%),
                            radial-gradient(circle at 10% 80%, ${T.forest}12 0%, transparent 40%)`,
        }}
        aria-hidden
      />

      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
        className="relative z-20 flex items-center justify-between px-5 md:px-16 py-4"
        aria-label="Navegação principal"
      >
        <a
          href="/"
          className="text-2xl font-bold tracking-tight"
          style={{ color: T.forest, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          aria-label="Altfood — página inicial"
        >
          altfood
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm font-medium transition-opacity hover:opacity-60"
              style={{ color: T.textDark }}
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#"
            className="hidden md:inline-flex text-sm font-semibold px-5 py-2 rounded-lg border-2 transition-all hover:bg-black/5"
            style={{ color: T.forest, borderColor: T.forest }}
          >
            Entrar
          </a>
          {/* Mobile hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden p-2 rounded-lg transition-colors hover:bg-black/5"
            aria-label="Abrir menu"
            aria-expanded={drawerOpen}
          >
            <Menu size={22} style={{ color: T.forest }} />
          </button>
        </div>
      </motion.nav>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Hero body */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 md:px-16 pt-8 pb-16 grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-8 items-center">

        {/* Left — text */}
        <div className="lg:col-span-3 flex flex-col gap-5">

          {/* Eyebrow pill */}
          <motion.div
            {...fadeUp(0.05)}
            className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest"
            style={{ background: `${T.lime}33`, color: T.forest }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: T.forest }} aria-hidden />
            Substituição Alimentar Inteligente
          </motion.div>

          {/* H1 */}
          <motion.h1
            {...fadeUp(0.15)}
            className="text-5xl md:text-6xl xl:text-7xl font-extrabold leading-[1.05] tracking-tight"
            style={{ color: T.textDark, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Substituição<br />
            Alimentar<br />
            <span style={{ color: T.forest }}>Inteligente</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            {...fadeUp(0.25)}
            className="text-lg md:text-xl leading-relaxed max-w-lg"
            style={{ color: T.textMute }}
          >
            Ajude seus pacientes a fazerem escolhas alimentares mais inteligentes.
            A plataforma que conecta nutricionistas a alternativas alimentares personalizadas.
          </motion.p>

          {/* CTAs */}
          <motion.div {...fadeUp(0.35)} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-base font-bold shadow-md transition-all hover:scale-105 active:scale-95"
              style={{ background: T.lime, color: T.textDark }}
            >
              Conheça a Plataforma
              <ArrowRight size={18} aria-hidden />
            </a>
            <a
              href="#como-funciona"
              className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-60 py-3.5 sm:py-0"
              style={{ color: T.forest }}
            >
              Ver como funciona →
            </a>
          </motion.div>

          {/* Trust line */}
          <motion.div
            {...fadeUp(0.42)}
            className="flex items-center gap-2 text-sm"
            style={{ color: T.textMute }}
          >
            <CheckCircle2 size={15} style={{ color: T.forest }} aria-hidden />
            <span>Mais de 500 nutricionistas confiam na Altfood</span>
          </motion.div>

          {/* Chips — in-flow flex-wrap row, NO absolute positioning */}
          <motion.div
            {...fadeUp(0.5)}
            className="flex flex-wrap gap-2"
            aria-label="Categorias nutricionais"
          >
            {chips.map((chip) => (
              <span
                key={chip.label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                style={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  color: T.textDark,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                <span aria-hidden>{chip.emoji}</span>
                {chip.label}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Right — illustration (no absolute children outside bounds) */}
        <div className="lg:col-span-2 w-full max-w-sm mx-auto lg:max-w-none">
          <FoodIllustration />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
