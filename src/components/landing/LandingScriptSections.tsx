/**
 * Seções da landing conforme roteiro (dor, white label, como funciona, prova social, preço/garantia).
 */
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Palette, Link2, Sparkles } from 'lucide-react';

const T = {
  navy: '#152b36',
  navyLight: '#1e3d4d',
  olive: '#3d5a45',
  lime: '#c8f044',
  offWhite: '#f0f4f3',
  paper: '#fafcfb',
  text: '#0f1a14',
  mute: '#5a6b62',
  border: '#d5e0db',
  white: '#ffffff',
} as const;

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

export function LandingPainSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <section ref={ref} className="px-5 py-20 font-sans md:px-16 md:py-24" style={{ background: T.paper }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, ease }}
        className="mx-auto max-w-3xl text-center"
      >
        <h2 className="text-3xl font-extrabold leading-tight tracking-tight md:text-4xl" style={{ color: T.text }}>
          Chega de ser um &quot;suporte de dieta&quot; 24h por dia.
        </h2>
        <p className="mt-6 text-base leading-relaxed md:text-lg" style={{ color: T.mute }}>
          Quantas vezes você interrompeu seu descanso ou o atendimento de um novo cliente para responder:{' '}
          <em>&quot;O que posso comer no lugar do arroz?&quot;</em> no WhatsApp?
        </p>
        <p className="mt-5 text-base leading-relaxed md:text-lg" style={{ color: T.mute }}>
          O Altfood resolve isso para você. Você entrega a ferramenta personalizada, o paciente ganha liberdade para
          fazer trocas inteligentes seguindo seus critérios, e você recupera as horas perdidas com suporte manual.
        </p>
      </motion.div>
    </section>
  );
}

export function LandingWhiteLabelSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const points = [
    {
      Icon: Palette,
      title: 'Identidade Visual',
      text: 'Configure suas cores e suba seu logotipo em segundos.',
    },
    {
      Icon: Link2,
      title: 'Link Exclusivo',
      text: 'Gere um link personalizado (ex.: altfood.app/seunome) para enviar após a consulta.',
    },
    {
      Icon: Sparkles,
      title: 'Percepção de Valor',
      text: 'Para o seu paciente, você desenvolveu uma tecnologia exclusiva para o acompanhamento dele.',
    },
  ] as const;

  return (
    <section ref={ref} className="px-5 py-20 font-sans md:px-16 md:py-24" style={{ background: T.offWhite }}>
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease }}
          className="text-center text-3xl font-extrabold tracking-tight md:text-4xl"
          style={{ color: T.navy }}
        >
          Não é um app qualquer. <span style={{ color: T.olive }}>É o SEU app.</span>
        </motion.h2>
        <ul className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {points.map(({ Icon, title, text }, i) => (
            <motion.li
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease, delay: 0.08 + i * 0.1 }}
              className="rounded-2xl border p-6 shadow-sm"
              style={{ borderColor: T.border, background: T.white }}
            >
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: `${T.lime}40`, color: T.navy }}
                aria-hidden
              >
                <Icon size={22} strokeWidth={2.2} />
              </div>
              <h3 className="text-lg font-bold" style={{ color: T.text }}>
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: T.mute }}>
                {text}
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function LandingHowScriptSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const steps = [
    {
      n: '1',
      title: 'Assine e personalize seu painel em menos de 2 minutos.',
    },
    {
      n: '2',
      title: 'Envie seu link exclusivo para quantos pacientes quiser (acesso 100% gratuito para eles).',
    },
    {
      n: '3',
      title: 'O paciente faz substituições ilimitadas baseadas em tabelas nutricionais oficiais, sem precisar te mandar mensagem.',
    },
  ] as const;

  return (
    <section id="como-funciona" ref={ref} className="px-5 py-20 font-sans md:px-16 md:py-24" style={{ background: T.white }}>
      <div className="mx-auto max-w-4xl">
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease }}
          className="text-center text-3xl font-extrabold tracking-tight md:text-4xl"
          style={{ color: T.navy }}
        >
          Praticidade extrema para você e para o paciente.
        </motion.h2>
        <ol className="mt-12 space-y-6">
          {steps.map((s, i) => (
            <motion.li
              key={s.n}
              initial={{ opacity: 0, x: -12 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.45, ease, delay: 0.06 * i }}
              className="flex gap-4 rounded-2xl border p-5 md:p-6"
              style={{ borderColor: T.border, background: T.paper }}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black"
                style={{ background: T.lime, color: T.navy }}
              >
                {s.n}
              </span>
              <p className="pt-1 text-base font-medium leading-relaxed" style={{ color: T.text }}>
                {s.title}
              </p>
            </motion.li>
          ))}
        </ol>
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.35, duration: 0.45 }}
          className="mt-10 flex justify-center"
        >
          <Link
            to="/register"
            className="rounded-full px-8 py-3.5 text-base font-bold shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: T.navy, color: T.white }}
          >
            Quero meu web app personalizado
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

const testimonialPhotos = [
  {
    quote:
      'Recuperei meu tempo livre. Antes eu gastava horas no WhatsApp com dúvidas de trocas. O Altfood é o melhor custo-benefício que já vi.',
    name: 'Dr. Ricardo Silva',
    role: 'Nutricionista Clínico',
    src: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=faces',
  },
  {
    quote:
      'Meus alunos não furam mais a dieta em viagens porque agora sabem substituir sozinhos com o meu app.',
    name: 'Mariana Costa',
    role: 'Personal Trainer',
    src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=faces',
  },
  {
    quote:
      'O White Label passa uma imagem de tecnologia e cuidado que eleva o nível da minha consulta.',
    name: 'Dr. Felipe Augusto',
    role: 'Nutrologia Esportiva',
    src: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=faces',
  },
] as const;

export function LandingTestimonialsScriptSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="px-5 py-20 font-sans md:px-16 md:py-24" style={{ background: T.offWhite }}>
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease }}
          className="text-center text-3xl font-extrabold tracking-tight md:text-4xl"
          style={{ color: T.navy }}
        >
          Quem já transformou o atendimento com o Altfood:
        </motion.h2>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonialPhotos.map((t, i) => (
            <motion.article
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease, delay: 0.08 * i }}
              className="flex flex-col overflow-hidden rounded-2xl border shadow-sm"
              style={{ borderColor: T.border, background: T.white }}
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                <img
                  src={t.src}
                  alt={`Retrato ilustrativo — ${t.name}`}
                  width={400}
                  height={300}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <blockquote className="flex-1 text-sm leading-relaxed italic md:text-base" style={{ color: T.text }}>
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <footer className="mt-4 border-t pt-4 text-sm" style={{ borderColor: T.border }}>
                  <p className="font-bold" style={{ color: T.navy }}>
                    {t.name}
                  </p>
                  <p style={{ color: T.mute }}>{t.role}</p>
                </footer>
              </div>
            </motion.article>
          ))}
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.35, duration: 0.45 }}
          className="mt-12 text-center text-base font-medium"
          style={{ color: T.mute }}
        >
          Junte-se a centenas de profissionais que já automatizaram o suporte nutricional.
        </motion.p>
      </div>
    </section>
  );
}

export function LandingPricingGuaranteeSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="px-5 py-20 font-sans md:px-16 md:py-24" style={{ background: T.paper }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, ease }}
        className="mx-auto max-w-lg"
      >
        <div
          className="rounded-3xl border-2 p-8 shadow-xl md:p-10"
          style={{ borderColor: T.olive, background: T.white }}
        >
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em]" style={{ color: T.olive }}>
            Plano profissional ilimitado
          </p>
          <p className="mt-4 text-center text-4xl font-black md:text-5xl" style={{ color: T.navy }}>
            R$ 19,90
            <span className="text-lg font-semibold md:text-xl" style={{ color: T.mute }}>
              {' '}
              / mês
            </span>
          </p>
          <p className="mt-1 text-center text-sm" style={{ color: T.mute }}>
            (recorrência mensal)
          </p>
          <ul className="mt-8 space-y-3 text-sm md:text-base" style={{ color: T.text }}>
            <li className="flex gap-2">
              <span style={{ color: T.olive }}>✅</span> Pacientes Ilimitados
            </li>
            <li className="flex gap-2">
              <span style={{ color: T.olive }}>✅</span> Personalização Visual Completa
            </li>
            <li className="flex gap-2">
              <span style={{ color: T.olive }}>✅</span> Sem Taxas de Adesão ou Fidelidade
            </li>
          </ul>
          <Link
            to="/register"
            className="mt-8 flex w-full items-center justify-center rounded-full py-4 text-base font-bold transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: T.lime, color: T.navy }}
          >
            Assinar Altfood agora
          </Link>
        </div>

        <div
          className="mt-10 rounded-2xl border p-6 text-center md:p-8"
          style={{ borderColor: `${T.navy}30`, background: T.navy, color: T.white }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: T.lime }}>
            Selo de garantia blindada
          </p>
          <p className="mt-3 text-lg font-extrabold leading-snug md:text-xl">
            7 DIAS DE SATISFAÇÃO GARANTIDA OU SEU DINHEIRO DE VOLTA.
          </p>
          <p className="mt-4 text-sm leading-relaxed opacity-95">
            Teste o Altfood com seus pacientes. Se você não sentir que economizou tempo e profissionalizou sua marca,
            devolvemos 100% do seu investimento. Sem perguntas.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
