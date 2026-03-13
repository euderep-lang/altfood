import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDoctor } from '@/hooks/useDoctor';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowRight, Copy, Check, Share2, Loader2, Upload, Palette,
  MessageCircle, ExternalLink, SkipForward,
} from 'lucide-react';
import AltfoodIcon from '@/components/AltfoodIcon';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = ['Boas-vindas', 'Perfil', 'Personalizar', 'Compartilhar'];
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
  const { data: doctor, isLoading } = useDoctor();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Step 2 fields
  const [specialty, setSpecialty] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [bio, setBio] = useState('');
  const [avatarColor, setAvatarColor] = useState('#0F766E');

  // Step 3
  const [primaryColor, setPrimaryColor] = useState('#0F766E');

  useEffect(() => {
    if (doctor) {
      setSpecialty(doctor.specialty || 'Nutricionista');
      setDocumentNumber(doctor.document_number || '');
      setBio((doctor as any).bio || '');
      setAvatarColor(doctor.primary_color || '#0F766E');
      setPrimaryColor(doctor.primary_color || '#0F766E');
    }
  }, [doctor]);

  useEffect(() => {
    if (doctor && (doctor as any).onboarding_completed) {
      navigate('/dashboard', { replace: true });
    }
  }, [doctor, navigate]);

  if (isLoading || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  const patientUrl = `${window.location.origin}/p/${doctor.slug}`;
  const firstName = doctor.name.split(' ')[0];
  const initials = doctor.name.split(' ').filter((w: string) => w.length > 2).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const saveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.from('doctors').update({
      specialty,
      document_number: documentNumber || null,
      bio: bio || null,
      primary_color: avatarColor,
    }).eq('id', doctor.id);
    setSaving(false);
    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ['doctor'] });
    setStep(2);
  };

  const saveColor = async () => {
    setSaving(true);
    const { error } = await supabase.from('doctors').update({
      primary_color: primaryColor,
      secondary_color: primaryColor,
    }).eq('id', doctor.id);
    setSaving(false);
    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ['doctor'] });
    setStep(3);
  };

  const completeOnboarding = async () => {
    await supabase.from('doctors').update({ onboarding_completed: true } as any).eq('id', doctor.id);
    queryClient.invalidateQueries({ queryKey: ['doctor'] });
    navigate('/dashboard', { replace: true });
  };

  const skipStep = () => {
    if (step < 3) setStep(step + 1);
    else completeOnboarding();
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(patientUrl);
    setCopied(true);
    triggerConfetti();
    toast({ title: '✅ Link copiado!' });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = `Olá! Agora você pode consultar substituições alimentares no meu link: ${patientUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    triggerConfetti();
  };

  const shareInstagram = () => {
    navigator.clipboard.writeText(patientUrl);
    toast({ title: '✅ Link copiado!', description: 'Cole no seu perfil do Instagram.' });
    triggerConfetti();
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AltfoodIcon size="sm" />
            <span className="font-logo font-bold text-foreground">Altfood</span>
          </div>
          <button onClick={skipStep} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <SkipForward className="w-3 h-3" /> Pular por agora
          </button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="max-w-2xl mx-auto w-full px-4 pt-6">
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full h-1.5 rounded-full overflow-hidden bg-muted">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: 'hsl(var(--primary))' }}
                  initial={{ width: '0%' }}
                  animate={{ width: i <= step ? '100%' : '0%' }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                />
              </div>
              <span className={`text-[10px] font-medium ${i <= step ? 'text-primary' : 'text-muted-foreground'}`}>
                {s}
              </span>
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
            {/* Step 1: Welcome */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
                <Card className="rounded-2xl shadow-lg border-border/50">
                  <CardContent className="p-8 text-center space-y-6">
                    <AltfoodIcon size="xl" className="mx-auto" />
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">
                        Bem-vindo ao Altfood, {firstName}! 🎉
                      </h1>
                      <p className="text-muted-foreground mt-2 leading-relaxed">
                        Sua página de pacientes já está no ar. Vamos configurá-la em 2 minutos.
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4 flex items-center gap-3">
                      <ExternalLink className="w-5 h-5 text-primary shrink-0" />
                      <code className="text-sm text-foreground font-medium truncate flex-1 text-left">{patientUrl}</code>
                    </div>
                    <Button onClick={() => setStep(1)} className="w-full rounded-xl h-12 bg-primary hover:bg-primary/90 text-base gap-2">
                      Começar configuração <ArrowRight className="w-5 h-5" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Profile */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
                <Card className="rounded-2xl shadow-lg border-border/50">
                  <CardContent className="p-6 space-y-5">
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-foreground">Configure seu perfil</h2>
                      <p className="text-sm text-muted-foreground mt-1">Seus pacientes verão essas informações</p>
                    </div>

                    {/* Avatar color picker */}
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-md"
                        style={{ background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}cc)` }}
                      >
                        {initials}
                      </div>
                      <div className="flex gap-2 flex-wrap justify-center">
                        {COLORS.map(c => (
                          <button
                            key={c}
                            onClick={() => setAvatarColor(c)}
                            className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                            style={{
                              backgroundColor: c,
                              borderColor: avatarColor === c ? 'hsl(var(--foreground))' : 'transparent',
                              transform: avatarColor === c ? 'scale(1.15)' : undefined,
                            }}
                          />
                        ))}
                      </div>
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
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Bio curta</Label>
                        <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Ex: Especialista em nutrição esportiva e emagrecimento saudável." className="rounded-xl min-h-[80px] resize-none" maxLength={200} />
                        <p className="text-[10px] text-muted-foreground text-right">{bio.length}/200</p>
                      </div>
                    </div>

                    <Button onClick={saveProfile} className="w-full rounded-xl h-12 bg-primary hover:bg-primary/90 text-base gap-2" disabled={saving}>
                      {saving && <Loader2 className="animate-spin w-4 h-4" />}
                      Salvar e continuar <ArrowRight className="w-5 h-5" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Customize */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
                <Card className="rounded-2xl shadow-lg border-border/50">
                  <CardContent className="p-6 space-y-5">
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-foreground">Personalize sua página</h2>
                      <p className="text-sm text-muted-foreground mt-1">Escolha a cor que combina com você</p>
                    </div>

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

                    {/* Live preview */}
                    <div className="border border-border rounded-2xl overflow-hidden">
                      <div className="p-4 border-b border-border" style={{ backgroundColor: `${primaryColor}08` }}>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}
                          >
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{doctor.name}</p>
                            <p className="text-xs text-muted-foreground">{specialty} · {documentNumber || 'CRM'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="h-10 rounded-xl bg-muted/50 border border-border flex items-center px-3">
                          <span className="text-xs text-muted-foreground">🔍 Buscar alimento...</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {['🥩 Carnes', '🥛 Laticínios', '🌾 Cereais'].map(cat => (
                            <div
                              key={cat}
                              className="rounded-xl p-2.5 text-center text-[10px] font-medium border"
                              style={{
                                backgroundColor: `${primaryColor}10`,
                                borderColor: `${primaryColor}25`,
                                color: primaryColor,
                              }}
                            >
                              {cat}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button onClick={saveColor} className="w-full rounded-xl h-12 bg-primary hover:bg-primary/90 text-base gap-2" disabled={saving}>
                      {saving && <Loader2 className="animate-spin w-4 h-4" />}
                      Ficou ótimo! Continuar <ArrowRight className="w-5 h-5" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 4: Share */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
                <Card className="rounded-2xl shadow-lg border-border/50">
                  <CardContent className="p-8 text-center space-y-6">
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                      <Share2 className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Compartilhe com seus pacientes!</h2>
                      <p className="text-sm text-muted-foreground mt-1">Envie seu link para que eles encontrem substituições alimentares</p>
                    </div>

                    {/* URL pill */}
                    <button
                      onClick={copyLink}
                      className="w-full flex items-center gap-3 bg-primary/10 hover:bg-primary/15 px-5 py-4 rounded-2xl transition-colors group"
                    >
                      <code className="text-sm flex-1 truncate text-left font-semibold text-primary">{patientUrl}</code>
                      {copied ? <Check className="w-5 h-5 text-primary shrink-0" /> : <Copy className="w-5 h-5 text-primary/60 shrink-0 group-hover:text-primary" />}
                    </button>

                    {/* Share buttons */}
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={shareWhatsApp}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-green-300 hover:bg-green-50 transition-colors"
                      >
                        <MessageCircle className="w-6 h-6 text-green-600" />
                        <span className="text-xs font-medium text-foreground">WhatsApp</span>
                      </button>
                      <button
                        onClick={shareInstagram}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-pink-300 hover:bg-pink-50 transition-colors"
                      >
                        <svg className="w-6 h-6 text-pink-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                        </svg>
                        <span className="text-xs font-medium text-foreground">Instagram</span>
                      </button>
                      <button
                        onClick={copyLink}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors"
                      >
                        <Copy className="w-6 h-6 text-primary" />
                        <span className="text-xs font-medium text-foreground">Copiar link</span>
                      </button>
                    </div>

                    <Button onClick={completeOnboarding} className="w-full rounded-xl h-12 bg-primary hover:bg-primary/90 text-base gap-2">
                      Ir para meu dashboard <ArrowRight className="w-5 h-5" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Skip link below card */}
          <div className="text-center mt-4">
            <button onClick={skipStep} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pular por agora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
