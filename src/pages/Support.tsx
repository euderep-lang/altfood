import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDoctor } from '@/hooks/useDoctor';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle } from 'lucide-react';

export default function Support() {
  const { data: doctor } = useDoctor();
  const { toast } = useToast();
  const [name, setName] = useState(doctor?.name || '');
  const [email, setEmail] = useState(doctor?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject) {
      toast({ title: 'Selecione um assunto', variant: 'destructive' });
      return;
    }
    if (message.length < 20) {
      toast({ title: 'A mensagem deve ter pelo menos 20 caracteres', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-support-email', {
        body: { name, email, subject, message },
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      toast({ title: 'Erro ao enviar', description: err.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-foreground">Suporte</h1>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-4 pt-6">
            {sent ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle className="mx-auto h-12 w-12 text-primary" />
                <p className="font-semibold text-foreground">Mensagem enviada!</p>
                <p className="text-sm text-muted-foreground">Responderemos o mais breve possível.</p>
                <Button variant="outline" className="rounded-xl" onClick={() => setSent(false)}>Enviar outra mensagem</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Nome</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>E-mail</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Assunto</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Problema técnico">Problema técnico</SelectItem>
                      <SelectItem value="Dúvida sobre assinatura">Dúvida sobre assinatura</SelectItem>
                      <SelectItem value="Sugestão de melhoria">Sugestão de melhoria</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Mensagem</Label>
                  <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Descreva sua dúvida ou problema..." rows={5} className="rounded-xl" />
                  <p className="text-xs text-muted-foreground">{message.length}/20 caracteres mínimos</p>
                </div>
                <Button type="submit" className="w-full rounded-xl" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                  Enviar mensagem
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
