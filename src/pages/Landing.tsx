import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Leaf, ArrowRight, Check, Sparkles, Star, UserPlus, Share2, Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';

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

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [billingAnnual, setBillingAnnual] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const proMonthly = 29;
  const proAnnual = Math.round(proMonthly * 12 * 0.8 / 12); // 20% off

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Nav */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-card shadow-md border-b border-border' : 'glass-nav'}`}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center shadow-md group-hover:glow-shadow transition-shadow duration-300">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">Altfood</span>
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
              <Button size="sm" className="gradient-hero shadow-md">Começar grátis</Button>
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
            <span className="text-xs font-semibold tracking-wide text-primary uppercase">14 dias grátis • Sem cartão</span>
          </motion.div>

          <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-6xl font-display font-bold text-foreground leading-[1.1] tracking-tight">
            Seus pacientes perguntam.
            <br />
            <span className="text-gradient">O Altfood responde.</span>
          </motion.h1>

          <motion.p variants={fadeUp} custom={2} className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            A ferramenta de substituição alimentar que seus pacientes acessam pelo celular, com a <strong className="text-foreground">sua marca</strong>. Baseada na Tabela TACO.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to="/register">
              <Button variant="premium" size="xl" className="w-full sm:w-auto group">
                Começar Trial Grátis
                <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} custom={4} className="flex items-center justify-center gap-6 pt-4 flex-wrap">
            {['Sem cartão de crédito', 'Cancele quando quiser', 'Setup em 2 min'].map((t, i) => (
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
      <section id="como-funciona" className="py-20 md:py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="text-center mb-14 space-y-3">
            <motion.span variants={fadeUp} custom={0} className="text-xs font-semibold tracking-widest uppercase text-primary">Como funciona</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-2xl md:text-4xl font-display font-bold text-foreground">
              Simples como deve ser
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} className="grid md:grid-cols-3 gap-5">
            {[
              { step: '01', title: 'Crie sua página grátis', desc: 'Cadastre-se em minutos. Personalize com sua marca, logo e cores. Sua página já fica online.', icon: UserPlus },
              { step: '02', title: 'Compartilhe o link', desc: 'Envie seu link exclusivo via WhatsApp, Instagram ou QR Code para seus pacientes.', icon: Share2 },
              { step: '03', title: 'Paciente busca na hora', desc: 'Pacientes encontram equivalentes nutricionais instantaneamente, sem criar conta.', icon: Search },
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
      <section className="py-20 md:py-28 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/30 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="text-center mb-14 space-y-3">
            <motion.span variants={fadeUp} custom={0} className="text-xs font-semibold tracking-widest uppercase text-primary">Recursos</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-2xl md:text-4xl font-display font-bold text-foreground">
              Tudo que você precisa
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: '🧬', title: 'Base TACO completa', desc: 'Dados nutricionais da Tabela TACO 4ª edição — referência nacional.' },
              { icon: '🎨', title: 'Marca própria', desc: 'Seu logo, suas cores, seu link personalizado. Identidade profissional.' },
              { icon: '📊', title: 'Analytics em tempo real', desc: 'Acompanhe acessos, alimentos mais buscados e engajamento.' },
              { icon: '📱', title: 'Mobile-first', desc: 'Interface otimizada para o celular dos seus pacientes.' },
              { icon: '⚡', title: 'Acesso instantâneo', desc: 'Pacientes usam sem criar conta. Zero fricção.' },
              { icon: '🔒', title: 'Dados seguros', desc: 'Infraestrutura profissional com criptografia e backups.' },
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

      {/* Testimonials */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="text-center mb-14 space-y-3">
            <motion.span variants={fadeUp} custom={0} className="text-xs font-semibold tracking-widest uppercase text-primary">Depoimentos</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-2xl md:text-4xl font-display font-bold text-foreground">
              Quem usa, recomenda
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} className="grid md:grid-cols-3 gap-5">
            {[
              {
                name: 'Dra. Camila Santos',
                specialty: 'Nutricionista',
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
            ].map((t, i) => (
              <motion.div key={i} variants={scaleIn} custom={i}>
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
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planos" className="py-20 md:py-28 px-4 gradient-dark relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-20 blur-3xl gradient-hero pointer-events-none" />

        <div className="relative max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="text-center mb-10 space-y-3">
            <motion.span variants={fadeUp} custom={0} className="text-xs font-semibold tracking-widest uppercase text-primary-foreground/60">Investimento</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-2xl md:text-4xl font-display font-bold text-primary-foreground">
              Escolha seu plano
            </motion.h2>
            {/* Billing toggle */}
            <motion.div variants={fadeUp} custom={2} className="flex items-center justify-center gap-3 pt-4">
              <span className={`text-sm font-medium ${!billingAnnual ? 'text-primary-foreground' : 'text-primary-foreground/40'}`}>Mensal</span>
              <button
                onClick={() => setBillingAnnual(!billingAnnual)}
                className={`relative w-12 h-6 rounded-full transition-colors ${billingAnnual ? 'bg-primary' : 'bg-primary-foreground/20'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${billingAnnual ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
              <span className={`text-sm font-medium ${billingAnnual ? 'text-primary-foreground' : 'text-primary-foreground/40'}`}>
                Anual <span className="text-xs text-primary font-bold">-20%</span>
              </span>
            </motion.div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-2 gap-5">
            {/* Free plan */}
            <motion.div variants={scaleIn} custom={0}>
              <Card className="rounded-3xl bg-primary-foreground/[0.04] backdrop-blur-xl border border-primary-foreground/10 h-full">
                <CardContent className="p-7 space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-primary-foreground">Grátis</h3>
                    <p className="text-xs text-primary-foreground/50 mt-1">Para começar sem compromisso</p>
                  </div>
                  <div>
                    <span className="text-4xl font-display font-bold text-primary-foreground">R$ 0</span>
                    <span className="text-sm text-primary-foreground/40 font-medium">/mês</span>
                  </div>
                  <ul className="text-sm space-y-2.5 py-2">
                    {[
                      'Página de paciente básica',
                      'Substituições ilimitadas',
                      'Base TACO completa',
                      'Link personalizado',
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-primary-foreground/70">
                        <Check className="w-4 h-4 text-primary shrink-0" /> {item}
                      </li>
                    ))}
                    {[
                      'Analytics e estatísticas',
                      'Logo e bio personalizados',
                      'Relatório CSV',
                      'Resumo semanal por e-mail',
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-primary-foreground/30 line-through">
                        <X className="w-4 h-4 text-primary-foreground/20 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register" className="block">
                    <Button variant="outline" className="w-full rounded-xl h-11 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                      Criar conta grátis
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pro plan */}
            <motion.div variants={scaleIn} custom={1}>
              <Card className="rounded-3xl bg-primary-foreground/[0.06] backdrop-blur-xl border border-primary-foreground/10 shimmer overflow-visible relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold shadow-lg">
                    <Sparkles className="w-3 h-3" /> Mais popular
                  </span>
                </div>
                <CardContent className="p-7 space-y-5 pt-8">
                  <div>
                    <h3 className="text-lg font-bold text-primary-foreground">Pro</h3>
                    <p className="text-xs text-primary-foreground/50 mt-1">Para profissionais que levam a sério</p>
                  </div>
                  <div>
                    <span className="text-4xl font-display font-bold text-primary-foreground">
                      R$ {billingAnnual ? proAnnual : proMonthly}
                    </span>
                    <span className="text-sm text-primary-foreground/40 font-medium">/mês</span>
                    {billingAnnual && (
                      <p className="text-xs text-primary/80 mt-1">R$ {proAnnual * 12}/ano (economia de R$ {proMonthly * 12 - proAnnual * 12})</p>
                    )}
                  </div>
                  <ul className="text-sm space-y-2.5 py-2">
                    {[
                      'Tudo do plano Grátis',
                      'Analytics em tempo real',
                      'Logo e bio personalizados',
                      'Cores e marca própria',
                      'Relatório CSV exportável',
                      'Resumo semanal por e-mail',
                      'Links WhatsApp e Instagram',
                      'Suporte prioritário',
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-primary-foreground/80">
                        <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-secondary" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register" className="block">
                    <Button variant="premium" size="xl" className="w-full group">
                      Começar Trial Grátis
                      <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <p className="text-[10px] text-primary-foreground/30 text-center">14 dias grátis • Cancele quando quiser</p>
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
                { q: 'É gratuito?', a: 'Sim! O plano Grátis permite criar sua página de paciente e usar substituições ilimitadas. Para recursos avançados como analytics, personalização completa e relatórios, temos o plano Pro por R$29/mês.' },
                { q: 'Precisa instalar alguma coisa?', a: 'Não! O Altfood funciona 100% no navegador, sem necessidade de instalar nenhum app. Seus pacientes acessam pelo link, e você gerencia tudo pelo dashboard online. Opcionalmente, pacientes podem adicionar à tela inicial como um app.' },
                { q: 'Como compartilho com pacientes?', a: 'Você recebe um link exclusivo (ex: altfood.app/p/dra-maria). Basta enviar via WhatsApp, colocar na bio do Instagram, ou gerar um QR Code. Seus pacientes acessam sem precisar criar conta.' },
                { q: 'Os dados são da TACO?', a: 'Sim! Utilizamos a Tabela TACO (Tabela Brasileira de Composição de Alimentos), 4ª edição, desenvolvida pela NEPA/UNICAMP — a referência nacional em dados nutricionais com 48 alimentos catalogados.' },
                { q: 'Posso cancelar a qualquer momento?', a: 'Sim, sem multas ou burocracia. Você pode cancelar pelo dashboard e continua tendo acesso até o final do período pago. Após o cancelamento, sua conta volta ao plano Grátis automaticamente.' },
                { q: 'Funciona no celular?', a: 'Sim! O Altfood foi projetado mobile-first. A página de paciente funciona perfeitamente em qualquer celular, com interface otimizada, favoritos salvos localmente e até modo offline.' },
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
                  Pronto para transformar o atendimento?
                </h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Junte-se a centenas de profissionais que já usam o Altfood para oferecer substituições alimentares inteligentes.
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
              <div className="w-7 h-7 rounded-lg gradient-hero flex items-center justify-center">
                <Leaf className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground tracking-tight">Altfood</span>
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
