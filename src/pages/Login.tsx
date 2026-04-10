import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import AltfoodIcon from '@/components/AltfoodIcon';
import { motion } from 'framer-motion';
import { getSafeInternalPath } from '@/lib/safeRedirect';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = getSafeInternalPath(searchParams.get('next'));
  const { toast } = useToast();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = 'Campo obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'E-mail inválido';
    if (!password) errs.password = 'Campo obrigatório';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    const { data: authData, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
    if (error) {
      setLoading(false);
      if (error.message?.includes('Email not confirmed')) {
        toast({ title: 'E-mail não confirmado', description: 'Verifique sua caixa de entrada e confirme seu e-mail antes de entrar.', variant: 'destructive' });
      } else {
        toast({ title: 'Erro ao entrar', description: 'E-mail ou senha incorretos.', variant: 'destructive' });
      }
      return;
    }

    // Check if doctor profile exists
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .select('subscription_status, trial_ends_at')
      .eq('user_id', authData.user.id)
      .maybeSingle();

    setLoading(false);

    if (doctorError) {
      toast({ title: 'Erro ao carregar perfil', description: 'Tente novamente em instantes.', variant: 'destructive' });
      return;
    }

    if (!doctor) {
      toast({ title: 'Vamos finalizar seu cadastro', description: 'Complete seu perfil para acessar o painel.' });
      navigate('/onboarding');
    } else if (doctor.subscription_status === 'blocked') {
      toast({ title: 'Conta bloqueada', description: 'Entre em contato com o suporte.', variant: 'destructive' });
      navigate('/planos');
    } else if (doctor.subscription_status === 'inactive') {
      toast({ title: 'Assinatura inativa', description: 'Renove sua assinatura para continuar.', variant: 'destructive' });
      navigate('/planos');
    } else if (doctor.subscription_status === 'trial' && new Date(doctor.trial_ends_at) <= new Date()) {
      toast({ title: 'Trial expirado', description: 'Assine para continuar usando o Altfood.' });
      navigate('/planos');
    } else {
      toast({ title: '✅ Login realizado!' });
      if (nextPath) {
        navigate(nextPath, { replace: true });
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[400px]"
      >
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <AltfoodIcon size="md" className="shadow-sm" />
          <span className="text-2xl font-logo font-bold text-foreground tracking-tight">Altfood</span>
        </div>

        <Card className="rounded-2xl shadow-lg border-border/50">
          <CardContent className="p-6">
            <p className="text-center text-sm text-muted-foreground mb-5">
              Entre na sua conta profissional
            </p>
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">E-mail</Label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
                  className={`rounded-xl h-11 ${errors.email ? 'border-destructive' : ''}`}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Senha</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
                  className={`rounded-xl h-11 ${errors.password ? 'border-destructive' : ''}`}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>
              <Button type="submit" className="w-full rounded-xl h-11 bg-primary hover:bg-primary/90" disabled={loading}>
                {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                Entrar
              </Button>
              <div className="flex items-center justify-between text-sm pt-1">
                <Link to="/forgot-password" className="text-muted-foreground hover:text-primary transition-colors">
                  Esqueci minha senha
                </Link>
                <Link
                  to={nextPath ? `/register?next=${encodeURIComponent(nextPath)}` : '/register'}
                  className="text-primary hover:underline font-medium"
                >
                  Criar conta
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
