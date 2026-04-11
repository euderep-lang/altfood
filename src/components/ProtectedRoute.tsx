import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDoctor } from '@/hooks/useDoctor';
import { Loader2, Crown, Check, Clock, LogOut, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

function isSubscriptionValid(doctor: any): boolean {
  if (!doctor) return false;
  if (doctor.subscription_status === 'active') return true;
  if (doctor.subscription_status === 'blocked') return false;
  if (doctor.subscription_status === 'trial') {
    return new Date(doctor.trial_ends_at) > new Date();
  }
  if (doctor.subscription_status === 'cancelled' && doctor.subscription_end_date) {
    return new Date(doctor.subscription_end_date) > new Date();
  }
  return false;
}

// Pages that don't require active subscription
const EXEMPT_ROUTES = ['/onboarding', '/planos', '/assinatura/sucesso'];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { data: doctor, isLoading: doctorLoading, isError: doctorError } = useDoctor();
  const location = useLocation();
  const [timedOut, setTimedOut] = useState(false);

  // Timer inicia UMA VEZ ao montar — evita reset por estados intermediários (ex: loading → false → doctorLoading → true)
  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 12000);
    return () => clearTimeout(timer);
  }, []);

  if ((loading || doctorLoading) && !timedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  // Se não está autenticado, preserva destino (ex.: voltar ao onboarding/checkout após entrar)
  if (!user) {
    const next = `${location.pathname}${location.search || ''}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  // Don't block onboarding, pricing, or admin pages
  const isExempt = EXEMPT_ROUTES.some(r => location.pathname.startsWith(r)) || location.pathname.startsWith('/admin');

  // Se houve erro na query (ex: coluna inexistente no banco, timeout, RLS),
  // mostra tela de erro com retry — NÃO redireciona pro login
  if (doctorError && !isExempt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 p-4">
        <p className="text-sm text-muted-foreground text-center">
          Não foi possível carregar seu perfil. Verifique sua conexão e tente novamente.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
        <button
          className="text-xs text-muted-foreground underline"
          onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login'; }}
        >
          Sair da conta
        </button>
      </div>
    );
  }

  // No doctor profile exists — redirect to onboarding (exempt pages still allowed)
  if (!doctor && !doctorLoading && !isExempt) {
    return <Navigate to="/onboarding" replace />;
  }

  // If doctor exists, check subscription
  if (doctor && !isExempt && !isSubscriptionValid(doctor)) {
    const handleLogout = async () => {
      await supabase.auth.signOut();
      window.location.href = '/login';
    };

    const isBlocked = doctor.subscription_status === 'blocked';
    const firstName = doctor.name?.split(' ')[0] || '';

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full"
        >
          {isBlocked ? (
            <div className="text-center space-y-6 p-6">
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
                <LogOut className="w-8 h-8 text-destructive" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Conta bloqueada</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Sua conta foi bloqueada. Entre em contato com o suporte para mais informações.
                </p>
              </div>
              <Button variant="ghost" onClick={handleLogout} className="w-full rounded-xl gap-2 text-muted-foreground">
                <LogOut className="w-4 h-4" /> Sair
              </Button>
            </div>
          ) : (
            /* Trial expired — persuasive upsell */
            <div className="rounded-2xl shadow-xl border border-border/50 overflow-hidden bg-card">
              {/* Gradient header */}
              <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent)]" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="relative"
                >
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-10 h-10 text-white" />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative"
                >
                  <h1 className="text-2xl font-bold text-white">
                    {firstName}, seu teste acabou 😢
                  </h1>
                  <p className="text-white/80 text-sm mt-2">
                    Mas a boa notícia é que seus pacientes podem continuar!
                  </p>
                </motion.div>
              </div>

              <div className="p-6 space-y-5">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  <p className="text-sm text-foreground leading-relaxed">
                    <strong>Você está perdendo pacientes agora.</strong> Cada dia sem sua página ativa é uma consulta
                    sem a ferramenta que diferencia seu atendimento.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Profissionais que usam o Altfood relatam <strong className="text-foreground">mais retorno de pacientes</strong> e 
                    recebem elogios pela praticidade. Não fique para trás.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-primary/5 rounded-xl p-4 space-y-2.5"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">O que você ganha com o Pro:</span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-2 ml-6">
                    {[
                      'Substituições ilimitadas para pacientes',
                      'Sua página profissional com marca e cores',
                      'Analytics: saiba quantos pacientes acessam',
                      'Suporte prioritário e novidades primeiro',
                    ].map(f => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-2.5"
                >
                  <Link to="/planos">
                    <Button className="w-full rounded-xl h-12 bg-primary hover:bg-primary/90 text-base font-bold gap-2 shadow-lg shadow-primary/20">
                      <Zap className="w-5 h-5" />
                      Parar de responder no WhatsApp — R$ 47,90/mês
                    </Button>
                  </Link>
                  <p className="text-center text-[11px] text-muted-foreground">
                    Ou R$ 29,90/mês no plano anual — menos de R$ 1 por dia
                  </p>
                </motion.div>

                <div className="pt-2 border-t border-border">
                  <Button variant="ghost" onClick={handleLogout} className="w-full rounded-xl gap-2 text-muted-foreground text-xs h-9">
                    <LogOut className="w-3.5 h-3.5" /> Sair da conta
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
