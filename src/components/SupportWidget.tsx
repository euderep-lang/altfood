import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDoctor } from '@/hooks/useDoctor';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle, X, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SupportWidget() {
  const { data: doctor } = useDoctor();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const sendMutation = useMutation({
    mutationFn: async (msg: string) => {
      if (!doctor) throw new Error('No doctor');
      const trimmed = msg.trim().replace(/<[^>]*>/g, '');
      if (!trimmed || trimmed.length > 2000) throw new Error('Invalid message');
      const { error } = await supabase.from('support_tickets').insert({
        doctor_id: doctor.id,
        message: trimmed,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setSent(true);
      setMessage('');
      setTimeout(() => { setSent(false); setOpen(false); }, 3000);
    },
  });

  if (!doctor) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 md:bottom-6 left-4 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="Suporte"
      >
        {open ? <X className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-36 md:bottom-20 left-4 z-50 w-80 max-w-[calc(100vw-2rem)]"
          >
            <Card className="rounded-2xl shadow-2xl border-border">
              <CardContent className="p-4 space-y-3">
                {sent ? (
                  <div className="text-center py-6 space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto" />
                    <p className="text-sm font-semibold text-foreground">Mensagem enviada!</p>
                    <p className="text-xs text-muted-foreground">Respondemos em até 24h.</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-bold text-foreground">Precisa de ajuda?</p>
                      <p className="text-xs text-muted-foreground">Envie sua mensagem e respondemos em até 24h.</p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{doctor.name}</span> · {doctor.email}
                      </div>
                      <Textarea
                        placeholder="Descreva sua dúvida ou problema..."
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        className="rounded-xl min-h-[80px] resize-none text-sm"
                        maxLength={2000}
                      />
                      {message.length > 1800 && (
                        <p className="text-[10px] text-muted-foreground text-right">{message.length}/2000</p>
                      )}
                    </div>
                    <Button
                      onClick={() => sendMutation.mutate(message)}
                      disabled={!message.trim() || sendMutation.isPending}
                      className="w-full rounded-xl gap-2 bg-primary hover:bg-primary/90"
                    >
                      {sendMutation.isPending ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                      ) : (
                        <><Send className="w-4 h-4" /> Enviar mensagem</>
                      )}
                    </Button>
                    {sendMutation.isError && (
                      <p className="text-xs text-destructive text-center">Erro ao enviar. Tente novamente.</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
