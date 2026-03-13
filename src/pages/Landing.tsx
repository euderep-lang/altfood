import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, Check, Sparkles, Star, UserPlus, Share2, Search, Crown } from 'lucide-react';
import AltfoodIcon from '@/components/AltfoodIcon';
import { useState, useEffect, useCallback } from 'react';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.08, duration: 0.5, ease },
  }),
};

const allTestimonials = [
  {
    name: 'Dra. Camila Santos',
    specialty: 'Nutricionista Clínica',
    initials: 'CS',
    color: '#0F766E',
    quote: 'Eu perdia pelo menos 1h por dia respondendo "Dra., posso trocar o frango por quê?". Agora meus pacientes resolvem sozinhos pelo Altfood.',
  },
  {
    name: 'Dr. Ricardo Mendes',
    specialty: 'Endocrinologista',
    initials: 'RM',
    color: '#2563EB',
    quote: 'Toda hora chegava mensagem: "e o arroz, posso trocar?" "e a batata?". Mandei o link do Altfood e acabou. Simples assim.',
  },
  {
    name: 'Dra. Fernanda Lima',
    specialty: 'Clínica Geral',
    initials: 'FL',
    color: '#7C3AED',
    quote: 'Meus pacientes adoram. Estão no mercado, não acham o alimento e já consultam a troca pelo celular. Não me ligam mais pra isso.',
  },
  {
    name: 'Dra. Juliana Rocha',
    specialty: 'Nutricionista Esportiva',
    initials: 'JR',
    color: '#DC2626',
    quote: 'Meus atletas precisam trocar alimentos no dia a dia o tempo todo. O Altfood virou extensão do meu consultório.',
  },
  {
    name: 'Dr. André Tavares',
    specialty: 'Nutrólogo',
    initials: 'AT',
    color: '#0284C7',
    quote: 'Em 2 minutos configurei minha página. No mesmo dia, 3 pacientes já usaram sem me mandar mensagem. Melhor investimento do ano.',
  },
  {
    name: 'Dra. Patrícia Almeida',
    specialty: 'Nutricionista Materno-Infantil',
    initials: 'PA',
    color: '#D97706',
    quote: 'As mães me mandavam áudio de 3 minutos perguntando substituição. Agora elas consultam no Altfood e me mandam "obrigada" 😂.',
  },
  {
    name: 'Dra. Marina Costa',
    specialty: 'Nutricionista Funcional',
    initials: 'MC',
    color: '#059669',
    quote: 'Antes eu ficava no WhatsApp calculando "100g de frango = Xg de patinho". Agora o paciente vê isso sozinho. Minha agenda agradece.',
  },
  {
    name: 'Dr. Felipe Barros',
    specialty: 'Gastroenterologista',
    initials: 'FB',
    color: '#4F46E5',
    quote: 'Pacientes com restrições alimentares me bombardeavam com dúvidas. O Altfood dá autonomia pra eles e tranquilidade pra mim.',
  },
  {
    name: 'Dra. Beatriz Nunes',
    specialty: 'Nutricionista Oncológica',
    initials: 'BN',
    color: '#BE185D',
    quote: 'Ferramenta indispensável. Meus pacientes em tratamento conseguem trocar alimentos de forma rápida quando o paladar muda.',
  },
];

function useRotatingTestimonials(count: number, intervalMs: number) {
  const [displayed, setDisplayed] = useState<typeof allTestimonials>([]);

  const pickRandom = useCallback(() => {
    const shuffled = [...allTestimonials].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }, [count]);

  useEffect(() => {
    setDisplayed(pickRandom());
    const timer = setInterval(() => setDisplayed(pickRandom()), intervalMs);
    return () => clearInterval(timer);
  }, [pickRandom, intervalMs]);

  return displayed;
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [billingAnnual] = useState(true);
  const testimonials = useRotatingTestimonials(3, 6000);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const monthlyPrice = 47.9;
  const annualTotal = 358.8;
  const annualPricePerMonth = (annualTotal / 12);
  const savingsPerYear = ((monthlyPrice * 12) - annualTotal).toFixed(0);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Nav */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-card shadow-md border-b border-border' : 'glass-nav'}`}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <AltfoodIcon size="xs" className="shadow-md group-hover:glow-shadow transition-shadow duration-300" />
            <span className="font-logo font-bold text-lg text-foreground tracking-tight">Altfood</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#como-funciona" className="text-muted-foreground hover:text-foreground transition-colors">Como funciona</a>
            <a href="#planos" className="text-muted-foreground hover:text-foreground transition-colors">Planos</a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-1.5">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Entrar</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="gradient-hero shadow-md">Testar 3 dias grátis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-20 md:py-32 px-4 hero-pattern overflow-hidden">
        <div className="absolute inset-0 gradient-glow pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20 blur-3xl gradient-hero pointer-events-none" />

        <motion.div initial="hidden" animate="visible" className="relative max-w-3xl mx-auto text-center space-y-8">
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full premium-border bg-accent/60 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold tracking-wide text-primary uppercase">Chega de responder "posso trocar o frango?"</span>
          </motion.div>

          <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-6xl font-display font-bold text-foreground leading-[1.1] tracking-tight">
            Quanto vale sua hora
            <br />
            <span className="text-gradient">respondendo paciente?</span>
          </motion.h1>

          <motion.p variants={fadeUp} custom={2} className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            <em>"Dra., não tem frango. Posso trocar por quê?"</em> — <em>"E o arroz?"</em> — <em>"E a batata?"</em> 😅
            <br className="hidden md:block" />
            O <strong className="text-foreground">Altfood</strong> responde por você. Seu paciente consulta na hora, pelo celular, com a <strong className="text-foreground">sua marca</strong>.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to="/register">
              <Button variant="premium" size="xl" className="w-full sm:w-auto group">
                Testar 3 dias grátis
                <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} custom={4} className="flex items-center justify-center gap-6 pt-4 flex-wrap">
            {['Setup em 2 minutos', 'Cancele quando quiser', 'Dados da Tabela TACO'].map((t, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Check className="w-3 h-3 text-primary" /> {t}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Social proof strip */}
      <div className="border-y border-border/60 bg-card/50 backdrop-blur-sm py-5 px-4">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-8 flex-wrap">
          {[
            { num: '500+', label: 'Profissionais' },
            { num: '50k+', label: 'Substituições/mês' },
            { num: '4.9', label: 'Avaliação', icon: true },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="text-lg md:text-xl font-bold text-foreground">{s.num}</span>
                {s.icon && <Star className="w-3.5 h-3.5 text-warning fill-warning" />}
              </div>
              <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Como Funciona */}
      {/* Pain point section */}
      <section className="py-16 md:py-24 px-4 bg-destructive/[0.03]">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="text-center mb-10 space-y-3">
            <motion.span variants={fadeUp} custom={0} className="text-xs font-semibold tracking-widest uppercase text-destructive/70">Isso te parece familiar?</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-2xl md:text-4xl font-display font-bold text-foreground">
              Seu WhatsApp agora:
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} className="max-w-md mx-auto space-y-3 mb-10">
            {[
              { msg: 'Dra., não achei frango. Posso trocar por quê? 🤔', time: '14:32' },
              { msg: 'E 100g de frango é quanto de patinho?', time: '14:33' },
              { msg: 'Ah e o arroz? Posso usar quinoa?', time: '14:33' },
              { msg: 'E a batata doce acabou tb kkkk', time: '14:34' },
            ].map((bubble, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="flex justify-start">
                <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%] shadow-sm">
                  <p className="text-sm text-foreground">{bubble.msg}</p>
                  <p className="text-[10px] text-muted-foreground text-right mt-1">{bubble.time}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center space-y-4">
            <motion.p variants={fadeUp} custom={0} className="text-base md:text-lg text-muted-foreground">
              Multiplique isso por <strong className="text-foreground">20, 50, 100 pacientes.</strong>
              <br />
              Quanto do seu dia vai embora respondendo substituição?
            </motion.p>
            <motion.div variants={fadeUp} custom={1}>
              <Link to="/register">
                <Button variant="premium" size="xl" className="group">
                  Resolver isso agora
                  <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-20 md:py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="text-center mb-14 space-y-3">
            <motion.span variants={fadeUp} custom={0} className="text-xs font-semibold tracking-widest uppercase text-primary">Como funciona</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-2xl md:text-4xl font-display font-bold text-foreground">
              3 passos e nunca mais responda substituição
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} className="grid md:grid-cols-3 gap-5">
            {[
              { step: '01', title: 'Crie sua página', desc: 'Cadastre-se em 2 minutos. Personalize com sua marca, logo e cores. Sua página já fica online.', icon: UserPlus },
              { step: '02', title: 'Compartilhe o link', desc: 'Envie para seus pacientes via WhatsApp, Instagram ou QR Code. "Qualquer dúvida de troca, acessa aqui."', icon: Share2 },
              { step: '03', title: 'Paciente se vira sozinho 😎', desc: '"Não tem frango?" O paciente abre o link, digita frango e descobre que pode usar patinho, em segundos.', icon: Search },
            ].map((s, i) => (
              <motion.div key={i} variants={scaleIn} custom={i}>
                <Card className="rounded-3xl glass-card hover:glow-shadow transition-all duration-500 group h-full">
                  <CardContent className="p-6 md:p-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-primary/10 group-hover:bg-primary/15 transition-colors">
                      <s.icon className="w-7 h-7 text-primary" />
                    </div>
                    <span className="text-gradient text-xs font-bold tracking-widest uppercase">{s.step}</span>
                    <h3 className="text-lg font-bold text-foreground">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      {/* Features */}
      <section className="py-20 md:py-28 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/30 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="text-center mb-14 space-y-3">
            <motion.span variants={fadeUp} custom={0} className="text-xs font-semibold tracking-widest uppercase text-primary">Por que funciona</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-2xl md:text-4xl font-display font-bold text-foreground">
              Seu tempo de volta. Seu paciente autônomo.
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-sm text-muted-foreground max-w-md mx-auto">
              Em vez de responder "100g de frango = Xg de patinho" no WhatsApp, seu paciente descobre sozinho — com dados confiáveis da TACO.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: '⏱️', title: 'Recupere 1h+ por dia', desc: 'Chega de pausar consulta para responder "posso trocar frango por quê?" no WhatsApp. O app responde por você.' },
              { icon: '🧬', title: 'Base TACO completa', desc: '463+ alimentos com dados da Tabela TACO 4ª edição. Equivalência nutricional precisa e confiável.' },
              { icon: '🎨', title: 'Sua marca, sua identidade', desc: 'Seu logo, suas cores, seu link. O paciente vê a SUA página, não um app genérico.' },
              { icon: '📱', title: 'Funciona na feira e no mercado', desc: 'O paciente está no mercado sem frango? Abre o link no celular e descobre a troca na hora.' },
              { icon: '⚡', title: 'Zero fricção pro paciente', desc: 'Sem criar conta, sem instalar app. Abriu o link, digitou o alimento, pronto.' },
              { icon: '📊', title: 'Saiba o que perguntam', desc: 'Veja quais alimentos seus pacientes mais buscam. Dados que guiam seu atendimento.' },
            ].map((feat, i) => (
              <motion.div key={i} variants={scaleIn} custom={i}>
                <Card className="rounded-2xl glass-card hover:premium-shadow transition-all duration-300 group h-full">
                  <CardContent className="p-5 flex items-start gap-4">
                    <span className="text-2xl mt-0.5 group-hover:scale-110 transition-transform duration-300">{feat.icon}</span>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground mb-1">{feat.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials — rotating */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="text-center mb-14 space-y-3">
            <motion.span variants={fadeUp} custom={0} className="text-xs font-semibold tracking-widest uppercase text-primary">Depoimentos</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-2xl md:text-4xl font-display font-bold text-foreground">
              Quem usa, recomenda
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-sm text-muted-foreground">
              Junte-se a centenas de profissionais que já transformaram o atendimento
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5 min-h-[280px]">
            <AnimatePresence mode="popLayout">
              {testimonials.map((t) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, ease }}
                >
                  <Card className="rounded-2xl glass-card h-full">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: t.color }}>
                          {t.initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.specialty}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className="w-3.5 h-3.5 text-warning fill-warning" />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.quote}"</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Pricing — Two plans */}
      <section id="planos" className="py-20 md:py-28 px-4 gradient-dark relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-15 blur-3xl gradient-hero pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full opacity-10 blur-3xl gradient-gold pointer-events-none" />

        <div className="relative max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="text-center mb-12 space-y-3">
            <motion.span variants={fadeUp} custom={0} className="text-xs font-semibold tracking-widest uppercase text-primary-foreground/50">Investimento</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-2xl md:text-4xl font-display font-bold text-primary-foreground">
              Escolha o plano ideal para você
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-sm text-primary-foreground/40 max-w-md mx-auto">
              Teste grátis por 3 dias. Sem compromisso — cancele quando quiser.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* Mensal */}
            <motion.div variants={scaleIn} custom={0} className="pt-5">
              <div className="rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/10 relative h-full flex flex-col overflow-hidden">
                <div className="p-8 flex flex-col flex-1">
                  <div className="text-center space-y-2 mb-6">
                    <p className="text-xs font-semibold tracking-widest uppercase text-primary-foreground/40">Mensal</p>
                    <div>
                      <span className="text-4xl font-display font-bold text-primary-foreground">R$ 47<span className="text-2xl">,90</span></span>
                      <span className="text-sm text-primary-foreground/40 font-medium">/mês</span>
                    </div>
                    <p className="text-xs text-primary-foreground/30">Cobrado mensalmente. Cancele quando quiser.</p>
                  </div>

                  <div className="space-y-3 flex-1">
                    {[
                      'Substituições ilimitadas',
                      'Base TACO completa (463+ alimentos)',
                      'Página personalizada com sua marca',
                      'Analytics em tempo real',
                      'Suporte prioritário',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm text-primary-foreground/70">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        {item}
                      </div>
                    ))}
                  </div>

                  <Link to="/register" className="block mt-6">
                    <Button size="xl" className="w-full bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground/15 rounded-xl">
                      Começar teste grátis
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Anual — destaque */}
            <motion.div variants={scaleIn} custom={1} className="relative pt-5">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
                <span className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full gradient-gold text-primary-foreground text-xs font-bold shadow-lg tracking-wide whitespace-nowrap">
                  <Crown className="w-3.5 h-3.5" /> MAIS POPULAR
                </span>
              </div>
              <div className="rounded-3xl bg-white/[0.08] backdrop-blur-xl border-2 border-primary/40 shimmer relative h-full flex flex-col shadow-[0_0_60px_-10px_hsl(170_60%_30%/0.25)] overflow-hidden">
                <div className="p-8 flex flex-col flex-1 pt-10">
                  <div className="text-center space-y-2 mb-6">
                    <p className="text-xs font-semibold tracking-widest uppercase text-primary/80">Anual</p>
                    <div>
                      <span className="text-4xl font-display font-bold text-primary-foreground">R$ 29<span className="text-2xl">,90</span></span>
                      <span className="text-sm text-primary-foreground/40 font-medium">/mês</span>
                    </div>
                    <p className="text-xs text-primary/70 font-medium">
                      12× de R$ 29,90 = R$ 358,80/ano
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 mt-1">
                      <Sparkles className="w-3 h-3 text-primary" />
                      <span className="text-xs font-bold text-primary">Menos de R$ 1 por dia</span>
                    </div>
                  </div>

                  <div className="space-y-3 flex-1">
                    {[
                      'Tudo do plano Mensal',
                      'Economia de R$ ' + savingsPerYear + '/ano',
                      'Base TACO completa (463+ alimentos)',
                      'Cores e identidade visual',
                      'Links WhatsApp e Instagram',
                      'Resumo semanal por e-mail',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm text-primary-foreground/80">
                        <div className="w-5 h-5 rounded-full bg-primary/25 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        {item}
                      </div>
                    ))}
                  </div>

                  <Link to="/register" className="block mt-6">
                    <Button variant="premium" size="xl" className="w-full group">
                      Começar teste grátis
                      <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <p className="text-[10px] text-primary-foreground/25 text-center mt-3">3 dias grátis • Cancele a qualquer momento</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 md:py-28 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="text-center mb-12 space-y-3">
            <motion.span variants={fadeUp} custom={0} className="text-xs font-semibold tracking-widest uppercase text-primary">FAQ</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-2xl md:text-4xl font-display font-bold text-foreground">
              Perguntas frequentes
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}>
            <Accordion type="single" collapsible className="space-y-3">
              {[
                { q: 'Posso testar antes de pagar?', a: 'Sim! Você tem 3 dias grátis para explorar todos os recursos do Altfood Pro. Sem compromisso — se não gostar, basta não continuar.' },
                { q: 'Precisa instalar alguma coisa?', a: 'Não! O Altfood funciona 100% no navegador, sem necessidade de instalar nenhum app. Seus pacientes acessam pelo link, e você gerencia tudo pelo dashboard online.' },
                { q: 'Como compartilho com pacientes?', a: 'Você recebe um link exclusivo (ex: altfood.app/p/dra-maria). Basta enviar via WhatsApp, colocar na bio do Instagram, ou gerar um QR Code. Seus pacientes acessam sem precisar criar conta.' },
                { q: 'Os dados são da TACO?', a: 'Sim! Utilizamos a Tabela TACO (Tabela Brasileira de Composição de Alimentos), 4ª edição, desenvolvida pela NEPA/UNICAMP — a referência nacional em dados nutricionais com 463+ alimentos catalogados.' },
                { q: 'Posso cancelar a qualquer momento?', a: 'Sim, sem multas ou burocracia. Você pode cancelar pelo dashboard e continua tendo acesso até o final do período pago.' },
                { q: 'Funciona no celular?', a: 'Sim! O Altfood foi projetado mobile-first. A página de paciente funciona perfeitamente em qualquer celular, com interface otimizada e até modo offline.' },
                { q: 'Qual a diferença entre mensal e anual?', a: `No plano mensal você paga R$ 47,90/mês. No anual, o valor cai para R$ 29,90/mês (12× = R$ 358,80/ano) — menos de R$ 1 por dia. Você economiza R$ ${savingsPerYear} por ano.` },
              ].map((faq, i) => (
                <motion.div key={i} variants={fadeUp} custom={i}>
                  <AccordionItem value={`faq-${i}`} className="glass-card rounded-2xl px-5 border-0">
                    <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline py-5">{faq.q}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">{faq.a}</AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      {/* CTA */}
      <section className="py-16 md:py-20 px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-2xl mx-auto text-center">
          <motion.div variants={scaleIn} custom={0}>
            <Card className="rounded-3xl glass-card premium-border overflow-hidden relative">
              <div className="absolute inset-0 gradient-glow pointer-events-none" />
              <CardContent className="relative p-8 md:p-12 space-y-5">
                <span className="text-3xl">📱</span>
                <h2 className="text-xl md:text-3xl font-display font-bold text-foreground">
                  Quanto tempo você perdeu hoje respondendo substituição?
                </h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Pare de calcular "100g de frango = Xg de patinho" no WhatsApp. Deixa o Altfood fazer isso por você. Teste grátis por 3 dias.
                </p>
                <Link to="/register">
                  <Button variant="premium" size="xl" className="group">
                    Quero meu tempo de volta
                    <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <AltfoodIcon size="xs" />
              <span className="font-logo font-bold text-foreground tracking-tight">Altfood</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="#planos" className="text-muted-foreground hover:text-foreground transition-colors">Planos</a>
              <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
              <Link to="/dashboard/support" className="text-muted-foreground hover:text-foreground transition-colors">Contato</Link>
            </div>
          </div>
          <div className="h-px bg-border/50 my-6" />
          <p className="text-[10px] text-muted-foreground/60 text-center">© 2025 Altfood. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
