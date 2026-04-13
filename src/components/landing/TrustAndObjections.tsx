/**
 * Selos de confiança + respostas curtas a objeções comuns (preço, segurança, app, papel do profissional).
 */
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Lock, CreditCard, Smartphone, Stethoscope } from 'lucide-react';

const T = {
  forest: '#1a3c2e',
  lime: '#c8f044',
  offWhite: '#f5f0e8',
  textDark: '#111a14',
  textMute: '#6b7c6e',
  border: '#e2ddd4',
  surface: '#ffffff',
} as const;

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const badges = [
  { label: 'HTTPS', detail: 'Tráfego cifrado' },
  { label: 'TACO oficial', detail: 'NEPA / UNICAMP' },
  { label: 'Sem app', detail: 'Paciente usa o navegador' },
  { label: 'Sua marca', detail: 'Nome e link seus' },
] as const;

const objections = [
  {
    Icon: CreditCard,
    q: 'Vai pesar no bolso?',
    a: 'Planos mensais claros no site. Cancele quando quiser. O acesso do paciente ao seu link não é cobrado dele.',
  },
  {
    Icon: Lock,
    q: 'Meus dados e dos pacientes?',
    a: 'Conexão segura (HTTPS). Você acessa o painel com login; a página pública mostra só o que você configurar.',
  },
  {
    Icon: Smartphone,
    q: 'Mais um app para convencer?',
    a: 'Não. É uma página web: o paciente toca no link e usa. Menos atrito, mais adesão.',
  },
  {
    Icon: Stethoscope,
    q: 'Isso substitui minha conduta?',
    a: 'Não substitui julgamento clínico. O Altfood entrega números e similaridade da TACO; você segue prescrevendo, priorizando e acompanhando.',
  },
] as const;

export function TrustAndObjections() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section
      id="objecoes"
      ref={ref}
      className="border-y font-sans"
      style={{ borderColor: T.border, background: T.surface }}
    >
      <div className="mx-auto max-w-6xl px-5 py-14 md:px-16 md:py-16">
        <div className="mb-10 flex flex-wrap items-center justify-center gap-3 md:gap-4">
          {badges.map((b, i) => (
            <motion.div
              key={b.label}
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, ease, delay: i * 0.05 }}
              className="flex items-center gap-2 rounded-full border px-3 py-2 md:px-4"
              style={{ borderColor: T.border, background: T.offWhite }}
            >
              <span className="text-xs font-bold" style={{ color: T.forest }}>
                {b.label}
              </span>
              <span className="hidden text-xs sm:inline" style={{ color: T.textMute }}>
                · {b.detail}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="mb-10 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease }}
            className="text-2xl font-extrabold tracking-tight md:text-3xl"
            style={{ color: T.textDark }}
          >
            Dúvidas que seguram a decisão — <span style={{ color: T.forest }}>respondidas aqui</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, ease, delay: 0.06 }}
            className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed md:text-base"
            style={{ color: T.textMute }}
          >
            Menos atrito na cabeça do visitante, mais clareza para clicar em criar conta ou ver planos.
          </motion.p>
        </div>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2" role="list">
          {objections.map(({ Icon, q, a }, i) => (
            <motion.li
              key={q}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease, delay: 0.1 + i * 0.08 }}
              className="flex gap-4 rounded-2xl border p-5 md:p-6"
              style={{ borderColor: T.border, background: T.offWhite }}
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{ background: `${T.lime}35`, color: T.forest }}
                aria-hidden
              >
                <Icon size={20} strokeWidth={2.2} />
              </div>
              <div>
                <p className="font-bold leading-snug" style={{ color: T.textDark }}>
                  {q}
                </p>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: T.textMute }}>
                  {a}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default TrustAndObjections;
