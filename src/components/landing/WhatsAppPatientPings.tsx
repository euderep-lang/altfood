import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BatteryFull, Camera, MoreVertical, SignalHigh, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

type Message = {
  from: string;
  text: string;
  time: string;
};

type Props = {
  className?: string;
};

const TICK_MS = 1650;
const RESET_AFTER_MS = 2600;

export function WhatsAppPatientPings({ className }: Props) {
  const reduced = useReducedMotion();

  const messages = useMemo<Message[]>(
    () => [
      {
        from: 'Paciente',
        text: 'Dra. tô almoçando e não achei frango aqui em casa… posso trocar pelo quê?',
        time: '12:14',
      },
      {
        from: 'Paciente',
        text: 'Posso trocar o arroz por batata?',
        time: '12:18',
      },
      {
        from: 'Paciente',
        text: 'Tô no mercado e não tem iogurte natural. O que eu pego no lugar?',
        time: '18:07',
      },
    ],
    [],
  );

  const [i, setI] = useState(reduced ? messages.length : 0);

  useEffect(() => {
    if (reduced) return;
    let id: number | undefined;
    let resetId: number | undefined;

    const tick = () => {
      setI((n) => {
        const next = n + 1;
        if (next > messages.length) return messages.length;
        return next;
      });
    };

    id = window.setInterval(tick, TICK_MS);
    resetId = window.setInterval(() => setI(0), TICK_MS * messages.length + RESET_AFTER_MS);

    return () => {
      if (id) window.clearInterval(id);
      if (resetId) window.clearInterval(resetId);
    };
  }, [messages.length, reduced]);

  return (
    <div className={cn('mx-auto w-full max-w-[540px]', className)}>
      <div className="flex h-[340px] w-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_12px_40px_-18px_rgba(0,0,0,0.35)]">
        {/* Status bar */}
        <div className="flex items-center justify-between bg-[#075E54] px-4 pb-1 pt-2 text-white">
          <span className="text-[11px] font-semibold tabular-nums">12:14</span>
          <div className="flex items-center gap-1.5 opacity-90" aria-hidden>
            <SignalHigh className="h-3.5 w-3.5" />
            <Wifi className="h-3.5 w-3.5" />
            <BatteryFull className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* App header */}
        <div className="flex items-center justify-between bg-[#075E54] px-4 py-2 text-white">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-xs font-black">P</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight">Paciente</p>
              <p className="truncate text-[11px] opacity-90">online agora</p>
            </div>
          </div>
          <div className="flex items-center gap-3 opacity-95" aria-hidden>
            <Camera className="h-4.5 w-4.5" />
            <MoreVertical className="h-4.5 w-4.5" />
          </div>
        </div>

        {/* Chat */}
        <div className="relative flex-1 overflow-hidden bg-[#ECE5DD] px-4 py-4">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.28]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 25% 30%, rgba(255,255,255,0.55) 0%, transparent 40%), radial-gradient(circle at 85% 70%, rgba(0,0,0,0.04) 0%, transparent 45%)',
            }}
            aria-hidden
          />
          <div className="relative h-full space-y-2 overflow-hidden">
          {messages.slice(0, i).map((m, idx) => (
            <motion.div
              key={`${m.time}-${idx}`}
              initial={reduced ? false : { opacity: 0, y: 10, scale: 0.98 }}
              animate={reduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="w-full"
            >
              <div className="max-w-[92%] rounded-[18px] rounded-tl-[8px] bg-white px-3 py-2 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
                <div className="relative">
                  <div className="absolute -left-2 top-2 h-3 w-3 rotate-45 rounded-[2px] bg-white ring-1 ring-black/5" aria-hidden />
                  <p className="text-[11px] font-bold text-[#128C7E]">{m.from}</p>
                  <p className="mt-0.5 text-sm leading-snug text-zinc-900">{m.text}</p>
                  <div className="mt-1.5 flex items-center justify-end gap-1">
                    <span className="text-[10px] text-zinc-500 tabular-nums">{m.time}</span>
                    <span className="text-[10px] font-bold text-[#34B7F1]" aria-hidden>
                      ✓✓
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {!reduced && i === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center text-xs text-zinc-700/70"
            >
              Notificações chegando…
            </motion.div>
          )}
          </div>
        </div>

        {/* Input bar (visual only) */}
        <div className="flex items-center gap-2 bg-[#F0F0F0] px-3 py-2">
          <div className="flex h-10 flex-1 items-center gap-2 rounded-full bg-white px-4 text-sm text-zinc-500 shadow-[0_8px_18px_-16px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
            <span className="text-zinc-400">Mensagem</span>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_24px_-18px_rgba(0,0,0,0.45)]" aria-hidden>
            <span className="text-sm font-black">➤</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WhatsAppPatientPings;

