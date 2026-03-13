import { Link } from 'react-router-dom';
import { useDoctor } from '@/hooks/useDoctor';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy, MessageCircle, Loader2, ExternalLink, Gift, Check } from 'lucide-react';
import AltfoodIcon from '@/components/AltfoodIcon';
import { motion } from 'framer-motion';
import { useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

export default function ShareKit() {
  const { data: doctor, isLoading } = useDoctor();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (isLoading || !doctor) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const referralCode = (doctor as any).referral_code || '';
  const referralUrl = `${window.location.origin}/ref/${referralCode}`;
  const whatsappMsg = `Oi! Uso o Altfood para dar substituições alimentares aos meus pacientes pelo celular. Cria sua conta grátis aqui: ${referralUrl}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast({ title: '✅ Link copiado!' });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Kit de indicação</h1>
          <p className="text-sm text-muted-foreground mt-1">Compartilhe com colegas e ganhe 1 mês de Pro por indicação.</p>
        </motion.div>

        {/* What is Altfood */}
        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
          <Card className="rounded-2xl shadow-sm border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <AltfoodIcon size="md" />
                <h2 className="text-sm font-bold text-foreground">O que é o Altfood?</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                O Altfood é uma ferramenta online que permite a médicos e nutricionistas criar uma página personalizada 
                de substituição alimentar para seus pacientes. Baseada na Tabela TACO, ela funciona 100% pelo celular, 
                sem necessidade de instalar nenhum app.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Patient page mockup */}
        <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
          <Card className="rounded-2xl shadow-sm border-border/50 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-muted/30 p-6">
                <p className="text-xs font-medium text-muted-foreground mb-3 text-center">Preview da página do paciente</p>
                <div className="max-w-[280px] mx-auto bg-background border border-border rounded-2xl overflow-hidden shadow-lg">
                  {/* Mini mockup header */}
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                        {doctor.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{doctor.name}</p>
                        <p className="text-[10px] text-muted-foreground">{doctor.specialty}</p>
                      </div>
                    </div>
                  </div>
                  {/* Mini mockup body */}
                  <div className="p-4 space-y-3">
                    <div className="h-9 bg-muted rounded-xl flex items-center px-3">
                      <span className="text-[10px] text-muted-foreground">🔍 Buscar alimento...</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['🥩', '🍚', '🥗'].map(e => (
                        <div key={e} className="rounded-lg p-2 text-center bg-primary/5 border border-primary/10">
                          <span className="text-sm">{e}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-border p-2 text-center">
                    <p className="text-[8px] text-muted-foreground">Powered by <strong>Altfood</strong></p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Referral link */}
        <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
          <Card className="rounded-2xl shadow-sm border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Seu link de indicação</h2>
                  <p className="text-xs text-muted-foreground">Quem se cadastrar por aqui ganha 30 dias de trial</p>
                </div>
              </div>

              <button
                onClick={copyLink}
                className="w-full flex items-center gap-2 bg-background/80 hover:bg-background p-3.5 rounded-xl transition-colors group border border-border/50"
              >
                <code className="text-sm flex-1 truncate text-left font-medium text-foreground">{referralUrl}</code>
                {copied ? (
                  <Check className="w-4 h-4 text-primary shrink-0" />
                ) : (
                  <Copy className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                )}
              </button>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={copyLink} variant="outline" className="rounded-xl gap-2 flex-1">
                  <Copy className="w-4 h-4" /> Copiar link
                </Button>
                <Button onClick={shareWhatsApp} className="rounded-xl gap-2 flex-1 bg-[#25D366] hover:bg-[#25D366]/90 text-white">
                  <MessageCircle className="w-4 h-4" /> Enviar por WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pre-written message */}
        <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}>
          <Card className="rounded-2xl shadow-sm border-border/50">
            <CardContent className="p-6 space-y-3">
              <h2 className="text-sm font-bold text-foreground">Mensagem pronta para enviar</h2>
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-sm text-foreground leading-relaxed italic">
                  "{whatsappMsg}"
                </p>
              </div>
              <Button
                variant="outline"
                className="rounded-xl gap-2"
                onClick={() => {
                  navigator.clipboard.writeText(whatsappMsg);
                  toast({ title: '✅ Mensagem copiada!' });
                }}
              >
                <Copy className="w-4 h-4" /> Copiar mensagem
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* How it works */}
        <motion.div initial="hidden" animate="visible" custom={5} variants={fadeUp}>
          <Card className="rounded-2xl shadow-sm border-border/50">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-sm font-bold text-foreground">Como funciona o programa</h2>
              <div className="space-y-3">
                {[
                  { step: '1', text: 'Compartilhe seu link de indicação com colegas médicos ou nutricionistas.' },
                  { step: '2', text: 'Quando eles se cadastrarem pelo seu link, ganham 30 dias de trial (ao invés de 14).' },
                  { step: '3', text: 'Você ganha 1 mês de Pro grátis por cada indicação completada.' },
                ].map(s => (
                  <div key={s.step} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">{s.step}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed pt-0.5">{s.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
