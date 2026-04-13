import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useDoctor } from '@/hooks/useDoctor';
import { Check, Crown, X } from 'lucide-react';
import AltfoodIcon from '@/components/AltfoodIcon';
import { motion } from 'framer-motion';
import { formatProMonthlyWithPeriod, formatRefundGuaranteeShort, PRO_MONTHLY_PRICE_BRL } from '@/lib/subscriptionPricing';
import { hasPaidAppAccess } from '@/lib/subscriptionAccess';
import { CHECKOUT_MONTHLY_PATH } from '@/lib/checkoutIntent';

const FREE_FEATURES = [
  { text: 'Página pública com marca Altfood', included: true },
  { text: 'Até 50 buscas de pacientes/mês', included: true },
  { text: 'Slug personalizado básico', included: true },
  { text: 'Base TACO completa', included: true },
  { text: 'Logo e bio personalizados', included: false },
  { text: 'Cores e identidade visual', included: false },
  { text: 'Substituições ilimitadas', included: false },
  { text: 'Analytics em tempo real', included: false },
  { text: 'Suporte prioritário', included: false },
];

const PRO_FEATURES = [
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
];

export default function Pricing() {
  const { user } = useAuth();
  const { data: doctor } = useDoctor();
  const navigate = useNavigate();

  const handleSubscribe = () => {
    navigate(CHECKOUT_MONTHLY_PATH);
  };

  const hasProAccess = hasPaidAppAccess(doctor ?? null);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <AltfoodIcon size="sm" />
            <span className="font-logo font-bold text-lg text-foreground">Altfood</span>
          </Link>
          {user ? (
            <Link to="/dashboard">
              <Button variant="outline" className="rounded-xl text-sm">Dashboard</Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="outline" className="rounded-xl text-sm">Entrar</Button>
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Pare de responder substituições no WhatsApp</h1>
          <p className="text-muted-foreground mt-3 text-base">
            Acesso ao painel após o pagamento. {formatRefundGuaranteeShort()}.
          </p>
          <p className="text-sm text-primary font-medium mt-4">{formatProMonthlyWithPeriod()} — Altfood PRO (mensal)</p>
          <p className="text-xs text-muted-foreground mt-2">Condição de lançamento por tempo limitado.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="rounded-2xl shadow-sm border border-border relative overflow-hidden h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="rounded-lg text-xs">Gratuito</Badge>
                </div>
                <div className="mb-6 text-center">
                  <span className="text-4xl font-bold text-foreground">R$ 0</span>
                  <span className="text-muted-foreground">/mês</span>
                  <p className="text-xs text-muted-foreground mt-1">Para sempre. Sem cartão de crédito.</p>
                </div>
                <ul className="space-y-3 flex-1">
                  {FREE_FEATURES.map(f => (
                    <li key={f.text} className="flex items-start gap-2 text-sm">
                      {f.included ? (
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                      )}
                      <span className={f.included ? 'text-foreground' : 'text-muted-foreground/60 line-through'}>{f.text}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button variant="outline" className="w-full rounded-xl h-12 text-sm font-semibold mt-6">
                    Começar grátis
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="rounded-2xl shadow-lg border-2 border-primary/30 relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-primary text-primary-foreground rounded-lg text-xs">Altfood PRO</Badge>
                  <Badge className="bg-primary/10 text-primary border-primary/20 rounded-lg text-[10px]">Mais popular</Badge>
                </div>
                <div className="mb-6 text-center">
                  {(() => {
                    const [reais, centavos] = PRO_MONTHLY_PRICE_BRL.toFixed(2).split('.');
                    return (
                      <span className="text-4xl font-bold text-foreground">
                        R$ {reais}
                        <span className="text-2xl">,{centavos}</span>
                      </span>
                    );
                  })()}
                  <span className="text-muted-foreground">/mês</span>
                  <p className="text-xs text-muted-foreground mt-1">Cobrado todo mês. Cancele quando quiser.</p>
                </div>
                <ul className="space-y-3 flex-1">
                  {PRO_FEATURES.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                {hasProAccess ? (
                  <Button disabled className="w-full rounded-xl h-12 text-sm font-semibold mt-6 bg-primary/20 text-primary">
                    <Crown className="w-4 h-4 mr-2" />{' '}
                    {doctor?.subscription_status === 'cancelled'
                      ? 'PRO ativo até o fim do período'
                      : 'Você já é PRO'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubscribe}
                    className="w-full rounded-xl h-12 text-sm font-semibold mt-6 bg-primary hover:bg-primary/90"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Assinar Altfood PRO
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
