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
    quote: 'O Altfood me poupa pelo menos 1h por dia respondendo dúvidas de pacientes sobre substituições. Agora eles consultam direto pelo celular!',
  },
  {
    name: 'Dr. Ricardo Mendes',
    specialty: 'Endocrinologista',
    initials: 'RM',
    color: '#2563EB',
    quote: 'Meus pacientes adoram. É prático, confiável e com a minha marca. Recomendo para todos os colegas da área.',
  },
  {
    name: 'Dra. Fernanda Lima',
    specialty: 'Clínica Geral',
    initials: 'FL',
    color: '#7C3AED',
    quote: 'Uso com pacientes que precisam de reeducação alimentar. A base da TACO dá credibilidade e o layout é lindo no celular.',
  },
  {
    name: 'Dra. Juliana Rocha',
    specialty: 'Nutricionista Esportiva',
    initials: 'JR',
    color: '#DC2626',
    quote: 'Meus atletas usam o Altfood diariamente para ajustar refeições fora de casa. Virou ferramenta essencial no meu consultório.',
  },
  {
    name: 'Dr. André Tavares',
    specialty: 'Nutrólogo',
    initials: 'AT',
    color: '#0284C7',
    quote: 'A facilidade de uso é absurda. Em 2 minutos configurei minha página e já enviei para mais de 50 pacientes.',
  },
  {
    name: 'Dra. Patrícia Almeida',
    specialty: 'Nutricionista Materno-Infantil',
    initials: 'PA',
    color: '#D97706',
    quote: 'As mães dos meus pacientes adoram! Conseguem fazer substituições rápidas no supermercado, sem me ligar toda hora.',
  },
  {
    name: 'Dra. Marina Costa',
    specialty: 'Nutricionista Funcional',
    initials: 'MC',
    color: '#059669',
    quote: 'Simplesmente o melhor investimento que fiz para o meu consultório. Os pacientes se sentem mais autônomos e engajados.',
  },
  {
    name: 'Dr. Felipe Barros',
    specialty: 'Gastroenterologista',
    initials: 'FB',
    color: '#4F46E5',
    quote: 'Indico para todos os pacientes com restrições alimentares. A interface é tão simples que até meus pacientes idosos conseguem usar.',
  },
  {
    name: 'Dra. Beatriz Nunes',
    specialty: 'Nutricionista Oncológica',
    initials: 'BN',
    color: '#BE185D',
    quote: 'Ferramenta indispensável. Meus pacientes em tratamento conseguem encontrar alternativas de forma rápida e segura.',
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
  const [billingAnnual, setBillingAnnual] = useState(true);
  const testimonials = useRotatingTestimonials(3, 6000);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const monthlyPrice = 27.9;
  const annualPricePerMonth = 24.9;
  const annualTotal = (annualPricePerMonth * 12);
  const savingsPerYear = ((monthlyPrice - annualPricePerMonth) * 12).toFixed(0);

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

      {/* Pricing — single Pro plan */}
      <section id="planos" className="py-20 md:py-28 px-4 gradient-dark relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-20 blur-3xl gradient-hero pointer-events-none" />

        <div className="relative max-w-xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="text-center mb-10 space-y-3">
            <motion.span variants={fadeUp} custom={0} className="text-xs font-semibold tracking-widest uppercase text-primary-foreground/60">Investimento</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-2xl md:text-4xl font-display font-bold text-primary-foreground">
              Um único plano. Tudo incluso.
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-sm text-primary-foreground/50 max-w-md mx-auto">
              Teste grátis por 3 dias. Depois escolha como quer pagar.
            </motion.p>
            {/* Billing toggle */}
            <motion.div variants={fadeUp} custom={3} className="flex items-center justify-center gap-3 pt-4">
              <span className={`text-sm font-medium ${!billingAnnual ? 'text-primary-foreground' : 'text-primary-foreground/40'}`}>Mensal</span>
              <button
                onClick={() => setBillingAnnual(!billingAnnual)}
                className={`relative w-12 h-6 rounded-full transition-colors ${billingAnnual ? 'bg-primary' : 'bg-primary-foreground/20'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${billingAnnual ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
              <span className={`text-sm font-medium ${billingAnnual ? 'text-primary-foreground' : 'text-primary-foreground/40'}`}>
                Anual <span className="text-xs text-primary font-bold">Economize R${savingsPerYear}</span>
              </span>
            </motion.div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.div variants={scaleIn} custom={0}>
              <Card className="rounded-3xl bg-primary-foreground/[0.06] backdrop-blur-xl border border-primary-foreground/10 shimmer overflow-visible relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold shadow-lg">
                    <Crown className="w-3 h-3" /> Altfood Pro
                  </span>
                </div>
                <CardContent className="p-7 space-y-6 pt-8">
                  <div className="text-center">
                    <div className="mb-2">
                      <span className="text-5xl font-display font-bold text-primary-foreground">
                        R$ {billingAnnual ? annualPricePerMonth.toFixed(2).replace('.', ',') : monthlyPrice.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-sm text-primary-foreground/40 font-medium">/mês</span>
                    </div>
                    {billingAnnual && (
                      <p className="text-xs text-primary/80">
                        R$ {annualTotal.toFixed(2).replace('.', ',')} cobrados anualmente (12 meses)
                      </p>
                    )}
                    {!billingAnnual && (
                      <p className="text-xs text-primary-foreground/40">
                        Cobrado mensalmente. Cancele quando quiser.
                      </p>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
                    {[
                      'Substituições ilimitadas',
                      'Base TACO completa (463+ alimentos)',
                      'Página personalizada com sua marca',
                      'Analytics em tempo real',
                      'Logo e bio personalizados',
                      'Cores e identidade visual',
                      'Links WhatsApp e Instagram',
                      'Relatório CSV exportável',
                      'Resumo semanal por e-mail',
                      'Suporte prioritário',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm text-primary-foreground/80">
                        <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-secondary" />
                        </div>
                        {item}
                      </div>
                    ))}
                  </div>

                  <Link to="/register" className="block pt-2">
                    <Button variant="premium" size="xl" className="w-full group">
                      Testar 3 dias grátis
                      <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <p className="text-[10px] text-primary-foreground/30 text-center">3 dias grátis para testar como quiser • Cancele a qualquer momento</p>
                </CardContent>
              </Card>
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
                { q: 'Qual a diferença entre mensal e anual?', a: `No plano mensal você paga R$ ${monthlyPrice.toFixed(2).replace('.', ',')}/mês. No anual, o valor cai para R$ ${annualPricePerMonth.toFixed(2).replace('.', ',')}/mês (pacote de 12 meses), economizando R$ ${savingsPerYear} por ano.` },
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
      <section className="py-16 md:py-20 px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-2xl mx-auto text-center">
          <motion.div variants={scaleIn} custom={0}>
            <Card className="rounded-3xl glass-card premium-border overflow-hidden relative">
              <div className="absolute inset-0 gradient-glow pointer-events-none" />
              <CardContent className="relative p-8 md:p-12 space-y-5">
                <span className="text-3xl">🥗</span>
                <h2 className="text-xl md:text-3xl font-display font-bold text-foreground">
                  Seus pacientes merecem o melhor
                </h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Junte-se a centenas de profissionais que já usam o app de substituição alimentar mais completo do Brasil. Teste grátis por 3 dias.
                </p>
                <Link to="/register">
                  <Button variant="premium" size="xl" className="group">
                    Começar Agora
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
