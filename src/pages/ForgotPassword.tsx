import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Leaf } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: 'Informe seu e-mail', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-md">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Altfood</span>
          </div>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-foreground font-medium">E-mail enviado!</p>
              <p className="text-muted-foreground text-sm">Verifique sua caixa de entrada para redefinir sua senha.</p>
              <Link to="/login" className="text-primary hover:underline text-sm">Voltar para login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-muted-foreground text-sm text-center">Informe seu e-mail para receber o link de recuperação.</p>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl" />
              </div>
              <Button type="submit" className="w-full rounded-xl h-11" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                Enviar link de recuperação
              </Button>
              <p className="text-center text-sm">
                <Link to="/login" className="text-primary hover:underline">Voltar para login</Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
