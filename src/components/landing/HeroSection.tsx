/** Hero — consultório → vida real → custo do improviso → link com marca e TACO; mockup = página do paciente. */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Menu, X } from 'lucide-react';
import { AltfoodLogoNavLight } from '@/components/AltfoodLogo';
import { PatientPagePhoneMockup } from '@/components/landing/PatientPagePhoneMockup';

const T = {
  forest: '#1a3c2e',
  lime: '#c8f044',
  offWhite: '#f5f0e8',
  textDark: '#111a14',
  textMute: '#6b7c6e',
  surface: '#ffffff',
  border: '#e2ddd4',
} as const;

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.65, ease, delay } },
});

const navItems = [
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Para profissionais', href: '#para-profissionais' },
  { label: 'Preços', href: '/planos' },
  { label: 'Novidades', href: '/changelog' },
] as const;

const chips = [
  { emoji: '🩺', label: 'Nutrição clínica' },
  { emoji: '🏥', label: 'Endocrino' },
  { emoji: '🏋️', label: 'Esporte e lifestyle' },
];

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
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
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease }}
            className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col px-6 py-8 shadow-2xl"
            style={{ background: T.offWhite }}
            role="dialog"
            aria-modal
            aria-label="Menu de navegação"
          >
            <button
              type="button"
              onClick={onClose}
              className="mb-4 self-end rounded-lg p-2 transition-colors hover:bg-black/5"
              aria-label="Fechar menu"
            >
              <X size={22} style={{ color: T.forest }} />
            </button>
            <div className="mb-6">
              <AltfoodLogoNavLight href="/" />
            </div>
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="rounded-xl px-4 py-3 text-base font-medium transition-colors hover:bg-black/5"
                  style={{ color: T.textDark }}
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-2">
              <Link
                to="/login"
                onClick={onClose}
                className="flex w-full items-center justify-center rounded-xl py-3 text-base font-semibold transition-all hover:bg-black/5"
                style={{ color: T.forest, border: `2px solid ${T.forest}` }}
              >
                Entrar
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="flex w-full items-center justify-center rounded-xl py-3 text-base font-bold transition-all hover:opacity-90"
                style={{ background: T.forest, color: '#fff' }}
              >
                Criar conta
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function HeroSection() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <section className="relative flex flex-col font-sans" style={{ background: T.offWhite }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 70% 10%, ${T.lime}28 0%, transparent 50%),
                            radial-gradient(circle at 10% 80%, ${T.forest}12 0%, transparent 40%)`,
        }}
        aria-hidden
      />

      <motion.nav
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
        className="relative z-20 flex items-center justify-between px-5 py-4 md:px-16"
        aria-label="Navegação principal"
      >
        <AltfoodLogoNavLight href="/" />

        <div className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium transition-opacity hover:opacity-60"
              style={{ color: T.textDark }}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden rounded-lg border-2 px-5 py-2 text-sm font-semibold transition-all hover:bg-black/5 md:inline-flex"
            style={{ color: T.forest, borderColor: T.forest }}
          >
            Entrar
          </Link>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="rounded-lg p-2 transition-colors hover:bg-black/5 md:hidden"
            aria-label="Abrir menu"
            aria-expanded={drawerOpen}
          >
            <Menu size={22} style={{ color: T.forest }} />
          </button>
        </div>
      </motion.nav>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-5 pb-16 pt-8 md:px-16 lg:grid-cols-5 lg:gap-8">
        <div className="flex flex-col gap-5 lg:col-span-3">
          <motion.p
            {...fadeUp(0.05)}
            className="max-w-xl text-sm font-medium leading-snug text-[#111a14]/90 md:text-base"
          >
            No consultório, combinado. Fora dele, a pergunta cai no seu pior horário.
          </motion.p>

          <motion.div
            {...fadeUp(0.08)}
            className="inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{ background: `${T.lime}33`, color: T.forest }}
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: T.forest }} aria-hidden />
            TACO · sua marca · celular
          </motion.div>

          <motion.h1
            {...fadeUp(0.15)}
            className="text-4xl font-extrabold leading-[1.08] tracking-tight text-[#111a14] sm:text-5xl md:text-6xl xl:text-[3.35rem]"
          >
            O plano acabou.
            <br />
            <span style={{ color: T.forest }}>As dúvidas não.</span>
          </motion.h1>

          <motion.p {...fadeUp(0.22)} className="max-w-xl text-base leading-snug md:text-lg" style={{ color: T.textMute }}>
            Tudo no seu WhatsApp? Ele chuta; você cansa.{' '}
            <strong className="font-semibold text-[#111a14]">Altfood</strong> é o seu link com marca:{' '}
            <strong className="font-semibold text-[#111a14]">TACO</strong>, gramas, similaridade — sem app. Referência,
            não inbox.
          </motion.p>

          <motion.div {...fadeUp(0.28)} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: T.lime, color: T.textDark }}
            >
              Criar página
              <ArrowRight size={18} aria-hidden />
            </Link>
            <a
              href="#como-funciona"
              className="inline-flex items-center justify-center gap-1.5 py-3.5 text-sm font-semibold transition-opacity hover:opacity-60 sm:py-0"
              style={{ color: T.forest }}
            >
              Como funciona →
            </a>
          </motion.div>

          <motion.div {...fadeUp(0.35)} className="flex items-center gap-2 text-sm" style={{ color: T.textMute }}>
            <CheckCircle2 size={15} style={{ color: T.forest }} aria-hidden />
            <span>Busca, macros, gramas, similaridade. Sem baixar app.</span>
          </motion.div>

          <motion.div {...fadeUp(0.42)} className="flex flex-wrap gap-2" aria-label="Áreas que mais usam o Altfood">
            {chips.map((chip) => (
              <span
                key={chip.label}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium"
                style={{
                  background: T.surface,
                  borderColor: T.border,
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

        <div className="mx-auto w-full max-w-[320px] lg:col-span-2 lg:mx-0 lg:max-w-none lg:justify-self-end">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.75, ease, delay: 0.2 }}
          >
            <PatientPagePhoneMockup />
            <p className="mt-4 text-center text-xs md:text-left" style={{ color: T.textMute }}>
              Prévia iPhone — o que abre com o seu link.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
