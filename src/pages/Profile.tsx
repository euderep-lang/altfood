import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useDoctor } from '@/hooks/useDoctor';
import { useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X, Check, AlertTriangle, Trash2, ExternalLink, MessageCircle, Lock, Crown, Mail } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { generateSlug, daysRemaining, formatDate } from '@/lib/helpers';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const COLOR_PRESETS = [
  '#0F766E', '#0D9488', '#059669', '#16A34A',
  '#15803D', '#166534', '#115E59', '#134E4A',
];

export default function Profile() {
  const { data: doctor, isLoading } = useDoctor();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [slugValue, setSlugValue] = useState('');
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    if (doctor) {
      setSlugValue(doctor.slug);
    }
  }, [doctor]);

  // Debounced slug check
  useEffect(() => {
    if (!doctor || slugValue === doctor.slug || !slugValue.trim()) {
      setSlugAvailable(slugValue === doctor?.slug ? null : null);
      return;
    }
    const timer = setTimeout(async () => {
      setCheckingSlug(true);
      const { data } = await supabase.from('doctors').select('id').eq('slug', slugValue).neq('id', doctor.id);
      setSlugAvailable(!data || data.length === 0);
      setCheckingSlug(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [slugValue, doctor]);

  if (isLoading || !doctor) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const getField = (key: string) => form[key] ?? (doctor as any)[key] ?? '';
  const update = (key: string, val: string) => { setForm(f => ({ ...f, [key]: val })); setSaved(false); };

  const isPro = doctor.subscription_status === 'active';
  const primaryColor = getField('primary_color') || '#0F766E';
  const initials = (getField('name') || doctor.name).split(' ').filter((w: string) => w.length > 2).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const patientUrl = `${window.location.origin}/p/${slugValue || doctor.slug}`;
  const bioLength = (getField('bio') || '').length;

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande', description: 'Máximo 2MB', variant: 'destructive' });
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setSaved(false);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    update('logo_url', '');
    setSaved(false);
  };

  const handleSave = async () => {
    if (slugAvailable !== null && !slugAvailable) {
      toast({ title: 'Slug indisponível', description: 'Escolha outro slug para continuar.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    let logoUrl = getField('logo_url') === '' ? null : doctor.logo_url;

    if (logoFile && user) {
      const ext = logoFile.name.split('.').pop();
      const path = `${user.id}/logo.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('doctor-logos').upload(path, logoFile, { upsert: true });
      if (uploadErr) {
        toast({ title: 'Erro ao enviar foto', description: uploadErr.message, variant: 'destructive' });
        setSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('doctor-logos').getPublicUrl(path);
      logoUrl = urlData.publicUrl;
    }

    const updateData: Record<string, any> = {
      name: getField('name') || doctor.name,
      specialty: getField('specialty') || doctor.specialty,
      document_number: getField('document_number'),
      primary_color: primaryColor,
      secondary_color: getField('secondary_color') || doctor.secondary_color,
      logo_url: logoUrl,
      bio: getField('bio') || null,
      whatsapp_link: getField('whatsapp_link') || null,
      instagram_link: getField('instagram_link') || null,
      welcome_message: getField('welcome_message') || null,
    };

    if (slugValue && slugValue !== doctor.slug && slugAvailable !== false) {
      updateData.slug = slugValue;
    }

    const { error } = await supabase.from('doctors').update(updateData).eq('id', doctor.id);
    setSaving(false);

    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    } else {
      setSaved(true);
      toast({ title: 'Salvo! ✓' });
      queryClient.invalidateQueries({ queryKey: ['doctor'] });
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== 'CONFIRMAR') return;
    setDeleting(true);
    await supabase.from('doctors').delete().eq('id', doctor.id);
    await signOut();
    navigate('/');
  };

  const PreviewPanel = () => (
    <div className="border border-border rounded-2xl overflow-hidden bg-background">
      {/* Preview header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          {logoPreview || (getField('logo_url') !== '' && doctor.logo_url) ? (
            <img src={logoPreview || doctor.logo_url || ''} alt="" className="h-12 w-12 rounded-xl object-contain border border-border" />
          ) : (
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`, color: '#fff' }}>
              {initials}
            </div>
          )}
          <div>
            <p className="font-bold text-sm text-foreground">{getField('name') || doctor.name}</p>
            <p className="text-xs text-muted-foreground">
              {getField('document_type') || doctor.document_type} {getField('document_number') || doctor.document_number} • {getField('specialty') || doctor.specialty}
            </p>
          </div>
        </div>
        {getField('welcome_message') && (
          <p className="text-xs text-muted-foreground mt-3 italic">"{getField('welcome_message')}"</p>
        )}
        {getField('bio') && (
          <p className="text-xs text-muted-foreground mt-2">{getField('bio')}</p>
        )}
        <div className="flex gap-2 mt-3">
          {getField('whatsapp_link') && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full" style={{ backgroundColor: '#25D36620', color: '#25D366' }}>
              <MessageCircle className="w-3 h-3" /> WhatsApp
            </span>
          )}
          {getField('instagram_link') && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full bg-pink-50 text-pink-600">
              📷 Instagram
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <div className="text-center">
          <span className="text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
            Tabela de Substituição Alimentar
          </span>
        </div>
        <div className="mt-4 rounded-xl border border-border p-3">
          <div className="h-10 bg-muted rounded-xl flex items-center px-3">
            <span className="text-xs text-muted-foreground">🔍 Buscar alimento...</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          {['🥩', '🍚', '🥗'].map((e, i) => (
            <div key={i} className="rounded-xl p-3 text-center border border-border/50" style={{ background: `${primaryColor}08` }}>
              <span className="text-lg">{e}</span>
              <p className="text-[9px] text-muted-foreground mt-1">Categoria</p>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border p-3 text-center">
        <p className="text-[10px] text-muted-foreground">Powered by <strong>Altfood</strong></p>
      </div>
    </div>
  );

  const ProLock = ({ children, label }: { children: React.ReactNode; label?: string }) => {
    if (isPro) return <>{children}</>;
    return (
      <div className="relative">
        <div className="opacity-40 pointer-events-none select-none">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Link to="/planos">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 py-2 shadow-sm cursor-pointer hover:bg-muted transition-colors">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Recurso Pro</span>
                  <Crown className="w-3.5 h-3.5 text-primary" />
                </div>
              </TooltipTrigger>
              <TooltipContent><p>Faça upgrade para desbloquear</p></TooltipContent>
            </Tooltip>
          </Link>
        </div>
      </div>
    );
  };

  const EditorPanel = () => (
    <div className="space-y-5">
      {/* Photo */}
      <ProLock>
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-5 space-y-3">
            <Label className="text-sm font-semibold">Foto de perfil</Label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => isPro && fileRef.current?.click()}
                className="w-20 h-20 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-border hover:border-primary/50 transition-colors shrink-0"
              >
                {logoPreview || (getField('logo_url') !== '' && doctor.logo_url) ? (
                  <img src={logoPreview || doctor.logo_url || ''} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`, color: '#fff' }}>
                    {initials}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={() => fileRef.current?.click()}>
                  <Upload className="w-3.5 h-3.5 mr-1" /> Enviar foto
                </Button>
                {(logoPreview || doctor.logo_url) && (
                  <Button variant="ghost" size="sm" className="rounded-lg text-xs text-destructive" onClick={removeLogo}>
                    <X className="w-3.5 h-3.5 mr-1" /> Remover
                  </Button>
                )}
                <p className="text-[10px] text-muted-foreground">PNG, JPG ou WebP • Máx. 2MB</p>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoSelect} />
          </CardContent>
        </Card>
      </ProLock>

      {/* Personal info */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-5 space-y-3">
          <Label className="text-sm font-semibold">Informações</Label>
          <div className="space-y-1.5">
            <Label className="text-xs">Nome completo</Label>
            <Input value={getField('name')} onChange={e => update('name', e.target.value)} className="rounded-xl h-11" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Especialidade</Label>
            <Input value={getField('specialty')} onChange={e => update('specialty', e.target.value)} className="rounded-xl h-11" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">CRM / CRN</Label>
            <Input value={getField('document_number')} onChange={e => update('document_number', e.target.value)} className="rounded-xl h-11" />
          </div>
          <ProLock>
            <div className="space-y-1.5">
              <Label className="text-xs">Bio curta</Label>
              <Textarea
                value={getField('bio')}
                onChange={e => { if (e.target.value.length <= 200) update('bio', e.target.value); }}
                placeholder="Ex: Nutricionista especializada em reeducação alimentar..."
                className="rounded-xl resize-none h-20"
                maxLength={200}
              />
              <p className="text-[10px] text-muted-foreground text-right">{bioLength}/200</p>
            </div>
          </ProLock>
          <ProLock>
            <div className="space-y-1.5">
              <Label className="text-xs">Mensagem de boas-vindas</Label>
              <Textarea
                value={getField('welcome_message')}
                onChange={e => update('welcome_message', e.target.value)}
                placeholder="Ex: Olá! Aqui você encontra substituições alimentares seguras."
                className="rounded-xl resize-none h-16"
              />
            </div>
          </ProLock>
        </CardContent>
      </Card>

      {/* Social links */}
      <ProLock>
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-5 space-y-3">
            <Label className="text-sm font-semibold">Links sociais</Label>
            <div className="space-y-1.5">
              <Label className="text-xs">WhatsApp (opcional)</Label>
              <Input value={getField('whatsapp_link')} onChange={e => update('whatsapp_link', e.target.value)} placeholder="https://wa.me/5511999999999" className="rounded-xl h-11" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Instagram (opcional)</Label>
              <Input value={getField('instagram_link')} onChange={e => update('instagram_link', e.target.value)} placeholder="https://instagram.com/seuusuario" className="rounded-xl h-11" />
            </div>
          </CardContent>
        </Card>
      </ProLock>

      {/* Color */}
      <ProLock>
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-5 space-y-3">
            <Label className="text-sm font-semibold">Cor principal</Label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_PRESETS.map(c => (
                <button
                  key={c}
                  onClick={() => update('primary_color', c)}
                  className="w-10 h-10 rounded-xl border-2 transition-all flex items-center justify-center"
                  style={{
                    backgroundColor: c,
                    borderColor: primaryColor === c ? '#000' : 'transparent',
                    transform: primaryColor === c ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {primaryColor === c && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
              <label className="w-10 h-10 rounded-xl border-2 border-dashed border-border cursor-pointer overflow-hidden flex items-center justify-center text-xs text-muted-foreground hover:border-primary/50 transition-colors">
                <input type="color" value={primaryColor} onChange={e => update('primary_color', e.target.value)} className="sr-only" />
                🎨
              </label>
            </div>
          </CardContent>
        </Card>
      </ProLock>

      {/* Slug */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-5 space-y-3">
          <Label className="text-sm font-semibold">Link do paciente</Label>
          <div className="flex items-center gap-1 bg-muted rounded-xl px-3 py-2">
            <span className="text-xs text-muted-foreground shrink-0">{window.location.origin}/p/</span>
            <input
              value={slugValue}
              onChange={e => setSlugValue(generateSlug(e.target.value))}
              className="bg-transparent text-sm font-medium text-foreground outline-none flex-1 min-w-0"
            />
            {checkingSlug && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground shrink-0" />}
            {!checkingSlug && slugAvailable === true && <Check className="w-4 h-4 text-green-600 shrink-0" />}
            {!checkingSlug && slugAvailable === false && <X className="w-4 h-4 text-red-500 shrink-0" />}
          </div>
          {slugAvailable === false && <p className="text-xs text-destructive">Este slug já está em uso.</p>}
          <a href={patientUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
            <ExternalLink className="w-3 h-3" /> Abrir página do paciente
          </a>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="rounded-2xl shadow-sm border-destructive/20">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <Label className="text-sm font-semibold text-destructive">Zona de perigo</Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Ao excluir sua conta, todos os dados serão removidos permanentemente. Esta ação não pode ser desfeita.
          </p>
          <div className="space-y-2">
            <Label className="text-xs">Digite <strong>CONFIRMAR</strong> para excluir</Label>
            <Input
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="CONFIRMAR"
              className="rounded-xl h-11"
            />
          </div>
          <Button
            variant="destructive"
            className="w-full rounded-xl"
            disabled={deleteConfirm !== 'CONFIRMAR' || deleting}
            onClick={handleDelete}
          >
            {deleting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Excluir minha conta
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Personalizar perfil</h1>

        {isMobile ? (
          <>
            <Tabs value={mobileTab} onValueChange={v => setMobileTab(v as 'edit' | 'preview')}>
              <TabsList className="w-full grid grid-cols-2 rounded-xl">
                <TabsTrigger value="edit" className="rounded-lg text-sm">Editar</TabsTrigger>
                <TabsTrigger value="preview" className="rounded-lg text-sm">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="mt-4">
                <EditorPanel />
              </TabsContent>
              <TabsContent value="preview" className="mt-4">
                <PreviewPanel />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="grid grid-cols-5 gap-6">
            <div className="col-span-3">
              <EditorPanel />
            </div>
            <div className="col-span-2 sticky top-6 self-start">
              <p className="text-xs font-medium text-muted-foreground mb-2">Prévia da página do paciente</p>
              <PreviewPanel />
            </div>
          </div>
        )}
      </div>

      {/* Sticky save button */}
      <div className="fixed bottom-0 left-0 right-0 md:left-60 bg-card/95 backdrop-blur-sm border-t border-border p-3 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground hidden sm:block">
            Alterações são salvas ao clicar no botão →
          </p>
          <Button onClick={handleSave} className="rounded-xl h-11 px-8 bg-primary hover:bg-primary/90 gap-2" disabled={saving}>
            {saving ? (
              <><Loader2 className="animate-spin h-4 w-4" /> Salvando...</>
            ) : saved ? (
              <><Check className="h-4 w-4" /> Salvo! ✓</>
            ) : (
              'Salvar alterações'
            )}
          </Button>
        </div>
      </div>

      {/* Bottom spacer for sticky button */}
      <div className="h-20" />
    </DashboardLayout>
  );
}
