import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Leaf, ArrowRight, Check, Sparkles, Star } from 'lucide-react';

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
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Nav */}
      <nav className="glass-nav sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center shadow-md group-hover:glow-shadow transition-shadow duration-300">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">Altfood</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <Link to="/login">
              <Button variant="ghost-nav" size="sm">Entrar</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="gradient-hero shadow-md">Começar grátis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-20 md:py-32 px-4 hero-pattern overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 gradient-glow pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20 blur-3xl gradient-hero pointer-events-none" />

        <motion.div
          initial="hidden"
          animate="visible"
          className="relative max-w-3xl mx-auto text-center space-y-8"
        >
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

          <motion.div variants={fadeUp} custom={4} className="flex items-center justify-center gap-6 pt-4">
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

      {/* How it works */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="text-center mb-14 space-y-3">
            <motion.span variants={fadeUp} custom={0} className="text-xs font-semibold tracking-widest uppercase text-primary">Como funciona</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-2xl md:text-4xl font-display font-bold text-foreground">
              Simples como deve ser
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} className="grid md:grid-cols-3 gap-5">
            {[
              { step: '01', title: 'Cadastre-se', desc: 'Crie sua conta em minutos e personalize com sua marca, logo e cores.', emoji: '✨' },
              { step: '02', title: 'Compartilhe', desc: 'Envie seu link exclusivo para pacientes via WhatsApp ou QR Code.', emoji: '🔗' },
              { step: '03', title: 'Substitua', desc: 'Pacientes encontram equivalentes nutricionais instantaneamente.', emoji: '🥗' },
            ].map((s, i) => (
              <motion.div key={i} variants={scaleIn} custom={i}>
                <Card className="rounded-3xl glass-card hover:glow-shadow transition-all duration-500 group h-full">
                  <CardContent className="p-6 md:p-8 text-center space-y-4">
                    <div className="text-4xl group-hover:animate-float">{s.emoji}</div>
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

      {/* Pricing */}
      <section className="py-20 md:py-28 px-4 gradient-dark relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-20 blur-3xl gradient-hero pointer-events-none" />

        <div className="relative max-w-md mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="text-center mb-10 space-y-3">
            <motion.span variants={fadeUp} custom={0} className="text-xs font-semibold tracking-widest uppercase text-emerald-400">Investimento</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-2xl md:text-4xl font-display font-bold text-white">
              Um plano, tudo incluso
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.div variants={scaleIn} custom={0}>
              <Card className="rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/10 shimmer overflow-visible">
                <CardContent className="p-8 text-center space-y-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    <Sparkles className="w-3 h-3" /> Mais popular
                  </div>
                  <div>
                    <span className="text-5xl md:text-6xl font-display font-bold text-white">R$ 97</span>
                    <span className="text-base text-white/50 font-medium">/mês</span>
                  </div>
                  <p className="text-sm text-white/50">Comece com 14 dias grátis. Cancele quando quiser.</p>

                  <ul className="text-sm text-left space-y-3 py-2">
                    {[
                      'Página personalizada com sua marca',
                      'Link exclusivo para pacientes',
                      'Base TACO completa',
                      'Analytics de acessos e buscas',
                      'QR Code para compartilhar',
                      'Suporte prioritário por e-mail',
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-white/80">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-emerald-400" />
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
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28 px-4">
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
                { q: 'O paciente precisa criar conta?', a: 'Não! Seus pacientes acessam diretamente pelo link, sem necessidade de cadastro ou login. Zero fricção.' },
                { q: 'Qual base de dados é utilizada?', a: 'Utilizamos a Tabela TACO (Tabela Brasileira de Composição de Alimentos), 4ª edição, desenvolvida pela NEPA/UNICAMP — a referência nacional em dados nutricionais.' },
                { q: 'Posso cancelar a qualquer momento?', a: 'Sim, você pode cancelar sua assinatura a qualquer momento, sem multas ou taxas adicionais. Simples assim.' },
                { q: 'Como funciona o trial?', a: 'Você tem 14 dias para testar todas as funcionalidades gratuitamente, sem precisar informar cartão de crédito. Ao final, pode assinar para continuar.' },
                { q: 'Posso personalizar com minha marca?', a: 'Sim! Você pode adicionar seu logo, escolher suas cores e ter um link exclusivo com seu nome profissional.' },
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
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
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
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-7 h-7 rounded-lg gradient-hero flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground tracking-tight">Altfood</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Ferramenta de substituição alimentar para médicos e nutricionistas. Baseada na Tabela TACO.
          </p>
          <div className="h-px w-16 bg-border mx-auto" />
          <p className="text-[10px] text-muted-foreground/60">© {new Date().getFullYear()} Altfood. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
