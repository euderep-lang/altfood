import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDoctor } from '@/hooks/useDoctor';
import { Loader2, AlertTriangle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

function isSubscriptionValid(doctor: any): boolean {
  if (!doctor) return false;
  if (doctor.subscription_status === 'active') return true;
  if (doctor.subscription_status === 'blocked') return false;
  if (doctor.subscription_status === 'trial') {
    return new Date(doctor.trial_ends_at) > new Date();
  }
  return false;
}

// Pages that don't require active subscription
const EXEMPT_ROUTES = ['/onboarding', '/planos', '/assinatura/sucesso'];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { data: doctor, isLoading: doctorLoading } = useDoctor();
  const location = useLocation();

  if (loading || doctorLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Don't block onboarding, pricing, or admin pages
  const isExempt = EXEMPT_ROUTES.some(r => location.pathname.startsWith(r)) || location.pathname.startsWith('/admin');

  // No doctor profile exists — redirect to onboarding (exempt pages still allowed)
  if (!doctor && !isExempt) {
    return <Navigate to="/onboarding" replace />;
  }

  // If doctor exists, check subscription
  if (doctor && !isExempt && !isSubscriptionValid(doctor)) {
    const handleLogout = async () => {
      await supabase.auth.signOut();
      window.location.href = '/login';
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Acesso bloqueado</h1>
            <p className="text-sm text-muted-foreground mt-2">
              {doctor.subscription_status === 'blocked' 
                ? 'Sua conta foi bloqueada. Entre em contato com o suporte.'
                : 'Seu período de teste expirou ou sua assinatura está inativa. Assine para continuar usando o Altfood.'}
            </p>
          </div>
          <div className="space-y-3">
            <Link to="/planos">
              <Button className="w-full rounded-xl h-11 px-8 bg-primary hover:bg-primary/90">
                Ver planos
              </Button>
            </Link>
            <Button variant="ghost" onClick={handleLogout} className="w-full rounded-xl gap-2 text-muted-foreground">
              <LogOut className="w-4 h-4" /> Sair
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
