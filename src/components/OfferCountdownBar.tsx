import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, Flame, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Props = {
  className?: string;
};

const DURATION_MS = 7 * 60 * 1000;
const STORAGE_KEY = 'altfood_offer_countdown_started_at_v1';
const POPUP_SHOWN_KEY = 'altfood_offer_expired_popup_shown_v1';

function formatMMSS(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function OfferCountdownBar({ className }: Props) {
  const location = useLocation();

  // Evita “poluir” telas internas; mantém onde vende.
  const enabled = useMemo(() => {
    const p = location.pathname;
    return p === '/' || p === '/lp' || p === '/planos' || p === '/checkout' || p === '/register' || p === '/login';
  }, [location.pathname]);

  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [visible, setVisible] = useState(false);
  const [showExpiredPopup, setShowExpiredPopup] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const existing = window.localStorage.getItem(STORAGE_KEY);
    const parsed = existing ? Number(existing) : NaN;
    const t = Number.isFinite(parsed) && parsed > 0 ? parsed : Date.now();
    if (!existing || !Number.isFinite(parsed)) {
      window.localStorage.setItem(STORAGE_KEY, String(t));
    }
    setStartedAt(t);
  }, [enabled]);

  useEffect(() => {
    setVisible(false);
    if (!enabled) return;
    const id = window.setTimeout(() => setVisible(true), 10_000);
    return () => window.clearTimeout(id);
  }, [enabled, location.pathname]);

  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !visible || !startedAt) return;
    const endsAt = startedAt + DURATION_MS;
    const remaining = endsAt - Date.now();
    const expired = remaining <= 0;
    if (!expired) return;
    const key = `${POPUP_SHOWN_KEY}:${startedAt}`;
    if (window.localStorage.getItem(key) === '1') return;
    window.localStorage.setItem(key, '1');
    // Deixa a UI “assentar” antes do popup.
    const id = window.setTimeout(() => setShowExpiredPopup(true), 450);
    return () => window.clearTimeout(id);
  }, [enabled, startedAt, visible]);

  if (!enabled || !startedAt || !visible) return null;

  const endsAt = startedAt + DURATION_MS;
  const remaining = endsAt - now;
  const expired = remaining <= 0;

  return (
    <>
      <div
        className={cn(
          'z-50 w-full border-b border-black/10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70',
          className,
        )}
        role="region"
        aria-label="Oferta por tempo limitado"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-2.5 sm:flex-row sm:gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white">
              {expired ? <Clock className="h-4 w-4" /> : <Flame className="h-4 w-4" />}
            </span>
            <div className="leading-tight">
              <p className="font-extrabold text-zinc-900">
                {expired ? 'Oferta encerrada.' : 'Oferta relâmpago de lançamento.'}
              </p>
              <p className="text-[12px] text-zinc-600">
                {expired ? (
                  'A condição promocional não está mais disponível.'
                ) : (
                  <>
                    Encerra em <span className="font-extrabold text-zinc-900 tabular-nums">{formatMMSS(remaining)}</span> ·{' '}
                    <span className="line-through">R$ 49,90</span>{' '}
                    <span className="font-extrabold text-emerald-700">R$ 29,90</span> no Altfood PRO
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Link
              to={expired ? '/planos' : '/register'}
              className={cn(
                'inline-flex min-h-10 w-full items-center justify-center rounded-full px-4 text-sm font-extrabold shadow-sm ring-1 ring-black/10 transition-colors sm:w-auto',
                expired
                  ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700',
              )}
            >
              {expired ? 'Ver planos' : 'Garantir com desconto'}
            </Link>
            {!expired && (
              <Link
                to="/planos"
                className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-black/10 bg-white px-4 text-sm font-bold text-zinc-800 hover:bg-zinc-50 sm:w-auto"
              >
                Detalhes
              </Link>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showExpiredPopup} onOpenChange={setShowExpiredPopup}>
        <DialogContent className="max-w-[520px] overflow-hidden p-0">
          <div className="relative">
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at 30% 10%, rgba(16,185,129,0.25), transparent 45%), radial-gradient(circle at 80% 60%, rgba(34,197,94,0.18), transparent 50%)',
              }}
              aria-hidden
            />
            <div className="relative p-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-black tracking-tight">
                  Última chance: ainda dá tempo de garantir o desconto.
                </DialogTitle>
              </DialogHeader>

              <div className="mt-3 space-y-3">
                <p className="text-sm text-muted-foreground">
                  A oferta acabou de encerrar — mas liberamos <span className="font-bold text-foreground">mais uma chance</span>{' '}
                  para você entrar no Altfood PRO com <span className="font-black text-emerald-700">59% de desconto</span>.
                </p>

                <div className="rounded-2xl border bg-background/80 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Altfood PRO</p>
                  <p className="mt-1 text-sm">
                    <span className="text-muted-foreground line-through">De R$ 49,90</span>{' '}
                    <span className="ml-1 text-lg font-black text-foreground">por R$ 29,90</span>
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Pacientes ilimitados • Seu cliente não paga • Você para de responder substituições no WhatsApp
                  </p>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Link
                    to="/register"
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-extrabold text-white shadow-sm hover:bg-emerald-700 sm:w-auto"
                    onClick={() => setShowExpiredPopup(false)}
                  >
                    <Sparkles className="h-4 w-4" aria-hidden />
                    Quero minha última chance
                  </Link>
                  <Link
                    to="/planos"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-black/10 bg-white px-5 text-sm font-bold text-zinc-800 hover:bg-zinc-50 sm:w-auto"
                    onClick={() => setShowExpiredPopup(false)}
                  >
                    Ver detalhes
                  </Link>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  Se sair agora, pode perder essa condição.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default OfferCountdownBar;

