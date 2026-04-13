import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

const DURATION_MS = 7 * 60 * 1000;
const STORAGE_KEY = 'altfood_offer_countdown_started_at_v1';

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

  if (!enabled || !startedAt || !visible) return null;

  const endsAt = startedAt + DURATION_MS;
  const remaining = endsAt - now;
  const expired = remaining <= 0;

  return (
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
  );
}

export default OfferCountdownBar;

