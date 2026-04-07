import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useDoctor } from '@/hooks/useDoctor';
import { supabase } from '@/integrations/supabase/client';
import { Check, Loader2, Crown } from 'lucide-react';
import AltfoodIcon from '@/components/AltfoodIcon';
import { motion } from 'framer-motion';

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
  const [annual, setAnnual] = useState(true);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { data: doctor } = useDoctor();
  const { toast } = useToast();
  const navigate = useNavigate();

  const monthlyPrice = 47.90;
  const annualPricePerMonth = 29.90;
  const annualTotal = 358.80;
  const savingsPerYear = ((monthlyPrice * 12) - annualTotal).toFixed(0);

  const price = annual ? annualPricePerMonth : monthlyPrice;
  const period = annual ? '/mês' : '/mês';

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/register');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: annual ? 'annual' : 'monthly' },
      });
      if (error) throw error;
      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      toast({ title: 'Erro ao iniciar pagamento', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const isPro = doctor?.subscription_status === 'active';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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

      <main className="max-w-xl mx-auto px-4 py-12 md:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Pare de responder substituições no WhatsApp</h1>
          <p className="text-muted-foreground mt-3 text-base">Seus pacientes se viram sozinhos. Teste grátis por 14 dias.</p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={`text-sm font-medium ${!annual ? 'text-foreground' : 'text-muted-foreground'}`}>Mensal</span>
            <button
              onClick={() => setAnnual(!annual)}
              className="relative w-14 h-7 rounded-full transition-colors"
              style={{ backgroundColor: annual ? 'hsl(var(--primary))' : 'hsl(var(--muted))' }}
            >
              <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${annual ? 'translate-x-7' : 'translate-x-0.5'}`} />
            </button>
            <span className={`text-sm font-medium ${annual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Anual <Badge className="ml-1 bg-primary/10 text-primary border-primary/20 text-[10px]">Economize R${savingsPerYear}</Badge>
            </span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="rounded-2xl shadow-lg border-2 border-primary/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
            <CardContent className="p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-primary text-primary-foreground rounded-lg text-xs">Pro</Badge>
                <Badge className="bg-primary/10 text-primary border-primary/20 rounded-lg text-[10px]">Tudo incluso</Badge>
              </div>
              <div className="mb-6 text-center">
                <span className="text-4xl font-bold text-foreground">R$ {price.toFixed(2).replace('.', ',')}</span>
                <span className="text-muted-foreground">{period}</span>
                {annual && <p className="text-xs text-primary font-medium mt-1">R$ {annualTotal.toFixed(2).replace('.', ',')} cobrados anualmente (12 meses)</p>}
                {!annual && <p className="text-xs text-muted-foreground mt-1">Cobrado mensalmente. Cancele quando quiser.</p>}
              </div>
              <ul className="space-y-3 flex-1">
                {PRO_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              {isPro ? (
                <Button disabled className="w-full rounded-xl h-12 text-sm font-semibold mt-6 bg-primary/20 text-primary">
                  <Crown className="w-4 h-4 mr-2" /> Você já é Pro
                </Button>
              ) : (
                <Button
                  onClick={handleSubscribe}
                  className="w-full rounded-xl h-12 text-sm font-semibold mt-6 bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Crown className="w-4 h-4 mr-2" />}
                  {user ? 'Assinar Pro' : 'Testar 14 dias grátis'}
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
