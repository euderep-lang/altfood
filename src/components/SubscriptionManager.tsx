import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Crown, CreditCard, Calendar, AlertTriangle, Loader2, Check, X, History, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { formatDate, daysRemaining } from '@/lib/helpers';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { hasRefundGuaranteeActive } from '@/lib/subscriptionAccess';
import { formatRefundGuaranteeShort } from '@/lib/subscriptionPricing';
import { CHECKOUT_MONTHLY_PATH } from '@/lib/checkoutIntent';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  plan: string;
  status: string;
  payer_email: string | null;
  paid_at: string;
}

interface SubscriptionManagerProps {
  doctor: {
    id: string;
    subscription_status: string;
    subscription_end_date: string | null;
    trial_ends_at: string;
    mp_subscription_id: string | null;
    mp_payer_email: string | null;
  };
}

export default function SubscriptionManager({ doctor }: SubscriptionManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelStep, setCancelStep] = useState<'persuade' | 'confirm'>('persuade');
  const [cancelling, setCancelling] = useState(false);

  const periodStillValid =
    doctor.subscription_end_date &&
    new Date(doctor.subscription_end_date) > new Date();
  const isActiveSubscription = doctor.subscription_status === 'active';
  const hasProAccess =
    isActiveSubscription ||
    (doctor.subscription_status === 'cancelled' && periodStillValid);
  const isPro = hasProAccess;
  const isCancelled = doctor.subscription_status === 'cancelled';

  const endDate = isPro || isCancelled ? doctor.subscription_end_date : null;

  const daysLeft = endDate ? daysRemaining(endDate) : 0;
  const isExpired = daysLeft <= 0;

  // Determine current plan type from last payment
  const lastPayment = payments[0];
  const currentPlan = lastPayment?.plan === 'annual' ? 'Anual (legado)' : 'Mensal';
  const currentPrice = lastPayment?.plan === 'annual' ? 'Plano anual (legado)' : 'R$ 19,90/mês';

  useEffect(() => {
    loadPayments();
  }, [doctor.id]);

  const loadPayments = async () => {
    setLoadingPayments(true);
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('doctor_id', doctor.id)
      .order('paid_at', { ascending: false });
    setPayments((data as Payment[]) || []);
    setLoadingPayments(false);
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription');
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: 'Assinatura cancelada',
        description: `Seu acesso Pro continua ativo até ${endDate ? new Date(endDate).toLocaleDateString('pt-BR') : 'o fim do período'}.`,
      });
      setShowCancelModal(false);
      setCancelStep('persuade');
      queryClient.invalidateQueries({ queryKey: ['doctor'] });
    } catch (err: any) {
      toast({ title: 'Erro ao cancelar', description: err.message, variant: 'destructive' });
    } finally {
      setCancelling(false);
    }
  };

  const statusConfig = {
    active: { label: 'Pro', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Crown },
    trial: { label: 'Teste grátis', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Calendar },
    cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700 border-red-200', icon: X },
    inactive: { label: 'Gratuito', color: 'bg-muted text-muted-foreground border-border', icon: AlertTriangle },
    expired: { label: 'Gratuito', color: 'bg-muted text-muted-foreground border-border', icon: AlertTriangle },
  };

  const status = isExpired && !isPro ? 'expired' : (doctor.subscription_status as keyof typeof statusConfig);
  const statusInfo = statusConfig[status] || statusConfig.expired;
  const StatusIcon = statusInfo.icon;

  return (
    <>
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              <Label className="text-sm font-semibold">Assinatura e Pagamento</Label>
            </div>
            <Badge className={`${statusInfo.color} border rounded-lg text-xs font-medium px-2.5 py-1`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>

          {/* Plan details */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {isPro ? `Plano Pro ${currentPlan}` : isCancelled ? 'Plano Pro (cancelado)' : 'Sem assinatura ativa'}
                </p>
                {(isPro || isCancelled) && lastPayment && (
                  <p className="text-xs text-muted-foreground mt-0.5">{currentPrice}</p>
                )}
              </div>
              {hasProAccess && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {isCancelled ? 'Acesso até' : 'Próxima renovação'}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {endDate ? new Date(endDate).toLocaleDateString('pt-BR') : '—'}
                  </p>
                </div>
              )}
            </div>

            {isCancelled && endDate && !isExpired && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-700">
                  <strong>Seu plano foi cancelado.</strong> Você ainda tem acesso Pro até{' '}
                  <strong>{new Date(endDate).toLocaleDateString('pt-BR')}</strong> ({daysLeft} {daysLeft === 1 ? 'dia' : 'dias'} restantes).
                </p>
              </div>
            )}

            {isActiveSubscription && hasRefundGuaranteeActive(doctor) && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                <p className="text-xs text-emerald-900 dark:text-emerald-100">
                  <strong>Garantia de satisfação:</strong> {formatRefundGuaranteeShort()}. Para reembolso integral nesse período, fale com o{' '}
                  <Link to="/dashboard/support" className="underline font-medium">
                    suporte
                  </Link>
                  .
                </p>
              </div>
            )}

            {isActiveSubscription && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="w-3.5 h-3.5" />
                <span>Renovação automática • Cancele quando quiser</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {!hasProAccess && isExpired && (
              <Link to={CHECKOUT_MONTHLY_PATH} className="flex-1">
                <Button className="w-full rounded-xl h-10 text-sm bg-primary hover:bg-primary/90 gap-1.5">
                  <Crown className="w-4 h-4" />
                  Fazer upgrade para Pro
                </Button>
              </Link>
            )}

            {isActiveSubscription && (
              <Button
                variant="ghost"
                className="rounded-xl h-10 text-sm text-muted-foreground hover:text-destructive"
                onClick={() => { setShowCancelModal(true); setCancelStep('persuade'); }}
              >
                Cancelar assinatura
              </Button>
            )}
          </div>

          {/* Payment history */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-muted-foreground" />
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Histórico de pagamentos</Label>
            </div>

            {loadingPayments ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-6 bg-muted/30 rounded-xl">
                <CreditCard className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Nenhum pagamento registrado</p>
              </div>
            ) : (
              <div className="space-y-2">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Altfood PRO — {payment.plan === 'annual' ? 'Anual' : 'Mensal'}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(payment.paid_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        R$ {payment.amount.toFixed(2).replace('.', ',')}
                      </p>
                      <Badge variant="outline" className="text-[10px] rounded-md border-emerald-200 text-emerald-600">
                        Pago
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cancel Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="rounded-2xl max-w-md">
          <AnimatePresence mode="wait">
            {cancelStep === 'persuade' ? (
              <motion.div
                key="persuade"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-5"
              >
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <span className="text-2xl">📱</span> Voltar a responder no WhatsApp?
                  </DialogTitle>
                  <DialogDescription className="text-sm pt-2">
                    Lembra como era antes? Paciente mandando mensagem atrás de mensagem...
                  </DialogDescription>
                </DialogHeader>

                {hasRefundGuaranteeActive(doctor) && (
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                    Você está na garantia de 14 dias: se quiser desistir com <strong>reembolso integral</strong>, use o suporte em vez de cancelar a renovação aqui — assim processamos a devolução do valor pago.
                  </p>
                )}

                <div className="bg-muted/50 rounded-xl p-4 space-y-2.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Seu WhatsApp sem o Altfood:</p>
                  {[
                    { msg: '"Dra., não tem frango. Posso trocar por quê?"', time: '14:32' },
                    { msg: '"E 100g de frango é quanto de patinho?"', time: '14:33' },
                    { msg: '"Ah e o arroz, posso usar quinoa?"', time: '14:34' },
                    { msg: '"E a batata doce acabou tb kkkk"', time: '14:35' },
                  ].map((bubble) => (
                    <div key={bubble.msg} className="bg-card border border-border rounded-xl rounded-tl-sm px-3 py-2">
                      <p className="text-xs text-foreground">{bubble.msg}</p>
                      <p className="text-[9px] text-muted-foreground text-right">{bubble.time}</p>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground italic pt-1">× 20, 50, 100 pacientes... todo dia.</p>
                </div>

                <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-medium text-foreground">Ao cancelar, você perde:</p>
                  {[
                    '⏱️ 1h+ por dia que o Altfood economiza respondendo pacientes',
                    '📱 Pacientes resolvendo substituições sozinhos, sem te incomodar',
                    '📊 Analytics de quais alimentos seus pacientes mais buscam',
                    '🎨 Sua página personalizada com sua marca',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <X className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
                      <span className="text-xs text-foreground">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl h-11"
                    onClick={() => setShowCancelModal(false)}
                  >
                    Quero meu tempo de volta! 🎉
                  </Button>
                  <Button
                    variant="ghost"
                    className="rounded-xl h-11 text-muted-foreground hover:text-destructive text-xs"
                    onClick={() => setCancelStep('confirm')}
                  >
                    Cancelar mesmo assim
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" /> Confirmar cancelamento
                  </DialogTitle>
                  <DialogDescription className="text-sm pt-2">
                    Ao cancelar, seu plano Pro ficará ativo até{' '}
                    <strong>{endDate ? new Date(endDate).toLocaleDateString('pt-BR') : 'o fim do período atual'}</strong>.
                    Após essa data, você perderá acesso aos recursos Pro.
                    {hasRefundGuaranteeActive(doctor) && (
                      <>
                        {' '}
                        Dentro da garantia de 14 dias, o reembolso integral é tratado pelo suporte.
                      </>
                    )}
                  </DialogDescription>
                </DialogHeader>

                <div className="bg-muted rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status após cancelamento:</span>
                    <span className="font-medium text-foreground">Acesso até a vigência</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Data de expiração:</span>
                    <span className="font-medium text-foreground">
                      {endDate ? new Date(endDate).toLocaleDateString('pt-BR') : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cobrança recorrente:</span>
                    <span className="font-medium text-destructive">Será cancelada</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl h-11"
                    onClick={() => setCancelStep('persuade')}
                    disabled={cancelling}
                  >
                    Voltar
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 rounded-xl h-11"
                    onClick={handleCancel}
                    disabled={cancelling}
                  >
                    {cancelling ? (
                      <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Cancelando...</>
                    ) : (
                      'Confirmar cancelamento'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}
