import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getSiteOriginForAuth } from '@/lib/siteUrl';
import { Loader2, MailCheck } from 'lucide-react';
import AltfoodIcon from '@/components/AltfoodIcon';
import { motion, AnimatePresence } from 'framer-motion';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Campo obrigatório'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('E-mail inválido'); return; }
    setError('');
    setLoading(true);
    const { error: apiErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${getSiteOriginForAuth()}/reset-password`,
    });
    setLoading(false);
    if (apiErr) {
      toast({ title: 'Erro', description: apiErr.message, variant: 'destructive' });
    } else {
      setSent(true);
      toast({ title: '✅ E-mail enviado!' });
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
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4 py-4"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <MailCheck className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">E-mail enviado!</p>
                    <p className="text-muted-foreground text-sm mt-1">Verifique sua caixa de entrada para redefinir sua senha.</p>
                  </div>
                  <Link to="/login" className="text-primary hover:underline text-sm font-medium inline-block">
                    Voltar para login
                  </Link>
                </motion.div>
              ) : (
                <motion.div key="form" exit={{ opacity: 0 }}>
                  <p className="text-center text-sm text-muted-foreground mb-5">
                    Informe seu e-mail para receber o link de recuperação
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">E-mail</Label>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setError(''); }}
                        className={`rounded-xl h-11 ${error ? 'border-destructive' : ''}`}
                      />
                      {error && <p className="text-xs text-destructive">{error}</p>}
                    </div>
                    <Button type="submit" className="w-full rounded-xl h-11 bg-primary hover:bg-primary/90" disabled={loading}>
                      {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                      Enviar link de recuperação
                    </Button>
                    <p className="text-center text-sm pt-1">
                      <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">Voltar para login</Link>
                    </p>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
