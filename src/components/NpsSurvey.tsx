import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDoctor } from '@/hooks/useDoctor';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Share2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NPS_DISMISSED_KEY = 'altfood_nps_dismissed';

export default function NpsSurvey() {
  const { data: doctor } = useDoctor();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [step, setStep] = useState<'score' | 'followup' | 'done'>('score');

  // Check if already responded
  const { data: existing } = useQuery({
    queryKey: ['nps', doctor?.id],
    queryFn: async () => {
      if (!doctor) return null;
      const { data } = await supabase.from('nps_responses').select('id').eq('doctor_id', doctor.id).maybeSingle();
      return data;
    },
    enabled: !!doctor,
  });

  // Show 7 days after signup
  useEffect(() => {
    if (!doctor || existing || localStorage.getItem(NPS_DISMISSED_KEY)) return;
    const created = new Date(doctor.created_at);
    const daysSince = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince >= 7) {
      const timer = setTimeout(() => setOpen(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [doctor, existing]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!doctor || score === null) throw new Error('Missing data');
      const { error } = await supabase.from('nps_responses').insert({
        doctor_id: doctor.id,
        score,
        comment: comment.trim().replace(/<[^>]*>/g, '') || null,
      });
      if (error) throw error;
    },
    onSuccess: () => setStep('done'),
  });

  const handleScoreSelect = (s: number) => {
    setScore(s);
    setStep('followup');
  };

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem(NPS_DISMISSED_KEY, 'true');
  };

  const handleSubmit = () => {
    saveMutation.mutate();
  };

  const referralUrl = doctor ? `${window.location.origin}/ref/${(doctor as any).referral_code || ''}` : '';

  const copyReferral = async () => {
    await navigator.clipboard.writeText(referralUrl);
    toast({ title: '✅ Link copiado!', description: 'Envie para colegas profissionais.' });
  };

  if (!doctor || existing) return null;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base text-center">
            {step === 'score' && '📊 Sua opinião importa'}
            {step === 'followup' && (score !== null && score >= 9 ? '🎉 Que ótimo!' : score !== null && score <= 6 ? '😔 Sentimos muito' : '📝 Obrigado!')}
            {step === 'done' && '✅ Obrigado!'}
          </DialogTitle>
        </DialogHeader>

        {step === 'score' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Em uma escala de 0 a 10, o quanto você indicaria o Altfood para um colega?
            </p>
            <div className="grid grid-cols-11 gap-1">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handleScoreSelect(i)}
                  className="h-10 rounded-lg text-sm font-bold transition-all hover:scale-110"
                  style={{
                    backgroundColor: i <= 6 ? '#EF444420' : i <= 8 ? '#EAB30820' : '#22C55E20',
                    color: i <= 6 ? '#EF4444' : i <= 8 ? '#EAB308' : '#22C55E',
                  }}
                >
                  {i}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground px-1">
              <span>Nada provável</span>
              <span>Muito provável</span>
            </div>
          </div>
        )}

        {step === 'followup' && score !== null && (
          <div className="space-y-4">
            {score >= 9 ? (
              <>
                <p className="text-sm text-muted-foreground text-center">
                  Compartilhe sua experiência com colegas e ganhe 1 mês grátis!
                </p>
                <div className="flex items-center gap-2 bg-muted p-2.5 rounded-xl">
                  <code className="text-xs flex-1 truncate text-foreground">{referralUrl}</code>
                  <Button variant="ghost" size="icon" onClick={copyReferral} className="shrink-0 h-8 w-8">
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <Button onClick={handleSubmit} disabled={saveMutation.isPending} className="w-full rounded-xl gap-2 bg-primary hover:bg-primary/90">
                  {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                  Enviar e compartilhar
                </Button>
              </>
            ) : score <= 6 ? (
              <>
                <p className="text-sm text-muted-foreground text-center">
                  O que podemos melhorar? Seu feedback nos ajuda a evoluir.
                </p>
                <Textarea
                  placeholder="Conte-nos como podemos melhorar..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="rounded-xl min-h-[80px] resize-none text-sm"
                  maxLength={1000}
                />
                <Button onClick={handleSubmit} disabled={saveMutation.isPending} className="w-full rounded-xl bg-primary hover:bg-primary/90">
                  {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar feedback'}
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground text-center">
                  Obrigado! Quer deixar algum comentário adicional?
                </p>
                <Textarea
                  placeholder="Comentário opcional..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="rounded-xl min-h-[60px] resize-none text-sm"
                  maxLength={1000}
                />
                <Button onClick={handleSubmit} disabled={saveMutation.isPending} className="w-full rounded-xl bg-primary hover:bg-primary/90">
                  {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar'}
                </Button>
              </>
            )}
          </div>
        )}

        {step === 'done' && (
          <div className="text-center py-4 space-y-2">
            <p className="text-sm text-muted-foreground">Seu feedback foi registrado. Obrigado por nos ajudar a melhorar! 💚</p>
            <Button variant="outline" onClick={handleClose} className="rounded-xl">Fechar</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
