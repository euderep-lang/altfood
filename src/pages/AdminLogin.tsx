import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import AltfoodIcon from '@/components/AltfoodIcon';
import { motion } from 'framer-motion';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, loading: adminCheckLoading } = useAdmin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!adminCheckLoading && user && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [adminCheckLoading, user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !authData.user) {
      setLoading(false);
      toast({ title: 'Acesso negado', description: 'E-mail ou senha inválidos.', variant: 'destructive' });
      return;
    }

    await (supabase.rpc as any)('ensure_owner_admin_role');
    const { data: allowed, error: roleError } = await (supabase.rpc as any)('has_role', {
      _user_id: authData.user.id,
      _role: 'admin',
    });

    setLoading(false);

    if (roleError || !allowed) {
      await supabase.auth.signOut();
      toast({ title: 'Sem permissão', description: 'Este usuário não tem acesso ao painel admin.', variant: 'destructive' });
      return;
    }

    toast({ title: '✅ Acesso administrativo liberado' });
    navigate('/admin', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-[420px]"
      >
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <AltfoodIcon size="md" className="shadow-sm" />
          <span className="text-2xl font-logo font-bold text-foreground tracking-tight">Altfood</span>
        </div>

        <Card className="rounded-2xl shadow-lg border-border/50">
          <CardContent className="p-6 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold text-foreground">Login administrativo</h1>
              <p className="text-sm text-muted-foreground">Acesse o painel interno do desenvolvedor</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">E-mail</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@email.com"
                  className="rounded-xl h-11"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Senha</Label>
                  <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    Esqueci minha senha
                  </Link>
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-xl h-11"
                />
              </div>

              <Button type="submit" className="w-full rounded-xl h-11 bg-primary hover:bg-primary/90" disabled={loading || adminCheckLoading}>
                {(loading || adminCheckLoading) && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                Entrar no admin
              </Button>
            </form>

            <div className="text-center">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Voltar para login padrão
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
