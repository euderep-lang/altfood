import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail } from 'lucide-react';
import AltfoodIcon from '@/components/AltfoodIcon';
import { generateSlug } from '@/lib/helpers';
import { motion } from 'framer-motion';

const specialties = ['Nutricionista', 'Endocrinologista', 'Clínico Geral', 'Nutrólogo', 'Outro'];

function sanitize(str: string) {
  return str.replace(/<[^>]*>/g, '').trim();
}

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', documentNumber: '', specialty: 'Nutricionista', password: '', confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showEmailSent, setShowEmailSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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

    // Rate limit check
    try {
      const { data: rlData } = await supabase.functions.invoke('check-rate-limit', {
        body: { action: 'signup' },
      });
      if (rlData && !rlData.allowed) {
        toast({ title: 'Muitas tentativas', description: rlData.message || 'Tente novamente mais tarde.', variant: 'destructive' });
        setLoading(false);
        return;
      }
    } catch {
      // If rate limit check fails, proceed anyway
    }

    const cleanName = sanitize(form.name);
    const cleanEmail = form.email.trim().toLowerCase();
    const cleanDoc = sanitize(form.documentNumber);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: form.password,
      options: { emailRedirectTo: window.location.origin }
    });

    if (authError || !authData.user) {
      setLoading(false);
      toast({ title: 'Erro ao criar conta', description: authError?.message || 'Tente novamente.', variant: 'destructive' });
      return;
    }

    let slug = generateSlug(cleanName);
    const { data: existing } = await supabase.from('doctors').select('slug').like('slug', `${slug}%`);
    if (existing && existing.length > 0) {
      const slugs = existing.map(e => e.slug);
      if (slugs.includes(slug)) {
        let i = 2;
        while (slugs.includes(`${slug}-${i}`)) i++;
        slug = `${slug}-${i}`;
      }
    }

    // Check for referral code
    const referralCode = localStorage.getItem('altfood_referral_code');
    let referrerDoctor: any = null;
    if (referralCode) {
      const { data: refDoc } = await supabase.from('doctors').select('id').eq('referral_code', referralCode).maybeSingle();
      referrerDoctor = refDoc;
    }

    const { data: profileData, error: profileError } = await supabase.functions.invoke('create-doctor-profile', {
      body: {
        user_id: authData.user.id,
        name: cleanName,
        email: cleanEmail,
        document_number: cleanDoc || null,
        specialty: form.specialty,
        slug,
        referred_by: referrerDoctor?.id || null,
      },
    });

    setLoading(false);
    if (profileError || (profileData && profileData.error)) {
      toast({ title: 'Erro ao criar perfil', description: profileData?.error || profileError?.message || 'Tente novamente.', variant: 'destructive' });
      return;
    }

    if (referrerDoctor) {
      localStorage.removeItem('altfood_referral_code');
    }

    // Sign out so user must verify email first
    await supabase.auth.signOut();

    // Send welcome email (fire and forget - don't block or crash on failure)
    const patientUrl = `${window.location.origin}/p/${slug}`;
    try {
      supabase.functions.invoke('welcome-email', {
        body: { doctor_name: cleanName, doctor_email: cleanEmail, patient_url: patientUrl },
      }).catch(() => {});
    } catch {
      // Silently ignore welcome email errors
    }

    setShowEmailSent(true);
  };

  if (showEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[400px]"
        >
          <Card className="rounded-2xl shadow-lg border-border/50">
            <CardContent className="p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Verifique seu e-mail 📩</h1>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Enviamos um link de confirmação para <strong className="text-foreground">{form.email}</strong>. 
                  Clique no link do e-mail para ativar sua conta e acessar o painel automaticamente.
                </p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 text-xs text-muted-foreground">
                Não encontrou? Verifique a pasta de spam ou lixo eletrônico.
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
    );
  }

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
