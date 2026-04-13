/**
 * Mockup da página do paciente (PatientPage) na moldura iPhone —
 * demonstração animada em loop: busca → alimento + macros → carregamento → substituições TACO (fluxo real).
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2 } from 'lucide-react';

const DEFAULT_PRIMARY = '#0f766e';

export type PatientPagePhoneBrand = {
  primaryColor: string;
  brandName: string;
  brandSubtitle: string;
  initials: string;
};

const DEFAULT_BRAND: PatientPagePhoneBrand = {
  primaryColor: DEFAULT_PRIMARY,
  brandName: 'Dra. Carine Cassol',
  brandSubtitle: 'CRM 80939 • Nutrologia',
  initials: 'CC',
};

const TARGET_QUERY = 'Peito de frango';

const SUBSTITUTIONS = [
  { name: 'Patinho moído', sub: 'Bovinos', pct: 'Muito similar', icon: '🥩', left: '#16a34a', line: 'Use 95g no lugar de 100g de Peito de frango.' },
  { name: 'Coxa de frango', sub: 'Aves', pct: 'Similar', icon: '🍗', left: '#ca8a04', line: 'Use 95g no lugar de 100g de Peito de frango.' },
  { name: 'Filé de tilápia', sub: 'Pescados', pct: 'Similar', icon: '🐟', left: '#ca8a04', line: 'Use 105g no lugar de 100g de Peito de frango.' },
] as const;

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const fn = () => setReduced(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return reduced;
}

type DemoPhase = 'search' | 'typing' | 'food' | 'loading' | 'results';

export function PatientPagePhoneMockup({
  className,
  brand,
}: {
  className?: string;
  /** Marca fictícia na landing (ex.: clínica white-label) ou dados reais do mock padrão */
  brand?: Partial<PatientPagePhoneBrand>;
}) {
  const b: PatientPagePhoneBrand = { ...DEFAULT_BRAND, ...brand };
  const primary = b.primaryColor;
  const reducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<DemoPhase>(reducedMotion ? 'results' : 'search');
  const [typedLen, setTypedLen] = useState(reducedMotion ? TARGET_QUERY.length : 0);

  useEffect(() => {
    if (reducedMotion) {
      setPhase('results');
      setTypedLen(TARGET_QUERY.length);
      return;
    }
    let cancelled = false;
    const loop = async () => {
      while (!cancelled) {
        setPhase('search');
        setTypedLen(0);
        await sleep(550);
        if (cancelled) return;
        setPhase('typing');
        for (let i = 1; i <= TARGET_QUERY.length; i++) {
          if (cancelled) return;
          setTypedLen(i);
          await sleep(38);
        }
        await sleep(450);
        if (cancelled) return;
        setPhase('food');
        await sleep(900);
        if (cancelled) return;
        setPhase('loading');
        await sleep(850);
        if (cancelled) return;
        setPhase('results');
        await sleep(6000);
      }
    };
    void loop();
    return () => {
      cancelled = true;
    };
  }, [reducedMotion]);

  const showFood = phase === 'food' || phase === 'loading' || phase === 'results';
  const showResults = phase === 'results';
  const searchDisplay =
    phase === 'search' ? '' : TARGET_QUERY.slice(0, typedLen);
  const showPlaceholder = phase === 'search';

  return (
    <div className={`relative mx-auto w-full max-w-[280px] ${className ?? ''}`}>
      <p className="sr-only">
        Demonstração animada em loop: o paciente digita na busca, seleciona o alimento e vê substituições similares com base na TACO.
      </p>
      {/* Proporção fixa ~ iPhone (390×844 pt); altura deriva da largura — não “cresce” com o conteúdo */}
      <div className="relative w-full aspect-[390/844]">
        <div className="absolute inset-0 rounded-[2.85rem] bg-gradient-to-b from-zinc-800 to-zinc-950 p-[10px] shadow-[0_28px_70px_-14px_rgba(0,0,0,0.45)] ring-1 ring-white/10">
          <div
            className="absolute left-1/2 top-[11px] z-20 h-[26px] w-[72px] -translate-x-1/2 rounded-full bg-black shadow-inner"
            aria-hidden
          />
          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[2.25rem] bg-background shadow-inner">
            <div className="flex shrink-0 items-center justify-between px-5 pb-1 pt-3 text-[10px] font-semibold text-muted-foreground">
            <span>9:41</span>
            <div className="flex items-center gap-1 opacity-80" aria-hidden>
              <span className="h-2.5 w-3 rounded-sm border border-muted-foreground/50" />
              <span className="text-[9px]">5G</span>
              <span className="ml-0.5 h-2 w-5 rounded-sm bg-muted-foreground/40" />
            </div>
          </div>

          <header className="border-b border-border bg-card">
            <div className="px-3 pb-3 pt-1">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-sm font-bold text-white shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${primary}, ${primary}cc)`,
                    borderColor: `${primary}40`,
                  }}
                  aria-hidden
                >
                  {b.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-bold leading-tight text-foreground">{b.brandName}</h2>
                  <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">{b.brandSubtitle}</p>
                </div>
                <div className="flex shrink-0 gap-1" aria-hidden>
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-[11px]">🇧🇷</span>
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-xl"
                    style={{ backgroundColor: '#25D36620' }}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#25D366" aria-hidden>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </span>
                </div>
              </div>
              <p className="mt-2 px-0.5 text-center text-[10px] italic leading-snug text-muted-foreground">
                Substituições com base na TACO — em um toque.
              </p>
              <div className="mt-2 flex justify-center">
                <span
                  className="rounded-full px-2.5 py-1 text-[8px] font-semibold uppercase tracking-wide"
                  style={{ backgroundColor: `${primary}18`, color: primary }}
                >
                  Tabela de substituição alimentar
                </span>
              </div>
            </div>
          </header>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
            <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain bg-gradient-to-b from-muted/30 to-background px-2.5 pb-2 pt-2.5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
              <div className="flex min-h-[38px] items-center rounded-2xl border border-border/60 bg-card py-1.5 pl-9 pr-2 shadow-sm">
                <span className="min-h-[1.125rem] truncate text-[12px] font-medium">
                  {showPlaceholder ? (
                    <span className="text-muted-foreground/70">Buscar alimento…</span>
                  ) : (
                    <span className="text-foreground">
                      {searchDisplay}
                      {phase === 'typing' && typedLen < TARGET_QUERY.length && (
                        <motion.span
                          className="ml-px inline-block h-3 w-px translate-y-px align-middle"
                          style={{ backgroundColor: primary }}
                          animate={{ opacity: [1, 0] }}
                          transition={{ repeat: Infinity, duration: 0.55 }}
                          aria-hidden
                        />
                      )}
                    </span>
                  )}
                </span>
              </div>
            </div>

            <AnimatePresence>
              {showFood && (
                <motion.div
                  key="food-block"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="mt-2 rounded-2xl border border-border/40 bg-card p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base"
                          style={{ backgroundColor: `${primary}14` }}
                        >
                          🍗
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-foreground">Peito de frango</p>
                          <p className="text-[10px] text-muted-foreground">Grelhado, sem pele</p>
                        </div>
                      </div>
                      <button type="button" className="shrink-0 rounded-lg p-1 text-muted-foreground/60" aria-label="Fechar">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="mt-2.5 grid grid-cols-4 gap-1">
                      {[
                        { label: 'Prot', v: '31g', c: '#3B82F6' },
                        { label: 'Carb', v: '0g', c: '#F59E0B' },
                        { label: 'Gord', v: '3.6g', c: '#EF4444' },
                        { label: 'Kcal', v: '165', c: '#8B5CF6' },
                      ].map((m) => (
                        <div key={m.label} className="rounded-lg py-1.5 text-center" style={{ backgroundColor: `${m.c}08` }}>
                          <p className="text-[9px] font-medium text-muted-foreground">{m.label}</p>
                          <p className="text-[10px] font-bold" style={{ color: m.c }}>
                            {m.v}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-2 rounded-2xl border border-border/40 bg-card p-2.5 shadow-sm">
                    <p className="mb-1.5 text-center text-[9px] font-medium text-muted-foreground">Quantidade (g)</p>
                    <div className="flex justify-center gap-1">
                      {[100, 150, 200, 250].map((w) => (
                        <span
                          key={w}
                          className="rounded-full px-2 py-0.5 text-[9px] font-semibold transition-colors"
                          style={{
                            backgroundColor: w === 100 ? primary : `${primary}14`,
                            color: w === 100 ? '#fff' : primary,
                          }}
                        >
                          {w}g
                        </span>
                      ))}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {phase === 'loading' && (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-2 flex items-center justify-center gap-2 rounded-2xl border border-dashed py-3"
                        style={{ borderColor: `${primary}35`, backgroundColor: `${primary}08` }}
                      >
                        <Loader2 className="h-4 w-4 animate-spin" style={{ color: primary }} aria-hidden />
                        <span className="text-[10px] font-medium" style={{ color: primary }}>
                          Buscando substituições na TACO…
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showResults && (
                <motion.div
                  key="results-wrap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2"
                >
                  <p className="mb-1 px-0.5 text-[9px] font-medium text-muted-foreground">
                    8 substituições encontradas
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {SUBSTITUTIONS.map((item, i) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.08 + i * 0.14, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm"
                        style={{ borderLeftWidth: 3, borderLeftColor: item.left }}
                      >
                        <div className="p-2.5">
                          <div className="flex items-start gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted/80 text-base">
                              {item.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[11px] font-semibold text-foreground">{item.name}</p>
                              <p className="text-[9px] text-muted-foreground">{item.sub}</p>
                            </div>
                            <span
                              className="shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-semibold"
                              style={{
                                backgroundColor: item.left === '#16a34a' ? '#22c55e15' : '#eab30815',
                                color: item.left,
                              }}
                            >
                              {item.pct}
                            </span>
                          </div>
                          <p className="mt-1.5 text-center text-[9px] italic text-muted-foreground">{item.line}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="mt-1 px-1 text-center text-[8px] leading-snug text-muted-foreground/70">
              Valores TACO (NEPA/UNICAMP). Consulte seu nutricionista.
            </p>
            </div>

            <div className="shrink-0 bg-background pb-1.5 pt-0.5" aria-hidden>
              <div className="mx-auto h-1 w-24 rounded-full bg-black/10" />
            </div>
          </div>
        </div>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={
          showResults ? { y: [0, -4, 0], opacity: 1 } : { opacity: 0.85, y: 0 }
        }
        transition={
          showResults
            ? { y: { repeat: Infinity, duration: 2.8, ease: 'easeInOut' }, opacity: { duration: 0.3 } }
            : {}
        }
        className="pointer-events-none absolute -left-2 top-[38%] max-sm:scale-90 sm:-left-5 sm:top-[36%] rounded-2xl border bg-white px-2.5 py-2 shadow-xl sm:px-3 sm:py-2.5"
        style={{ borderColor: `${primary}22` }}
        aria-hidden
      >
        <p className="text-[10px] font-bold" style={{ color: primary }}>
          Paciente no mercado
        </p>
        <p className="text-[9px] text-muted-foreground">sem te ligar</p>
      </motion.div>
    </div>
  );
}

export default PatientPagePhoneMockup;
