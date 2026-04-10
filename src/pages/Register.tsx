import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import AltfoodIcon from '@/components/AltfoodIcon';

import { motion } from 'framer-motion';

const specialties = ['Nutricionista', 'Endocrinologista', 'Clínico Geral', 'Nutrólogo', 'Outro'];

function sanitize(str: string) {
  return str.replace(/<[^>]*>/g, '').trim();
}

function isExistingAuthUser(authUser: { identities?: Array<unknown> } | null) {
  return Array.isArray(authUser?.identities) && authUser.identities.length === 0;
}

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', documentNumber: '', specialty: 'Nutricionista', password: '', confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  const update = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Campo obrigatório';
    if (!form.email.trim()) errs.email = 'Campo obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'E-mail inválido';
    if (!form.password) errs.password = 'Campo obrigatório';
    else if (form.password.length < 8) errs.password = 'Senha deve ter pelo menos 8 caracteres';
    if (!form.confirmPassword) errs.confirmPassword = 'Campo obrigatório';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'As senhas não coincidem';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      // Rate limit check
      try {
        const { data: rlData } = await supabase.functions.invoke('check-rate-limit', {
          body: { action: 'signup' },
        });
        if (rlData && !rlData.allowed) {
          toast({ title: 'Muitas tentativas', description: rlData.message || 'Tente novamente mais tarde.', variant: 'destructive' });
          return;
        }
      } catch {
        // If rate limit check fails, proceed anyway
      }

      const cleanName = sanitize(form.name);
      const cleanEmail = form.email.trim().toLowerCase();
      const cleanDoc = sanitize(form.documentNumber);
      const referralCode = localStorage.getItem('altfood_referral_code')?.trim().toLowerCase() || null;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: form.password,
        options: {
          data: {
            name: cleanName,
            specialty: form.specialty,
            document_number: cleanDoc || null,
            referral_code: referralCode,
          },
        },
      });

      if (authError || !authData.user) {
        toast({ title: 'Erro ao criar conta', description: authError?.message || 'Tente novamente.', variant: 'destructive' });
        return;
      }

      if (isExistingAuthUser(authData.user)) {
        toast({
          title: 'Conta já existente',
          description: 'Este e-mail já está cadastrado. Entre com sua senha ou use recuperar senha.',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      if (authData.session) {
        toast({ title: 'Conta criada com sucesso', description: 'Vamos finalizar seu perfil.' });
        navigate('/onboarding', { replace: true });
        return;
      }

      toast({
        title: 'Não foi possível entrar automaticamente',
        description: 'Tente fazer login. Se o projeto ainda exigir confirmação por e-mail, desative em Authentication → Providers → Email no Supabase.',
        variant: 'destructive',
      });
      navigate('/login');
    } catch (err) {
      console.error('[Register] Unexpected error:', err);
      toast({ title: 'Erro inesperado', description: 'Tente novamente.', variant: 'destructive' });
    } finally {
      setLoading(false);
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
              Crie sua conta profissional gratuitamente
            </p>
            <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Nome completo *</Label>
                <Input placeholder="Dra. Maria Silva" value={form.name} onChange={e => update('name', e.target.value)} className={`rounded-xl h-11 ${errors.name ? 'border-destructive' : ''}`} />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">E-mail *</Label>
                <Input type="email" placeholder="seu@email.com" value={form.email} onChange={e => update('email', e.target.value)} className={`rounded-xl h-11 ${errors.email ? 'border-destructive' : ''}`} />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">CRM / CRN (opcional)</Label>
                <Input placeholder="123456" value={form.documentNumber} onChange={e => update('documentNumber', e.target.value)} className="rounded-xl h-11" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Especialidade</Label>
                <Select value={form.specialty} onValueChange={v => update('specialty', v)}>
                  <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {specialties.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Senha *</Label>
                <Input type="password" placeholder="Mínimo 8 caracteres" value={form.password} onChange={e => update('password', e.target.value)} className={`rounded-xl h-11 ${errors.password ? 'border-destructive' : ''}`} />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Confirmar senha *</Label>
                <Input type="password" placeholder="Repita a senha" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} className={`rounded-xl h-11 ${errors.confirmPassword ? 'border-destructive' : ''}`} />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
              </div>
              <Button type="submit" className="w-full rounded-xl h-11 bg-primary hover:bg-primary/90 mt-1" disabled={loading}>
                {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                Criar minha conta grátis
              </Button>
              <p className="text-center text-sm text-muted-foreground pt-1">
                Já tenho conta{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">Entrar</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
