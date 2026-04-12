import { Link, useNavigate } from 'react-router-dom';
import { CHECKOUT_MONTHLY_PATH } from '@/lib/checkoutIntent';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, Check, Star, Clock, Search } from 'lucide-react';
import AltfoodIcon from '@/components/AltfoodIcon';
import { useState, useEffect, useRef, useCallback } from 'react';
import { formatRefundGuaranteeShort, PRO_MONTHLY_PRICE_BRL, formatProMonthlyWithPeriod } from '@/lib/subscriptionPricing';
import stepCreatePageImg from '@/assets/step-create-page.png';
import stepShareLinkImg from '@/assets/step-share-link.png';
import stepPatientImg from '@/assets/step-patient-autonomous.png';

/* ─────────────── animation presets ─────────────── */
const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.7, ease } }),
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({ opacity: 1, transition: { delay: i * 0.08, duration: 0.6, ease } }),
};

/* ─────────────── data ─────────────── */
const waMsgs = [
  { text: 'Dra., não tem frango aqui. Posso trocar por quê? 🤔', time: '18:31', side: 'in' },
  { text: 'E 100g de frango é quanto de patinho mesmo?', time: '18:32', side: 'in' },
  { text: 'Ah e o arroz pode usar quinoa?', time: '18:33', side: 'in' },
  { text: 'A batata doce acabou tb kkkk', time: '18:34', side: 'in' },
  { text: 'Dra.? Tá aí? Urgente 😅', time: '18:36', side: 'in' },
];

const testimonials = [
  { name: 'Dra. Camila Santos', role: 'Nutricionista Clínica · SP', color: '#0F766E', text: 'Eu perdia 1h por dia respondendo "posso trocar o frango?". Agora meus pacientes resolvem sozinhos. Meu WhatsApp ficou silencioso de substituição.' },
  { name: 'Dr. Ricardo Mendes', role: 'Endocrinologista · RJ', color: '#2563EB', text: 'Mandei o link do Altfood para os 80 pacientes da minha agenda. No mesmo dia, parei de receber mensagem de substituição. Simples assim.' },
  { name: 'Dra. Fernanda Lima', role: 'Clínica Geral · MG', color: '#7C3AED', text: 'Meus pacientes estão no mercado e me chamavam pra consultar. Hoje eles abrem o Altfood na hora. Não me ligam mais pra isso.' },
  { name: 'Dra. Juliana Rocha', role: 'Nutricionista Esportiva · RS', color: '#DC2626', text: 'Meus atletas trocam alimentos no dia a dia o tempo todo. O Altfood virou extensão do meu consultório. Uso desde o lançamento.' },
  { name: 'Dr. André Tavares', role: 'Nutrólogo · DF', color: '#0284C7', text: 'Em 2 minutos configurei minha página. No mesmo dia, 3 pacientes já usaram sem me mandar mensagem. Melhor investimento do ano.' },
  { name: 'Dra. Patrícia Almeida', role: 'Nutricionista Materno-Infantil · CE', color: '#D97706', text: 'As mães me mandavam áudio de 3 minutos perguntando substituição. Agora elas consultam no Altfood e me mandam só "obrigada" 😂.' },
];

/* ─────────────── “Como funciona”: print dentro de moldura celular ─────────────── */
function StepPhoneScreenshot({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className="relative mx-auto w-[118px] sm:w-[132px] md:w-[146px] aspect-[9/18.5]">
      <div
        className="absolute inset-0 rounded-[1.7rem] bg-gradient-to-b from-zinc-600 via-zinc-800 to-zinc-950 shadow-[0_20px_48px_-14px_rgba(0,0,0,0.42)] border border-white/[0.12] ring-1 ring-black/25"
        aria-hidden
      />
      <div className="pointer-events-none absolute left-1/2 top-[9px] z-10 h-[10px] w-10 -translate-x-1/2 rounded-full bg-black shadow-inner" aria-hidden />
      <div className="absolute inset-[6px] top-[22px] overflow-hidden rounded-[1.05rem] bg-zinc-950 ring-1 ring-black/40">
        <img src={src} alt={alt} className="h-full w-full object-cover object-top" loading="lazy" decoding="async" />
      </div>
    </figure>
  );
}

/* ─────────────── WhatsApp sim ─────────────── */
function WhatsAppSim() {
  const [visible, setVisible] = useState(1);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => setVisible(v => Math.min(v + 1, waMsgs.length)), 900);
    return () => clearInterval(t);
  }, [inView]);

  return (
    <div ref={ref} className="relative mx-auto w-[min(100%,286px)]">
      {/* Phone shell — ~9:19 portrait, bezel fino */}
      <div className="relative bg-gradient-to-b from-[#2a2a3e] to-[#12121c] rounded-[2.85rem] p-[10px] shadow-[0_28px_70px_-14px_rgba(0,0,0,0.55)] border border-white/[0.12] ring-1 ring-black/40">
        {/* Dynamic island */}
        <div className="absolute top-[11px] left-1/2 -translate-x-1/2 w-[72px] h-[26px] bg-black rounded-full z-20 shadow-inner" />
        <div className="rounded-[2.25rem] overflow-hidden bg-[#ECE5DD] shadow-inner">
          {/* WA header — safe area abaixo da ilha */}
          <div className="bg-[#075E54] px-3.5 pt-10 pb-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold shrink-0">Dra</div>
            <div>
              <p className="text-white text-sm font-semibold leading-none">Dra. Maria Nutricionista</p>
              <p className="text-white/60 text-[10px] mt-0.5">online</p>
            </div>
          </div>
          {/* Messages */}
          <div className="px-3 pt-3 pb-3 min-h-[min(52vh,340px)] sm:min-h-[360px] space-y-2 bg-[url('data:image/svg+xml,%3Csvg width=\'300\' height=\'300\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'300\' height=\'300\' fill=\'%23ECE5DD\'/%3E%3C/svg%3E')]">
            {waMsgs.slice(0, visible).map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex justify-start"
              >
                <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%] shadow-sm">
                  <p className="text-[#1a1a1a] text-[12px] leading-relaxed">{msg.text}</p>
                  <p className="text-[10px] text-gray-400 text-right mt-0.5">{msg.time}</p>
                </div>
              </motion.div>
            ))}
            {visible < waMsgs.length && (
              <div className="flex gap-1 pl-2 pt-1">
                {[0, 1, 2].map(i => (
                  <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400"
                    animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} />
                ))}
              </div>
            )}
          </div>
          {/* Input bar — home indicator */}
          <div className="bg-[#F0F0F0] px-3 py-2 flex items-center gap-2 pb-3">
            <div className="flex-1 bg-white rounded-full h-9 px-3 flex items-center">
              <span className="text-gray-400 text-[11px]">Mensagem</span>
            </div>
          </div>
          <div className="h-1.5 flex justify-center pb-1.5 bg-[#F0F0F0]">
            <div className="w-28 h-1 rounded-full bg-black/15" aria-hidden />
          </div>
        </div>
      </div>
      {/* Notification badges */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 2.5 }}
        className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
      >
        {visible}
      </motion.div>
    </div>
  );
}

/* ─────────────── Time Calculator (IMPLICATION) ─────────────── */
function TimeCalculator() {
  const [perWeek, setPerWeek] = useState(15);
  const minPerMsg = 3;
  const weeksPerYear = 48;
  const minsPerWeek = perWeek * minPerMsg;
  const hoursPerYear = Math.round((minsPerWeek * weeksPerYear) / 60);
  const consultaLost = Math.round(hoursPerYear / 0.75); // ~45min por consulta

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 space-y-8">
      <div className="space-y-2">
        <label className="text-white/60 text-sm font-medium block">
          Quantas perguntas de substituição você recebe <strong className="text-white">por semana?</strong>
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range" min={1} max={60} value={perWeek}
            onChange={e => setPerWeek(+e.target.value)}
            className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-[#0F766E]"
          />
          <span className="text-3xl font-display font-bold text-white w-14 text-right tabular-nums">{perWeek}</span>
        </div>
        <p className="text-white/40 text-xs">Média: cada resposta leva ~3 minutos</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'minutos / semana', value: minsPerWeek, unit: 'min' },
          { label: 'horas / ano perdidas', value: hoursPerYear, unit: 'h', highlight: true },
          { label: 'consultas que você perde', value: consultaLost, unit: '' },
        ].map((s, i) => (
          <div key={i} className={`rounded-2xl p-4 text-center ${s.highlight ? 'bg-[#0F766E] border-0' : 'bg-white/5 border border-white/10'}`}>
            <motion.p
              key={s.value}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-3xl md:text-4xl font-display font-bold ${s.highlight ? 'text-white' : 'text-white/90'}`}
            >
              {s.value}{s.unit}
            </motion.p>
            <p className={`text-[11px] mt-1 leading-tight ${s.highlight ? 'text-white/80' : 'text-white/40'}`}>{s.label}</p>
          </div>
        ))}
      </div>

      <p className="text-center text-white/50 text-sm">
        São <strong className="text-white">{hoursPerYear} horas</strong> por ano respondendo coisa que uma ferramenta de R$ {PRO_MONTHLY_PRICE_BRL.toFixed(2).replace('.', ',')}/mês pode fazer por você.
      </p>
    </div>
  );
}

/* ─────────────── Patient Page Mockup ─────────────── */
function PatientMockup() {
  const foods = ['Frango', 'Arroz branco', 'Batata doce', 'Ovo cozido', 'Aveia'];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive(v => (v + 1) % foods.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative mx-auto w-[min(100%,278px)]">
      {/* Phone shell — proporção smartphone (~9:19), bezel fino */}
      <div className="relative bg-gradient-to-b from-zinc-800 to-zinc-950 rounded-[2.85rem] p-[10px] shadow-[0_28px_70px_-14px_rgba(0,0,0,0.55)] ring-1 ring-white/10">
        <div className="absolute top-[11px] left-1/2 -translate-x-1/2 w-[72px] h-[26px] bg-black rounded-full z-20 shadow-inner" />
        <div className="rounded-[2.25rem] overflow-hidden bg-[#F7FAF9] shadow-inner">
          {/* Header */}
          <div className="bg-[#0F766E] px-3.5 pt-10 pb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0">DC</div>
              <div>
                <p className="text-white font-semibold text-sm leading-none">Dra. Carine Cassol</p>
                <p className="text-white/70 text-[11px] mt-0.5">Nutricionista · CRN 12345</p>
              </div>
            </div>
            {/* Search */}
            <div className="bg-white rounded-xl flex items-center gap-2 px-3 py-2.5">
              <Search className="w-4 h-4 text-[#0F766E] shrink-0" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={active}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-[#0F766E] text-sm font-medium"
                >
                  {foods[active]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
          {/* Results */}
          <div className="px-3 py-3 space-y-2 min-h-[200px]">
            <p className="text-[10px] text-gray-400 font-medium px-1">8 substituições encontradas</p>
            {[
              { name: 'Patinho moído', pct: '100%', icon: '🥩' },
              { name: 'Carne de soja', pct: '95%', icon: '🌱' },
              { name: 'Atum em água', pct: '98%', icon: '🐟' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm border border-gray-100">
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-gray-800 truncate">{item.name}</p>
                  <p className="text-[10px] text-gray-400">Equivalência proteica</p>
                </div>
                <span className="text-[11px] font-bold text-[#0F766E] bg-[#0F766E]/10 px-2 py-0.5 rounded-full">{item.pct}</span>
              </div>
            ))}
          </div>
          <div className="bg-[#F7FAF9] pt-1 pb-2 flex justify-center">
            <div className="w-28 h-1 rounded-full bg-black/12" aria-hidden />
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="absolute -left-4 sm:-left-6 top-1/3 bg-white rounded-2xl shadow-xl px-3 py-2.5 sm:px-4 sm:py-3 border border-[#0F766E]/10 max-sm:scale-90 max-sm:-left-2"
      >
        <p className="text-[11px] font-bold text-[#0F766E]">✓ Sem te chamar</p>
        <p className="text-[10px] text-gray-400">Em 4 segundos</p>
      </motion.div>
    </div>
  );
}

/* ─────────────── main component ─────────────── */
export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 32);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a1f16]/95 backdrop-blur-xl shadow-lg border-b border-white/5' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <AltfoodIcon size="xs" />
            <span className="font-logo font-bold text-lg text-white tracking-tight">Altfood</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#como-funciona" className="text-white/60 hover:text-white transition-colors">Como funciona</a>
            <a href="#depoimentos" className="text-white/60 hover:text-white transition-colors">Depoimentos</a>
            <a href="#faq" className="text-white/60 hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">Entrar</Button>
            </Link>
            <Link to={CHECKOUT_MONTHLY_PATH}>
              <Button size="sm" className="gradient-hero text-white shadow-lg shadow-[#0F766E]/30 rounded-xl font-semibold">
                Começar grátis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="gradient-dark pt-28 pb-20 md:pt-36 md:pb-28 px-4 relative overflow-hidden">
        {/* bg texture */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl gradient-hero pointer-events-none" />

        <div className="relative max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* Left */}
            <motion.div initial="hidden" animate="visible" className="space-y-8">
              <motion.div variants={fadeUp} custom={0}>
                <span className="inline-flex items-center gap-2 text-[#0F766E] text-xs font-bold tracking-widest uppercase border border-[#0F766E]/30 bg-[#0F766E]/10 px-4 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] animate-pulse" />
                  Mais de 500 profissionais usando
                </span>
              </motion.div>

              <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.08] tracking-tight">
                Você passou 8 anos se formando pra responder{' '}
                <span className="text-gradient italic">"posso trocar o frango?"</span>
                {' '}no WhatsApp?
              </motion.h1>

              <motion.p variants={fadeUp} custom={2} className="text-white/60 text-lg leading-relaxed max-w-lg">
                O Altfood cria sua <strong className="text-white">página personalizada</strong> de substituições alimentares. Seu paciente acessa, encontra a troca, pronto. Sem te chamar. Com a sua marca.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link to={CHECKOUT_MONTHLY_PATH}>
                  <Button size="lg" className="gradient-hero text-white shadow-lg shadow-[#0F766E]/40 rounded-xl font-bold px-8 h-14 text-base group">
                    Quero parar de responder isso
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <a href={`${window.location.origin}/dracarinecassol`} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="rounded-xl h-14 text-base bg-[#0F766E] hover:bg-[#0d6b64] text-white border-0 px-8 font-semibold">
                    Ver como o paciente vê →
                  </Button>
                </a>
              </motion.div>

              <motion.div variants={fadeUp} custom={4} className="flex items-center gap-6 pt-2">
                {['Setup em 2 min', 'Sem instalar app', formatRefundGuaranteeShort()].map((t, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-xs text-white/40">
                    <Check className="w-3 h-3 text-[#0F766E]" />{t}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — phone mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.3, duration: 0.9, ease }}
              className="flex justify-center md:justify-end"
            >
              <PatientMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF TICKER ─────────────────────────────────── */}
      <div className="bg-[#0F766E] py-4 px-4 overflow-hidden">
        <div className="flex items-center gap-12 animate-[ticker_50s_linear_infinite]" style={{ width: 'max-content' }}>
          {[...Array(4)].flatMap(() => [
            { icon: '👩‍⚕️', text: '500+ profissionais ativos' },
            { icon: '⚡', text: '50.000+ substituições/mês' },
            { icon: '⭐', text: '4.9 de avaliação' },
            { icon: '🕐', text: '1h+ economizada por dia' },
            { icon: '📱', text: 'Funciona no celular, sem app' },
            { icon: '🌿', text: 'Base TACO — 463 alimentos' },
          ]).map((item, i) => (
            <span key={i} className="flex items-center gap-2 text-white/90 text-sm font-medium whitespace-nowrap">
              <span>{item.icon}</span>
              <span>{item.text}</span>
              <span className="text-white/30 ml-8">·</span>
            </span>
          ))}
        </div>
      </div>
      <style>{`@keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>

      {/* ── PROBLEM — WhatsApp nightmare ────────────────────────── */}
      <section className="py-20 md:py-28 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left — scene */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              className="space-y-6"
            >
              <motion.span variants={fadeUp} custom={0} className="text-xs font-bold tracking-widest uppercase text-destructive/60 block">
                Isso te parece familiar?
              </motion.span>

              <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                São 18h30.<br />
                A última consulta<br />
                acabou.
              </motion.h2>

              <motion.div variants={fadeUp} custom={2} className="space-y-4 text-muted-foreground text-base leading-relaxed">
                <p>Mas o WhatsApp não sabe disso.</p>
                <p>Sete mensagens novas. Todas sobre substituição alimentar. Todas de pacientes diferentes. Todas esperando resposta.</p>
                <p className="text-foreground font-medium">Você não é uma calculadora nutricional disponível 24h. Mas seus pacientes acham que é.</p>
              </motion.div>

              <motion.div variants={fadeUp} custom={3} className="flex items-center gap-3 bg-destructive/5 border border-destructive/15 rounded-2xl px-5 py-4">
                <Clock className="w-5 h-5 text-destructive/60 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Cada resposta leva <strong className="text-foreground">3 minutos</strong>. Com 20 pacientes ativos, são <strong className="text-foreground">1 hora do seu dia</strong> — todo dia — sem cobrar nada por isso.
                </p>
              </motion.div>
            </motion.div>

            {/* Right — WA simulation */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease }}
            >
              <WhatsAppSim />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── IMPLICATION — Time calculator ───────────────────────── */}
      <section className="py-20 md:py-28 px-4 gradient-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-3xl mx-auto space-y-12">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            className="text-center space-y-4"
          >
            <motion.span variants={fadeUp} custom={0} className="text-xs font-bold tracking-widest uppercase text-[#0F766E] block">
              Calcule sua perda
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-5xl font-bold text-white leading-tight">
              Quanto do seu ano vai embora<br />
              <span className="text-gradient">respondendo substituição?</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-white/50 max-w-md mx-auto">
              Arraste o controle abaixo e veja o real impacto no seu tempo.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.7, ease }}
          >
            <TimeCalculator />
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center"
          >
            <motion.div variants={fadeUp} custom={0}>
              <Link to={CHECKOUT_MONTHLY_PATH}>
                <Button size="lg" className="gradient-hero text-white shadow-lg shadow-[#0F766E]/40 rounded-xl font-bold px-10 h-14 text-base group">
                  Quero essas horas de volta
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <p className="text-white/30 text-xs mt-3">{formatRefundGuaranteeShort()}</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── NEED-PAYOFF — Solution reveal ───────────────────────── */}
      <section className="py-20 md:py-28 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            className="text-center space-y-4 mb-16"
          >
            <motion.span variants={fadeUp} custom={0} className="text-xs font-bold tracking-widest uppercase text-[#0F766E] block">
              A solução
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight">
              E se você nunca mais precisasse<br />
              <span className="text-gradient">responder isso?</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg max-w-xl mx-auto">
              O Altfood cria sua página personalizada com todas as substituições da tabela TACO. Seu paciente acessa, busca o alimento, encontra as trocas. Sem te chamar. Com a sua marca.
            </motion.p>
          </motion.div>

          {/* Before / After */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Before */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease }}
              className="rounded-3xl border-2 border-destructive/15 bg-destructive/[0.02] p-8 space-y-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-destructive/40" />
                <span className="text-xs font-bold text-destructive/60 uppercase tracking-wider">Antes do Altfood</span>
              </div>
              {[
                'WhatsApp explodindo com substituições',
                'Consultando planilhas ou memória',
                '3–5 min por resposta, 10x por dia',
                'Respondendo nos fins de semana',
                'Paciente sem autonomia, dependente',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="mt-0.5 text-destructive/50 font-bold">✕</span>
                  {item}
                </div>
              ))}
            </motion.div>

            {/* After */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease, delay: 0.1 }}
              className="rounded-3xl border-2 border-[#0F766E]/25 bg-[#0F766E]/[0.03] p-8 space-y-4 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-2xl gradient-hero pointer-events-none" />
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-[#0F766E]" />
                <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider">Com o Altfood</span>
              </div>
              {[
                'Paciente acessa sua página em segundos',
                'Encontra 8+ substituições com equivalência',
                'Zero mensagens de substituição no WhatsApp',
                'Sua marca, seu link, seu visual',
                'Você consultando. Não respondendo.',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-foreground font-medium">
                  <Check className="mt-0.5 w-4 h-4 text-[#0F766E] shrink-0" />
                  {item}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section id="como-funciona" className="py-20 md:py-28 px-4 bg-[#F7FAF9]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            className="text-center space-y-4 mb-16"
          >
            <motion.span variants={fadeUp} custom={0} className="text-xs font-bold tracking-widest uppercase text-[#0F766E] block">
              Como funciona
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl font-bold text-foreground">
              3 passos e nunca mais responda substituição
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-10">
            {[
              {
                step: '01',
                title: 'Crie sua página',
                desc: 'Cadastre-se em 2 minutos. Coloque seu nome, especialidade e escolha a cor da sua identidade visual. Sua página fica online na hora.',
                img: stepCreatePageImg,
                color: '#0F766E',
              },
              {
                step: '02',
                title: 'Compartilhe o link',
                desc: 'Você recebe um link único (altfood.app/seu-nome). Manda pelo WhatsApp, coloca na bio do Instagram, gera QR Code. Uma vez só.',
                img: stepShareLinkImg,
                color: '#2563EB',
              },
              {
                step: '03',
                title: 'Paciente resolve sozinho',
                desc: '"Não tem frango?" Ele abre o link, digita frango, encontra 8 opções com equivalência nutricional. Em 4 segundos. Sem te chamar.',
                img: stepPatientImg,
                color: '#059669',
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.12, duration: 0.7, ease }}
                className="relative"
              >
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-px border-t-2 border-dashed border-[#0F766E]/20 z-0" style={{ width: 'calc(100% - 2rem)', left: 'calc(100% - 0.5rem)' }} />
                )}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-border/50 hover:shadow-md hover:border-[#0F766E]/20 transition-all duration-300 text-center space-y-5 h-full relative z-10">
                  <div className="flex justify-center pt-1">
                    <StepPhoneScreenshot src={s.img} alt={s.title} />
                  </div>
                  <div>
                    <span className="text-gradient text-xs font-black tracking-widest uppercase">{s.step}</span>
                    <h3 className="font-display text-xl font-bold text-foreground mt-1">{s.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center mt-12"
          >
            <Link to={CHECKOUT_MONTHLY_PATH}>
              <Button size="lg" className="gradient-hero text-white shadow-lg shadow-[#0F766E]/30 rounded-xl font-bold px-10 h-13 text-base group">
                Criar minha página agora
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              className="space-y-6"
            >
              <motion.span variants={fadeUp} custom={0} className="text-xs font-bold tracking-widest uppercase text-[#0F766E] block">
                Tudo que você precisa
              </motion.span>
              <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
                Simples pra você.<br />
                Poderoso pro paciente.
              </motion.h2>

              <div className="space-y-4">
                {[
                  { icon: '🧬', title: 'Base TACO completa', desc: '463+ alimentos com dados nutricionais confiáveis da Tabela TACO — referência nacional.' },
                  { icon: '🎨', title: 'Sua marca, sua identidade', desc: 'Logo, cores e link exclusivo. O paciente vê SUA página, não um app genérico.' },
                  { icon: '📊', title: 'Analytics em tempo real', desc: 'Veja quantos pacientes acessam, quais alimentos mais buscam, de onde vêm.' },
                  { icon: '⚡', title: 'Zero fricção pro paciente', desc: 'Sem criar conta, sem instalar nada. Link aberto → alimento encontrado → substituição usada.' },
                ].map((f, i) => (
                  <motion.div key={i} variants={fadeUp} custom={i + 2} className="flex items-start gap-4 group">
                    <span className="text-2xl mt-0.5 group-hover:scale-110 transition-transform duration-200 select-none">{f.icon}</span>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{f.title}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed mt-0.5">{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* right – device mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease }}
              className="flex justify-center"
            >
              <div className="relative">
                {/* laptop shell */}
                <div className="bg-[#1a1a2e] rounded-2xl p-3 shadow-2xl ring-1 ring-white/10 w-72 md:w-80">
                  <div className="bg-[#0a0f0d] rounded-xl overflow-hidden">
                    {/* toolbar */}
                    <div className="bg-[#111] px-3 py-2 flex items-center gap-1.5">
                      {['#ff5f57', '#ffbd2e', '#28c840'].map((c, i) => (
                        <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                      ))}
                      <div className="ml-2 flex-1 bg-white/5 rounded h-4 flex items-center px-2">
                        <span className="text-[9px] text-white/30">altfood.app/dra-carine</span>
                      </div>
                    </div>
                    {/* "screen" showing dashboard */}
                    <div className="p-3 space-y-2 min-h-[200px]">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-white/70 text-[11px] font-semibold">Dashboard</p>
                        <span className="text-[9px] bg-[#0F766E]/20 text-[#0F766E] rounded px-2 py-0.5 font-semibold">Pro ativo</span>
                      </div>
                      {[
                        { label: 'Acessos esta semana', value: '247', change: '+18%' },
                        { label: 'Alimento mais buscado', value: 'Frango', change: '38x' },
                        { label: 'Pacientes únicos', value: '89', change: '+5' },
                      ].map((row, i) => (
                        <div key={i} className="bg-white/5 rounded-lg px-3 py-2 flex items-center justify-between">
                          <span className="text-[10px] text-white/40">{row.label}</span>
                          <div className="text-right">
                            <span className="text-[11px] font-bold text-white">{row.value}</span>
                            <span className="text-[9px] text-[#0F766E] ml-1.5">{row.change}</span>
                          </div>
                        </div>
                      ))}
                      <div className="bg-[#0F766E]/10 rounded-lg p-3 mt-2">
                        <p className="text-[10px] text-[#0F766E] font-semibold">Esta semana: 0 mensagens de substituição no WhatsApp 🎉</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* stand */}
                <div className="w-20 h-3 mx-auto bg-[#1a1a2e] rounded-b-xl" />
                <div className="w-28 h-1.5 mx-auto bg-[#333] rounded-full" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────── */}
      <section id="depoimentos" className="py-20 md:py-28 px-4 bg-[#F7FAF9]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            className="text-center space-y-4 mb-16"
          >
            <motion.span variants={fadeUp} custom={0} className="text-xs font-bold tracking-widest uppercase text-[#0F766E] block">
              Depoimentos reais
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Quem usa, não volta atrás
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.08, duration: 0.6, ease }}
                className="bg-white rounded-3xl p-7 shadow-sm border border-border/40 hover:shadow-md transition-all duration-300 flex flex-col gap-5"
              >
                {/* Stars */}
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                {/* Quote */}
                <p className="text-sm text-foreground leading-relaxed flex-1 italic">"{t.text}"</p>
                {/* Author */}
                <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: t.color }}>
                    {t.name.split(' ').filter(w => w.length > 2).map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground leading-none">{t.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────── */}
      <section id="planos" className="py-20 md:py-28 px-4 gradient-dark relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full opacity-10 blur-3xl gradient-hero pointer-events-none" />
        <div className="relative max-w-lg mx-auto text-center space-y-10">
          <div className="space-y-4">
            <span className="text-xs font-bold tracking-widest uppercase text-[#0F766E] block">Investimento</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              Menos que um café por dia.<br />
              <span className="text-gradient">Horas de volta por semana.</span>
            </h2>
          </div>

          {/* Callout */}
          <div className="bg-[#0F766E]/10 border border-[#0F766E]/20 rounded-2xl px-6 py-5 text-left flex gap-4">
            <span className="text-2xl shrink-0">🎉</span>
            <div>
              <p className="text-white font-bold text-sm">Seu paciente não paga nada</p>
              <p className="text-white/50 text-xs mt-1">Só você investe. Seus pacientes acessam sua página gratuitamente, sem criar conta, sem instalar app — em qualquer celular.</p>
            </div>
          </div>

          {/* Card */}
          <div className="relative pt-5">
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10">
              <span className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full gradient-gold text-white text-xs font-black shadow-lg tracking-wide">
                ✦ Altfood Pro
              </span>
            </div>
            <div className="rounded-3xl bg-white/[0.07] border border-white/15 backdrop-blur-xl p-8 pt-12 space-y-7 shimmer">
              <div className="text-center">
                <div className="flex items-end justify-center gap-1">
                  <span className="text-white/40 text-base font-medium self-start mt-4">R$</span>
                  <span className="font-display text-6xl font-black text-white tabular-nums">
                    {Math.floor(PRO_MONTHLY_PRICE_BRL)}
                  </span>
                  <span className="text-white/70 text-2xl font-bold self-end mb-1">
                    ,{PRO_MONTHLY_PRICE_BRL.toFixed(2).split('.')[1]}
                  </span>
                </div>
                <p className="text-white/40 text-sm">/mês · Cancele quando quiser</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  'Substituições ilimitadas',
                  'Base TACO (463+ alimentos)',
                  'Página com sua marca',
                  'Analytics em tempo real',
                  'Link e QR Code exclusivos',
                  'Suporte prioritário',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-white/70">
                    <div className="w-4 h-4 rounded-full bg-[#0F766E]/30 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-[#0F766E]" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>

              <Button
                onClick={() => navigate(CHECKOUT_MONTHLY_PATH)}
                size="lg"
                className="w-full gradient-hero text-white font-black rounded-xl h-14 text-base shadow-lg shadow-[#0F766E]/30 group"
              >
                Assinar Altfood Pro
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-[11px] text-white/20 text-center">{formatRefundGuaranteeShort()} · Pagamento seguro</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 md:py-28 px-4 bg-background">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            className="text-center space-y-4 mb-12"
          >
            <motion.span variants={fadeUp} custom={0} className="text-xs font-bold tracking-widest uppercase text-[#0F766E] block">FAQ</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl font-bold text-foreground">Perguntas frequentes</motion.h2>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.6 }}>
            <Accordion type="single" collapsible className="space-y-3">
              {[
                { q: 'Como meu paciente acessa?', a: 'Você recebe um link exclusivo (ex: altfood.app/seu-nome). Basta enviar via WhatsApp ou colocar na bio do Instagram. O paciente abre no celular, sem criar conta ou instalar nada.' },
                { q: 'Precisa instalar algum app?', a: 'Não — nem você, nem o paciente. O Altfood funciona 100% no navegador, em qualquer celular ou computador.' },
                { q: 'Os dados nutricionais são confiáveis?', a: 'Usamos a Tabela TACO (Tabela Brasileira de Composição de Alimentos), 4ª edição, da NEPA/UNICAMP — referência nacional com 463+ alimentos catalogados.' },
                { q: 'Meu paciente paga alguma coisa?', a: `Não. Só você investe — ${formatProMonthlyWithPeriod()} — e seus pacientes acessam gratuitamente, sem limite.` },
                { q: 'Como funciona o reembolso?', a: formatRefundGuaranteeShort() + '. Se você cancelar e solicitar reembolso dentro desse prazo, devolvemos 100% do valor pago, sem questionamentos.' },
                { q: 'Posso personalizar com minha marca?', a: 'Sim! Você escolhe sua cor, define seu link (altfood.app/seu-nome), adiciona sua especialidade e CRN/CRM. A página é completamente sua.' },
                { q: 'Posso cancelar quando quiser?', a: 'Sim, sem multa ou burocracia. Você cancela pelo dashboard e continua com acesso até o fim do período pago.' },
              ].map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="bg-card rounded-2xl px-6 border border-border/40 shadow-sm">
                  <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline py-5 text-left">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-4 gradient-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="relative max-w-3xl mx-auto text-center space-y-8"
        >
          <motion.h2 variants={fadeUp} custom={0} className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Seu próximo paciente<br />
            já vai se virar sozinho.
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-white/50 text-lg max-w-xl mx-auto">
            Configure em 2 minutos. Envie o link pra agenda inteira. A partir de hoje, "posso trocar o frango?" deixa de ser problema seu.
          </motion.p>
          <motion.div variants={fadeUp} custom={2} className="space-y-4">
            <Link to={CHECKOUT_MONTHLY_PATH}>
              <Button size="lg" className="gradient-hero text-white shadow-2xl shadow-[#0F766E]/40 rounded-xl font-black px-12 h-16 text-xl group">
                Criar minha página agora
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="text-white/25 text-sm">{formatRefundGuaranteeShort()} · Cancele quando quiser</p>
          </motion.div>
          <motion.div variants={fadeUp} custom={3} className="flex items-center justify-center gap-8 pt-4 flex-wrap">
            {['Setup em 2 minutos', 'Sem contrato', 'Dados da Tabela TACO', 'Suporte humano'].map((t, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs text-white/30">
                <Check className="w-3 h-3 text-[#0F766E]" />{t}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="bg-[#060f0a] border-t border-white/5 px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2">
              <AltfoodIcon size="xs" />
              <span className="font-logo font-bold text-white tracking-tight">Altfood</span>
            </div>
            <div className="flex items-center gap-8 text-sm">
              {[
                { label: 'Planos', to: CHECKOUT_MONTHLY_PATH, isLink: true },
                { label: 'FAQ', href: '#faq' },
                { label: 'Contato', to: '/dashboard/support', isLink: true },
              ].map((item, i) =>
                item.isLink ? (
                  <Link key={i} to={item.to!} className="text-white/40 hover:text-white transition-colors">{item.label}</Link>
                ) : (
                  <a key={i} href={item.href} className="text-white/40 hover:text-white transition-colors">{item.label}</a>
                )
              )}
            </div>
          </div>
          <div className="h-px bg-white/5 mb-6" />
          <p className="text-[11px] text-white/20 text-center">© 2025 Altfood. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
