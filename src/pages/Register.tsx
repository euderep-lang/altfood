import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Leaf, Copy, Check, ExternalLink } from 'lucide-react';
import { generateSlug } from '@/lib/helpers';
import { motion, AnimatePresence } from 'framer-motion';

const specialties = ['Nutricionista', 'Endocrinologista', 'Clínico Geral', 'Nutrólogo', 'Outro'];

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', documentNumber: '', specialty: 'Nutricionista', password: '', confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast({ title: 'As senhas não coincidem', variant: 'destructive' });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: 'A senha deve ter pelo menos 6 caracteres', variant: 'destructive' });
      return;
    }

    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: { emailRedirectTo: window.location.origin }
    });

    if (authError || !authData.user) {
      setLoading(false);
      toast({ title: 'Erro ao criar conta', description: authError?.message, variant: 'destructive' });
      return;
    }

    let slug = generateSlug(form.name);
    const { data: existing } = await supabase.from('doctors').select('slug').like('slug', `${slug}%`);
    if (existing && existing.length > 0) {
      const slugs = existing.map(e => e.slug);
      if (slugs.includes(slug)) {
        let i = 2;
        while (slugs.includes(`${slug}-${i}`)) i++;
        slug = `${slug}-${i}`;
      }
    }

    const { error: docError } = await supabase.from('doctors').insert({
      user_id: authData.user.id,
      name: form.name.trim(),
      email: form.email.trim(),
      document_number: form.documentNumber || null,
      specialty: form.specialty,
      slug,
    });

    setLoading(false);
    if (docError) {
      toast({ title: 'Erro ao criar perfil', description: docError.message, variant: 'destructive' });
      return;
    }
    setSuccess(`${window.location.origin}/p/${slug}`);
  };

  const copyLink = async () => {
    if (!success) return;
    await navigator.clipboard.writeText(success);
    setCopied(true);
    toast({ title: '✅ Link copiado!' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[400px]"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground tracking-tight">Altfood</span>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="rounded-2xl shadow-lg border-primary/20">
                <CardContent className="p-6 text-center space-y-5">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Sua conta foi criada!</h2>
                    <p className="text-sm text-muted-foreground mt-1.5">
                      Seu link de paciente já está pronto:
                    </p>
                  </div>

                  <button
                    onClick={copyLink}
                    className="w-full flex items-center gap-2 bg-primary/10 hover:bg-primary/15 text-primary px-4 py-3 rounded-xl transition-colors group"
                  >
                    <code className="text-sm flex-1 truncate text-left font-medium">{success}</code>
                    {copied ? (
                      <Check className="w-4 h-4 shrink-0" />
                    ) : (
                      <Copy className="w-4 h-4 shrink-0 opacity-60 group-hover:opacity-100" />
                    )}
                  </button>

                  <div className="flex flex-col gap-2">
                    <Link to="/dashboard">
                      <Button className="w-full rounded-xl h-11 bg-primary hover:bg-primary/90">
                        Ir para o Dashboard
                      </Button>
                    </Link>
                    <a href={success} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full rounded-xl h-11 gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Ver página do paciente
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="form" exit={{ opacity: 0, scale: 0.95 }}>
              <Card className="rounded-2xl shadow-lg border-border/50">
                <CardContent className="p-6">
                  <p className="text-center text-sm text-muted-foreground mb-5">
                    Crie sua conta profissional gratuitamente
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Nome completo *</Label>
                      <Input placeholder="Dra. Maria Silva" value={form.name} onChange={e => update('name', e.target.value)} className="rounded-xl h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">E-mail *</Label>
                      <Input type="email" placeholder="seu@email.com" value={form.email} onChange={e => update('email', e.target.value)} className="rounded-xl h-11" />
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
                      <Input type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={e => update('password', e.target.value)} className="rounded-xl h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Confirmar senha *</Label>
                      <Input type="password" placeholder="Repita a senha" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} className="rounded-xl h-11" />
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
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
