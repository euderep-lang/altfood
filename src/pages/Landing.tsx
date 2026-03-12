import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Leaf, ArrowRight, Search, Share2, BarChart3, Check, Zap, Shield, Users } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">Altfood</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="rounded-xl">Entrar</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="rounded-xl">Começar grátis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Zap className="w-3.5 h-3.5" /> 14 dias grátis
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight">
            Seus pacientes perguntam.
            <br />
            <span className="text-primary">O Altfood responde.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            A ferramenta de substituição alimentar que seus pacientes acessam pelo celular, com a sua marca. Baseada na Tabela TACO.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register">
              <Button size="lg" className="rounded-xl h-12 px-8 text-base w-full sm:w-auto">
                Começar Trial de 14 dias grátis <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">Como funciona</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Users, title: 'Cadastre-se', desc: 'Crie sua conta e personalize com sua marca e cores.' },
              { icon: Share2, title: 'Compartilhe', desc: 'Envie seu link exclusivo para seus pacientes via WhatsApp.' },
              { icon: Search, title: 'Substitua', desc: 'Pacientes buscam alimentos e encontram equivalentes nutricionais.' },
            ].map((step, i) => (
              <Card key={i} className="rounded-2xl shadow-sm text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-sm font-bold text-primary mb-1">Passo {i + 1}</div>
                  <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">Recursos</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: '🥗', title: 'Base TACO completa', desc: 'Dados nutricionais da Tabela TACO 4ª edição.' },
              { icon: '🎨', title: 'Marca própria', desc: 'Logo, cores e link personalizado com seu nome.' },
              { icon: '📊', title: 'Analytics', desc: 'Saiba quantos pacientes acessam e o que buscam.' },
              { icon: '📱', title: 'Mobile-first', desc: 'Funciona perfeitamente no celular dos seus pacientes.' },
              { icon: '🔗', title: 'Link exclusivo', desc: 'Compartilhe via WhatsApp, Instagram ou QR Code.' },
              { icon: '⚡', title: 'Sem login pra paciente', desc: 'Pacientes acessam direto, sem cadastro.' },
            ].map((feat, i) => (
              <Card key={i} className="rounded-2xl shadow-sm">
                <CardContent className="p-4 flex items-start gap-3">
                  <span className="text-2xl">{feat.icon}</span>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{feat.title}</h3>
                    <p className="text-xs text-muted-foreground">{feat.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4 bg-card border-y border-border">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">Investimento</h2>
          <Card className="rounded-2xl shadow-md border-primary/20">
            <CardContent className="p-6 text-center space-y-4">
              <div className="text-4xl font-extrabold text-foreground">
                R$ 97<span className="text-lg font-normal text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground">Comece com 14 dias grátis</p>
              <ul className="text-sm text-left space-y-2">
                {[
                  'Página personalizada com sua marca',
                  'Link exclusivo para pacientes',
                  'Base TACO completa',
                  'Analytics de acessos e buscas',
                  'QR Code para compartilhar',
                  'Suporte por e-mail',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button className="w-full rounded-xl h-11 mt-2">Começar trial grátis</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">Perguntas frequentes</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {[
              { q: 'O paciente precisa criar conta?', a: 'Não! Seus pacientes acessam diretamente pelo link, sem necessidade de cadastro ou login.' },
              { q: 'Qual base de dados é utilizada?', a: 'Utilizamos a Tabela TACO (Tabela Brasileira de Composição de Alimentos), 4ª edição, desenvolvida pela NEPA/UNICAMP.' },
              { q: 'Posso cancelar a qualquer momento?', a: 'Sim, você pode cancelar sua assinatura a qualquer momento, sem multas ou taxas adicionais.' },
              { q: 'Como funciona o trial?', a: 'Você tem 14 dias para testar todas as funcionalidades gratuitamente. Ao final, pode assinar para continuar.' },
              { q: 'Posso personalizar com minha marca?', a: 'Sim! Você pode adicionar seu logo, escolher suas cores e ter um link exclusivo com seu nome.' },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-xl px-4">
                <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-8">
        <div className="max-w-5xl mx-auto text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Altfood</span>
          </div>
          <p className="text-xs text-muted-foreground">Ferramenta de substituição alimentar para profissionais de saúde</p>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Altfood. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
