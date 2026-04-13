import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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
      <div className="rounded-2xl border border-black/10 bg-white/70 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between rounded-t-2xl bg-[#075E54] px-4 py-3 text-white">
          <div className="flex min-w-0 flex-col">
            <p className="truncate text-sm font-semibold">WhatsApp</p>
            <p className="truncate text-[11px] opacity-90">Mensagens de pacientes agora</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-white/15 px-2 py-1 text-[11px] font-semibold tracking-tight">
              {Math.max(0, i)}
            </div>
          </div>
        </div>

        <div className="space-y-2 bg-[linear-gradient(135deg,rgba(255,255,255,0.85),rgba(255,255,255,0.65))] px-4 py-4">
          {messages.slice(0, i).map((m, idx) => (
            <motion.div
              key={`${m.time}-${idx}`}
              initial={reduced ? false : { opacity: 0, y: 10, scale: 0.98 }}
              animate={reduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="w-full"
            >
              <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-white px-3 py-2 shadow-[0_6px_18px_-14px_rgba(0,0,0,0.25)] ring-1 ring-black/5">
                <p className="text-[11px] font-semibold text-[#128C7E]">{m.from}</p>
                <p className="mt-0.5 text-sm leading-snug text-zinc-900">{m.text}</p>
                <div className="mt-1 flex items-center justify-end gap-1">
                  <span className="text-[10px] text-zinc-500">{m.time}</span>
                  <span className="h-3 w-3 rounded-sm bg-zinc-100" aria-hidden />
                </div>
              </div>
            </motion.div>
          ))}

          {!reduced && i === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center text-xs text-zinc-500"
            >
              Notificações chegando…
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WhatsAppPatientPings;

