import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getSafeInternalPath } from '@/lib/safeRedirect';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDoctor } from '@/hooks/useDoctor';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { generateSlug, getShareableUrl } from '@/lib/helpers';
import { consumePendingCheckoutPlan } from '@/lib/checkoutIntent';
import { formatProMonthlyWithPeriod, formatRefundGuaranteeShort } from '@/lib/subscriptionPricing';
import {
  ArrowRight, Copy, Check, Share2, Loader2, Palette,
  MessageCircle, ExternalLink, Crown, Sparkles,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import AltfoodIcon from '@/components/AltfoodIcon';
import { motion, AnimatePresence } from 'framer-motion';

const SPECIALTIES = ['Nutricionista', 'Endocrinologista', 'Clínico Geral', 'Nutrólogo', 'Outro'];
const COLORS = [
  '#0F766E', '#059669', '#2563EB', '#7C3AED', '#DB2777',
  '#EA580C', '#CA8A04', '#16A34A', '#0891B2', '#4F46E5',
];

function ConfettiPiece({ delay, x }: { delay: number; x: number }) {
  const colors = ['#0F766E', '#059669', '#22c55e', '#eab308', '#3b82f6', '#ec4899'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return (
    <motion.div
      className="absolute w-2.5 h-2.5 rounded-sm"
      style={{ backgroundColor: color, left: `${x}%`, top: -10 }}
      initial={{ y: 0, opacity: 1, rotate: 0 }}
      animate={{ y: 600, opacity: 0, rotate: 720 + Math.random() * 360 }}
      transition={{ duration: 2 + Math.random(), delay, ease: 'easeOut' }}
    />
  );
}

export default function Onboarding() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const postAuthRedirect = getSafeInternalPath(searchParams.get('next'));
  const { data: doctor, isLoading, error: doctorError, refetch: refetchDoctor } = useDoctor();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [creatingDoctor, setCreatingDoctor] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [showSubscribePopup, setShowSubscribePopup] = useState(false);
  /** Re-dispara o bootstrap do perfil (ex.: após “Tentar novamente”). */
  const [bootstrapNonce, setBootstrapNonce] = useState(0);
  const bootstrapInFlightRef = useRef(false);
  /** Evita redirect imediato para /dashboard no mesmo tick do refetch após marcar onboarding_completed. */
  const subscribeOfferBlockingRedirectRef = useRef(false);

  // Step 1 fields
  const [specialty, setSpecialty] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');

  // Step 2 fields
  const [primaryColor, setPrimaryColor] = useState('#0F766E');
  const [slugValue, setSlugValue] = useState('');

  useEffect(() => {
    if (!user || isLoading || doctor) return;
    if (bootstrapInFlightRef.current) return;

    const createDoctorProfile = async () => {
      bootstrapInFlightRef.current = true;
      setCreatingDoctor(true);
      setCreationError(null);

      try {
        const metadataName = typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : '';
        const metadataSpecialty = typeof user.user_metadata?.specialty === 'string' ? user.user_metadata.specialty : '';
        const metadataDocument = typeof user.user_metadata?.document_number === 'string' ? user.user_metadata.document_number : '';
        const metadataReferralCode = typeof user.user_metadata?.referral_code === 'string' ? user.user_metadata.referral_code : '';

        const baseName = (metadataName || user.email?.split('@')[0] || 'Profissional').trim();
        const doctorEmail = (user.email || `${user.id}@altfood.app`).toLowerCase();
        let slug = generateSlug(baseName);
        if (!slug) slug = `profissional-${user.id.slice(0, 8)}`;

        const { data: existingSlugs, error: slugError } = await supabase
          .from('doctors')
          .select('slug')
          .like('slug', `${slug}%`);

        if (slugError) throw slugError;

        if (existingSlugs?.some((row) => row.slug === slug)) {
          let idx = 2;
          while (existingSlugs.some((row) => row.slug === `${slug}-${idx}`)) idx += 1;
          slug = `${slug}-${idx}`;
        }

        let referralCode = metadataReferralCode;
        if (!referralCode) {
          try {
            referralCode = localStorage.getItem('altfood_referral_code') || '';
          } catch {
            referralCode = '';
          }
        }
        referralCode = referralCode.trim().toLowerCase();

        let referredBy: string | null = null;
        if (referralCode) {
          const { data: referrerDoctor, error: referrerError } = await supabase
            .from('doctors')
            .select('id')
            .eq('referral_code', referralCode)
            .maybeSingle();

          if (referrerError) throw referrerError;
          referredBy = referrerDoctor?.id || null;
        }

        const invokePromise = supabase.functions.invoke('create-doctor-profile', {
          body: {
            name: baseName,
            email: doctorEmail,
            specialty: metadataSpecialty || 'Nutricionista',
            document_number: metadataDocument || null,
            slug,
            referred_by: referredBy,
          },
        });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('O servidor demorou demais. Tente novamente.')), 15000)
        );
        const { data: createResult, error: createError } = await Promise.race([invokePromise, timeoutPromise]) as any;

        if (createError) throw createError;
        if (createResult?.error) throw new Error(createResult.error);

        if (referralCode) {
          try { localStorage.removeItem('altfood_referral_code'); } catch { /* no-op */ }
        }

        await queryClient.invalidateQueries({ queryKey: ['doctor', user.id] });
        const refetchResult = await refetchDoctor();
        if (!refetchResult.data) {
          throw new Error(
            'Perfil não apareceu após criar. Confira se a função create-doctor-profile está deployada no Supabase e recarregue a página (F5).'
          );
        }
      } catch (error) {
        console.error('[Onboarding] createDoctorProfile failed:', error);
        setCreationError(error instanceof Error ? error.message : 'Erro inesperado ao concluir cadastro.');
      } finally {
        setCreatingDoctor(false);
        bootstrapInFlightRef.current = false;
      }
    };

    createDoctorProfile();
  }, [user, isLoading, doctor, queryClient, refetchDoctor, bootstrapNonce]);

  useEffect(() => {
    if (doctor) {
      setSpecialty(doctor.specialty || 'Nutricionista');
      setDocumentNumber(doctor.document_number || '');
      setPrimaryColor(doctor.primary_color || '#0F766E');
      setSlugValue(doctor.slug || '');
    }
  }, [doctor]);

  useEffect(() => {
    if (
      doctor &&
      (doctor as any).onboarding_completed &&
      !showSubscribePopup &&
      !subscribeOfferBlockingRedirectRef.current
    ) {
      navigate(postAuthRedirect || '/dashboard', { replace: true });
    }
  }, [doctor, navigate, showSubscribePopup, postAuthRedirect]);

  if (isLoading || creatingDoctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (doctorError || creationError) {
    const message = creationError || (doctorError instanceof Error ? doctorError.message : 'Erro ao carregar seu perfil.');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full rounded-2xl border-border/50">
          <CardContent className="p-6 text-center space-y-4">
            <h1 className="text-lg font-bold text-foreground">Não conseguimos preparar seu cadastro</h1>
            <p className="text-sm text-muted-foreground">{message}</p>
            <Button
              className="rounded-xl"
              onClick={async () => {
                setCreationError(null);
                await queryClient.invalidateQueries({ queryKey: ['doctor', user?.id] });
                const r = await refetchDoctor();
                if (!r.data) setBootstrapNonce((n) => n + 1);
              }}
            >
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 gap-4">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <p className="text-xs text-muted-foreground text-center max-w-sm">
          Se ficar muito tempo aqui, a função <span className="font-mono">create-doctor-profile</span> pode não estar respondendo — confira o deploy no Supabase e o console do navegador (F12).
        </p>
        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setBootstrapNonce((n) => n + 1)}>
          Tentar criar perfil de novo
        </Button>
      </div>
    );
  }

  const patientUrl = `${window.location.origin}/${slugValue || doctor.slug}`;
  const shareUrl = getShareableUrl(slugValue || doctor.slug);
  const firstName = doctor.name.split(' ')[0];
  const initials = doctor.name.split(' ').filter((w: string) => w.length > 2).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const saveStep1 = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('doctors').update({
        specialty,
        document_number: documentNumber || null,
      }).eq('id', doctor.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['doctor'] });
      setStep(1);
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const saveStep2 = async () => {
    setSaving(true);
    try {
      const finalSlug = slugValue.trim() || doctor.slug;
      const { error } = await supabase.from('doctors').update({
        primary_color: primaryColor,
        secondary_color: primaryColor,
        slug: finalSlug,
      }).eq('id', doctor.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['doctor'] });
      setStep(2);
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      subscribeOfferBlockingRedirectRef.current = true;
      setShowSubscribePopup(true);
      await supabase.from('doctors').update({ onboarding_completed: true } as any).eq('id', doctor.id);
      queryClient.invalidateQueries({ queryKey: ['doctor'] });
    } catch (err) {
      subscribeOfferBlockingRedirectRef.current = false;
      setShowSubscribePopup(false);
      toast({ title: 'Erro', description: 'Não foi possível completar. Tente novamente.', variant: 'destructive' });
    }
  };

  const skipToEnd = async () => {
    try {
      subscribeOfferBlockingRedirectRef.current = true;
      setShowSubscribePopup(true);
      await supabase.from('doctors').update({
        onboarding_completed: true,
        primary_color: primaryColor,
        secondary_color: primaryColor,
      } as any).eq('id', doctor.id);
      queryClient.invalidateQueries({ queryKey: ['doctor'] });
    } catch {
      subscribeOfferBlockingRedirectRef.current = false;
      setShowSubscribePopup(false);
      toast({ title: 'Erro', variant: 'destructive' });
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setShowConfetti(true);
    toast({ title: '✅ Link copiado!' });
    setTimeout(() => setCopied(false), 2000);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const shareWhatsApp = () => {
    const text = `Olá! Agora você pode consultar substituições alimentares no meu link: ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const TOTAL_STEPS = 3;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AltfoodIcon size="sm" />
            <span className="font-logo font-bold text-foreground">Altfood</span>
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            Passo {step + 1} de {TOTAL_STEPS}
          </span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="max-w-2xl mx-auto w-full px-4 pt-6">
        <div className="flex gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-muted">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: 'hsl(var(--primary))' }}
                initial={{ width: '0%' }}
                animate={{ width: i <= step ? '100%' : '0%' }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg relative overflow-hidden">
          {showConfetti && (
            <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
              {Array.from({ length: 40 }).map((_, i) => (
                <ConfettiPiece key={i} delay={i * 0.03} x={Math.random() * 100} />
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* Step 1: Identity */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
                <Card className="rounded-2xl shadow-lg border-border/50">
                  <CardContent className="p-6 space-y-5">
                    <div className="text-center space-y-2">
                      <AltfoodIcon size="lg" className="mx-auto" />
                      <h1 className="text-xl font-bold text-foreground">Bem-vindo, {firstName}! 🎉</h1>
                      <p className="text-sm text-muted-foreground">Vamos configurar sua página em 2 minutos.</p>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Especialidade</Label>
                        <Select value={specialty} onValueChange={setSpecialty}>
                          <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {SPECIALTIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">CRM / CRN</Label>
                        <Input value={documentNumber} onChange={e => setDocumentNumber(e.target.value)} placeholder="123456" className="rounded-xl h-11" />
                      </div>
                    </div>

                    <Button onClick={saveStep1} className="w-full rounded-xl h-12 bg-primary hover:bg-primary/90 text-base gap-2" disabled={saving}>
                      {saving && <Loader2 className="animate-spin w-4 h-4" />}
                      Continuar <ArrowRight className="w-5 h-5" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Color + Slug */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
                <Card className="rounded-2xl shadow-lg border-border/50">
                  <CardContent className="p-6 space-y-5">
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-foreground">Personalize sua página</h2>
                      <p className="text-sm text-muted-foreground mt-1">Escolha sua cor e defina seu link</p>
                    </div>

                    {/* Color picker */}
                    <div className="flex gap-2.5 flex-wrap justify-center">
                      {COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setPrimaryColor(c)}
                          className="w-10 h-10 rounded-xl border-2 transition-all hover:scale-110 shadow-sm"
                          style={{
                            backgroundColor: c,
                            borderColor: primaryColor === c ? 'hsl(var(--foreground))' : 'transparent',
                            transform: primaryColor === c ? 'scale(1.15)' : undefined,
                          }}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-xs font-medium">Cor personalizada</Label>
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={e => setPrimaryColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border-0 cursor-pointer"
                      />
                    </div>

                    {/* Slug */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Seu link</Label>
                      <div className="flex items-center gap-0 bg-muted rounded-xl overflow-hidden border border-border">
                        <span className="text-xs text-muted-foreground px-3 shrink-0 bg-muted">altfood.app/</span>
                        <Input
                          value={slugValue}
                          onChange={e => setSlugValue(generateSlug(e.target.value))}
                          className="border-0 rounded-none h-11 bg-background"
                          placeholder={doctor.slug}
                        />
                      </div>
                    </div>

                    {/* Mini preview */}
                    <div className="border border-border rounded-2xl overflow-hidden">
                      <div className="p-3 border-b border-border" style={{ backgroundColor: `${primaryColor}08` }}>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}
                          >
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{doctor.name}</p>
                            <p className="text-[10px] text-muted-foreground">{specialty}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="h-9 rounded-xl bg-muted/50 border border-border flex items-center px-3">
                          <span className="text-[10px] text-muted-foreground">🔍 Buscar alimento...</span>
                        </div>
                      </div>
                    </div>

                    <Button onClick={saveStep2} className="w-full rounded-xl h-12 bg-primary hover:bg-primary/90 text-base gap-2" disabled={saving}>
                      {saving && <Loader2 className="animate-spin w-4 h-4" />}
                      Ficou ótimo! Continuar <ArrowRight className="w-5 h-5" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Share + Test */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
                <Card className="rounded-2xl shadow-lg border-border/50">
                  <CardContent className="p-8 text-center space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                      <Share2 className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Sua página está pronta! 🎉</h2>
                      <p className="text-sm text-muted-foreground mt-1">Copie este link e envie para um paciente pelo WhatsApp.</p>
                    </div>

                    {/* URL pill */}
                    <button
                      onClick={copyLink}
                      className="w-full flex items-center gap-3 bg-primary/10 hover:bg-primary/15 px-5 py-4 rounded-2xl transition-colors group"
                    >
                      <code className="text-sm flex-1 truncate text-left font-semibold text-primary">{patientUrl}</code>
                      {copied ? <Check className="w-5 h-5 text-primary shrink-0" /> : <Copy className="w-5 h-5 text-primary/60 shrink-0 group-hover:text-primary" />}
                    </button>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <a href={patientUrl} target="_blank" rel="noopener noreferrer" className="block">
                        <Button variant="outline" className="w-full rounded-xl h-11 gap-2 text-sm">
                          <ExternalLink className="w-4 h-4" /> Ver minha página →
                        </Button>
                      </a>
                      <Button variant="outline" className="rounded-xl h-11 gap-2 text-sm" onClick={shareWhatsApp}>
                        <MessageCircle className="w-4 h-4" /> Enviar pelo WhatsApp
                      </Button>
                    </div>

                    <Button onClick={completeOnboarding} className="w-full rounded-xl h-12 bg-primary hover:bg-primary/90 text-base gap-2">
                      Ir para meu dashboard <ArrowRight className="w-5 h-5" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Skip link below card — only on steps 2 and 3 */}
          {step > 0 && (
            <div className="text-center mt-4">
              <button onClick={skipToEnd} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pular por agora →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Persuasive Subscribe Popup */}
      <Dialog open={showSubscribePopup} onOpenChange={() => {}}>
        <DialogContent
          className="max-w-md rounded-2xl p-0 border-none overflow-hidden [&>button]:hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <div className="bg-gradient-to-br from-primary to-primary/80 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-4"
            >
              <Crown className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white"
            >
              Sua página está pronta! 🎉
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/80 text-sm mt-2"
            >
              Falta só um passo para transformar seu atendimento
            </motion.p>
          </div>

          <div className="p-6 space-y-5">
            <div className="space-y-3">
              <p className="text-sm text-foreground leading-relaxed">
                <strong>Seus pacientes merecem praticidade.</strong> Com o Altfood PRO, eles acessam substituições alimentares
                personalizadas direto pelo celular — sem instalar nada, sem papel, sem perder tempo.
              </p>
            </div>

            <div className="bg-primary/5 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Altfood PRO inclui:</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1.5 ml-6">
                {['Substituições ilimitadas', 'Página com sua marca e cores', 'Analytics de acessos', 'Suporte prioritário'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2.5">
              <Button
                onClick={() => {
                  subscribeOfferBlockingRedirectRef.current = false;
                  setShowSubscribePopup(false);
                  if (postAuthRedirect?.startsWith('/checkout')) {
                    navigate(postAuthRedirect, { replace: true });
                    return;
                  }
                  const pending = consumePendingCheckoutPlan();
                  const plan = pending ?? 'monthly';
                  navigate(`/checkout?plan=${plan}`, { replace: true });
                }}
                className="w-full rounded-xl h-12 bg-primary hover:bg-primary/90 text-base font-bold gap-2"
              >
                <Crown className="w-5 h-5" />
                Pagar e liberar o painel — {formatProMonthlyWithPeriod()}
              </Button>
              <p className="text-center text-[11px] text-muted-foreground leading-relaxed px-1">
                {formatRefundGuaranteeShort()}. O acesso ao app é liberado após a confirmação do pagamento.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
