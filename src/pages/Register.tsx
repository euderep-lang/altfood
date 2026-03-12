import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Leaf } from 'lucide-react';
import { generateSlug } from '@/lib/helpers';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', documentType: 'CRM', documentNumber: '', specialty: 'Nutrologia', password: '', confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const formatPhone = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
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
      email: form.email,
      password: form.password,
      options: { emailRedirectTo: window.location.origin }
    });

    if (authError || !authData.user) {
      setLoading(false);
      toast({ title: 'Erro ao criar conta', description: authError?.message, variant: 'destructive' });
      return;
    }

    let slug = generateSlug(form.name);
    // Check if slug exists
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
      name: form.name,
      email: form.email,
      phone: form.phone.replace(/\D/g, ''),
      document_type: form.documentType,
      document_number: form.documentNumber,
      specialty: form.specialty,
      slug,
    });

    setLoading(false);
    if (docError) {
      toast({ title: 'Erro ao criar perfil', description: docError.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Conta criada com sucesso!' });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-md">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Altfood</span>
          </div>
          <p className="text-muted-foreground text-sm">Crie sua conta profissional</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nome completo *</Label>
              <Input placeholder="Dra. Maria Silva" value={form.name} onChange={e => update('name', e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>E-mail *</Label>
              <Input type="email" placeholder="seu@email.com" value={form.email} onChange={e => update('email', e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <Input placeholder="(11) 99999-9999" value={form.phone} onChange={e => update('phone', formatPhone(e.target.value))} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Registro</Label>
                <Select value={form.documentType} onValueChange={v => update('documentType', v)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CRM">CRM</SelectItem>
                    <SelectItem value="CRN">CRN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Número</Label>
                <Input placeholder="123456" value={form.documentNumber} onChange={e => update('documentNumber', e.target.value)} className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Especialidade</Label>
              <Input placeholder="Nutrologia" value={form.specialty} onChange={e => update('specialty', e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Senha *</Label>
              <Input type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={e => update('password', e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Confirmar senha *</Label>
              <Input type="password" placeholder="Repita a senha" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} className="rounded-xl" />
            </div>
            <Button type="submit" className="w-full rounded-xl h-11" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
              Criar conta
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Já tem conta? <Link to="/login" className="text-primary hover:underline">Entrar</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
