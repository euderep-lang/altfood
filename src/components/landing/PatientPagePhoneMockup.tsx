/**
 * Mockup estático da página do paciente (PatientPage) dentro de moldura iPhone —
 * mesma hierarquia visual: header do profissional, busca, alimento + macros, peso, resultados TACO.
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

const PRIMARY = '#0f766e';

const SEARCH_ROTATION = ['Frango grelhado', 'Arroz branco', 'Batata doce'];

export function PatientPagePhoneMockup({ className }: { className?: string }) {
  const [q, setQ] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setQ((v) => (v + 1) % SEARCH_ROTATION.length), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={`relative mx-auto w-[min(100%,300px)] ${className ?? ''}`}>
      <div className="relative rounded-[2.85rem] bg-gradient-to-b from-zinc-800 to-zinc-950 p-[10px] shadow-[0_28px_70px_-14px_rgba(0,0,0,0.45)] ring-1 ring-white/10">
        <div
          className="absolute left-1/2 top-[11px] z-20 h-[26px] w-[72px] -translate-x-1/2 rounded-full bg-black shadow-inner"
          aria-hidden
        />
        <div className="overflow-hidden rounded-[2.25rem] bg-background shadow-inner">
          {/* Barra de status (estilo iOS) */}
          <div className="flex items-center justify-between px-5 pb-1 pt-3 text-[10px] font-semibold text-muted-foreground">
            <span>9:41</span>
            <div className="flex items-center gap-1 opacity-80" aria-hidden>
              <span className="h-2.5 w-3 rounded-sm border border-muted-foreground/50" />
              <span className="text-[9px]">5G</span>
              <span className="ml-0.5 h-2 w-5 rounded-sm bg-muted-foreground/40" />
            </div>
          </div>

          {/* Header — igual PatientPage: logo/iniciais + nome + doc + ícones */}
          <header className="border-b border-border bg-card">
            <div className="px-3 pb-3 pt-1">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#0f766e]/25 text-sm font-bold text-white shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY}cc)` }}
                  aria-hidden
                >
                  CC
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-bold leading-tight text-foreground">Dra. Carine Cassol</h2>
                  <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">CRM 80939 • Nutrologia</p>
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
                  style={{ backgroundColor: `${PRIMARY}15`, color: PRIMARY }}
                >
                  Tabela de substituição alimentar
                </span>
              </div>
            </div>
          </header>

          {/* Corpo — PatientPage: busca + card do alimento + peso + lista de substituições */}
          <div className="bg-gradient-to-b from-muted/30 to-background px-2.5 pb-2 pt-2.5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
              <div className="flex min-h-[38px] items-center rounded-2xl border border-border/60 bg-card py-1.5 pl-9 pr-2 shadow-sm">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={q}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="truncate text-[12px] font-medium text-foreground"
                  >
                    {SEARCH_ROTATION[q]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            {/* Alimento selecionado + macros (como PatientPage) */}
            <div className="mt-2 rounded-2xl border border-border/40 bg-card p-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base"
                    style={{ backgroundColor: `${PRIMARY}12` }}
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

            {/* Quantidade */}
            <div className="mt-2 rounded-2xl border border-border/40 bg-card p-2.5 shadow-sm">
              <p className="mb-1.5 text-center text-[9px] font-medium text-muted-foreground">Quantidade (g)</p>
              <div className="flex justify-center gap-1">
                {[100, 150, 200, 250].map((w) => (
                  <span
                    key={w}
                    className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
                    style={{
                      backgroundColor: w === 100 ? PRIMARY : `${PRIMARY}10`,
                      color: w === 100 ? '#fff' : PRIMARY,
                    }}
                  >
                    {w}g
                  </span>
                ))}
              </div>
            </div>

            <p className="mb-1 mt-2 px-0.5 text-[9px] font-medium text-muted-foreground">8 substituições encontradas</p>

            {[
              { name: 'Patinho moído', sub: 'Bovinos', pct: 'Muito similar', icon: '🥩', left: '#16a34a' },
              { name: 'Coxa de frango', sub: 'Aves', pct: 'Similar', icon: '🍗', left: '#ca8a04' },
            ].map((item) => (
              <div
                key={item.name}
                className="mb-1.5 overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm"
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
                  <p className="mt-1.5 text-center text-[9px] italic text-muted-foreground">
                    Use 95g no lugar de 100g de Peito de frango.
                  </p>
                </div>
              </div>
            ))}

            <p className="mt-1 px-1 text-center text-[8px] leading-snug text-muted-foreground/70">
              Valores TACO (NEPA/UNICAMP). Consulte seu nutricionista.
            </p>

            <div className="flex justify-center pb-0.5 pt-1" aria-hidden>
              <div className="h-1 w-24 rounded-full bg-black/10" />
            </div>
          </div>
        </div>
      </div>

      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
        className="absolute -left-2 top-[42%] max-sm:scale-90 sm:-left-5 sm:top-[40%] rounded-2xl border border-[#0f766e]/15 bg-white px-2.5 py-2 shadow-xl sm:px-3 sm:py-2.5"
      >
        <p className="text-[10px] font-bold text-[#0f766e]">Paciente no mercado</p>
        <p className="text-[9px] text-muted-foreground">sem te ligar</p>
      </motion.div>
    </div>
  );
}

export default PatientPagePhoneMockup;
