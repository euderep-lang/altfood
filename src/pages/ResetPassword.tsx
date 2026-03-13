import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import AltfoodIcon from '@/components/AltfoodIcon';
import { motion } from 'framer-motion';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes('type=recovery')) {
      navigate('/login');
    }
  }, [navigate]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!password) errs.password = 'Campo obrigatório';
    else if (password.length < 8) errs.password = 'Senha deve ter pelo menos 8 caracteres';
    if (!confirm) errs.confirm = 'Campo obrigatório';
    else if (password !== confirm) errs.confirm = 'As senhas não coincidem';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✅ Senha atualizada com sucesso!' });
      navigate('/dashboard');
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
          <span className="text-2xl font-bold text-foreground tracking-tight">Altfood</span>
        </div>

        <Card className="rounded-2xl shadow-lg border-border/50">
          <CardContent className="p-6">
            <p className="text-center text-sm text-muted-foreground mb-5">Defina sua nova senha</p>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Nova senha</Label>
                <Input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
                  className={`rounded-xl h-11 ${errors.password ? 'border-destructive' : ''}`}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Confirmar nova senha</Label>
                <Input
                  type="password"
                  placeholder="Repita a senha"
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setErrors(prev => ({ ...prev, confirm: '' })); }}
                  className={`rounded-xl h-11 ${errors.confirm ? 'border-destructive' : ''}`}
                />
                {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
              </div>
              <Button type="submit" className="w-full rounded-xl h-11 bg-primary hover:bg-primary/90" disabled={loading}>
                {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                Atualizar senha
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
