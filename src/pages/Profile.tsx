import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDoctor } from '@/hooks/useDoctor';
import { useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X, Leaf } from 'lucide-react';
import { formatPhone, daysRemaining, formatDate } from '@/lib/helpers';
import { useAuth } from '@/hooks/useAuth';

export default function Profile() {
  const { data: doctor, isLoading } = useDoctor();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

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
  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const formatPhoneInput = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };

  const savePersonal = async () => {
    setSaving(true);
    const { error } = await supabase.from('doctors').update({
      name: getField('name'),
      phone: getField('phone').replace(/\D/g, ''),
      document_type: getField('document_type'),
      document_number: getField('document_number'),
      specialty: getField('specialty'),
    }).eq('id', doctor.id);
    setSaving(false);
    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Dados atualizados!' });
      queryClient.invalidateQueries({ queryKey: ['doctor'] });
    }
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande', description: 'Máximo 2MB', variant: 'destructive' });
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const removeLogo = async () => {
    setLogoFile(null);
    setLogoPreview(null);
    await supabase.from('doctors').update({ logo_url: null }).eq('id', doctor.id);
    queryClient.invalidateQueries({ queryKey: ['doctor'] });
    toast({ title: 'Logo removido' });
  };

  const saveBranding = async () => {
    setUploadingLogo(true);
    let logoUrl = doctor.logo_url;

    if (logoFile && user) {
      const ext = logoFile.name.split('.').pop();
      const path = `${user.id}/logo.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('doctor-logos').upload(path, logoFile, { upsert: true });
      if (uploadErr) {
        toast({ title: 'Erro ao enviar logo', description: uploadErr.message, variant: 'destructive' });
        setUploadingLogo(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('doctor-logos').getPublicUrl(path);
      logoUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from('doctors').update({
      logo_url: logoUrl,
      primary_color: getField('primary_color'),
      secondary_color: getField('secondary_color'),
    }).eq('id', doctor.id);

    setUploadingLogo(false);
    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Identidade visual atualizada!' });
      queryClient.invalidateQueries({ queryKey: ['doctor'] });
    }
  };

  const statusBadge = () => {
    switch (doctor.subscription_status) {
      case 'trial': return <Badge className="bg-warning/20 text-warning border-warning/30 text-base px-4 py-1">🟡 Trial</Badge>;
      case 'active': return <Badge className="bg-success/20 text-success border-success/30 text-base px-4 py-1">🟢 Ativa</Badge>;
      default: return <Badge variant="destructive" className="text-base px-4 py-1">🔴 Inativa</Badge>;
    }
  };

  const primaryColor = getField('primary_color') || '#0F766E';
  const displayPhone = getField('phone') ? formatPhoneInput(getField('phone')) : '';

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Perfil</h1>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="w-full grid grid-cols-3 rounded-xl">
            <TabsTrigger value="personal" className="rounded-lg text-xs sm:text-sm">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="branding" className="rounded-lg text-xs sm:text-sm">Identidade Visual</TabsTrigger>
            <TabsTrigger value="subscription" className="rounded-lg text-xs sm:text-sm">Assinatura</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-4 space-y-4 pt-6">
                <div className="space-y-1.5">
                  <Label>Nome</Label>
                  <Input value={getField('name')} onChange={e => update('name', e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>E-mail</Label>
                  <Input value={doctor.email} disabled className="rounded-xl bg-muted" />
                </div>
                <div className="space-y-1.5">
                  <Label>Telefone</Label>
                  <Input value={displayPhone} onChange={e => update('phone', formatPhoneInput(e.target.value))} placeholder="(11) 99999-9999" className="rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Registro</Label>
                    <Select value={getField('document_type')} onValueChange={v => update('document_type', v)}>
                      <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CRM">CRM</SelectItem>
                        <SelectItem value="CRN">CRN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Número</Label>
                    <Input value={getField('document_number')} onChange={e => update('document_number', e.target.value)} className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Especialidade</Label>
                  <Input value={getField('specialty')} onChange={e => update('specialty', e.target.value)} className="rounded-xl" />
                </div>
                <Button onClick={savePersonal} className="w-full rounded-xl" disabled={saving}>
                  {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                  Salvar alterações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding">
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-4 space-y-4 pt-6">
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    {logoPreview || doctor.logo_url ? (
                      <img src={logoPreview || doctor.logo_url || ''} alt="Logo" className="mx-auto h-20 object-contain" />
                    ) : (
                      <div className="text-muted-foreground">
                        <Upload className="mx-auto h-8 w-8 mb-2" />
                        <p className="text-sm">Clique ou arraste para enviar</p>
                        <p className="text-xs">PNG, JPG ou WebP • Máx. 2MB</p>
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoSelect} />
                  {(logoPreview || doctor.logo_url) && (
                    <Button variant="ghost" size="sm" onClick={removeLogo} className="text-destructive">
                      <X className="w-4 h-4 mr-1" /> Remover logo
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Cor primária</Label>
                    <div className="flex gap-2">
                      <input type="color" value={primaryColor} onChange={e => update('primary_color', e.target.value)} className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                      <Input value={primaryColor} onChange={e => update('primary_color', e.target.value)} className="rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Cor secundária</Label>
                    <div className="flex gap-2">
                      <input type="color" value={getField('secondary_color') || '#059669'} onChange={e => update('secondary_color', e.target.value)} className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                      <Input value={getField('secondary_color') || '#059669'} onChange={e => update('secondary_color', e.target.value)} className="rounded-xl" />
                    </div>
                  </div>
                </div>

                {/* Live preview */}
                <div className="space-y-2">
                  <Label>Prévia</Label>
                  <div className="border border-border rounded-xl p-4" style={{ borderColor: primaryColor }}>
                    <div className="flex items-center gap-3">
                      {logoPreview || doctor.logo_url ? (
                        <img src={logoPreview || doctor.logo_url || ''} alt="Logo" className="h-10 w-10 object-contain rounded-lg" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: primaryColor, color: '#fff' }}>
                          {doctor.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-sm" style={{ color: primaryColor }}>{doctor.name}</p>
                        <p className="text-xs text-muted-foreground">{doctor.document_type} {doctor.document_number}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button onClick={saveBranding} className="w-full rounded-xl" disabled={uploadingLogo}>
                  {uploadingLogo ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                  Salvar identidade visual
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription">
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-4 space-y-4 pt-6 text-center">
                <div>{statusBadge()}</div>
                {doctor.subscription_status === 'trial' && (
                  <p className="text-muted-foreground">
                    Trial expira em: <strong className="text-foreground">{formatDate(doctor.trial_ends_at)}</strong>
                    <br />({daysRemaining(doctor.trial_ends_at)} dias restantes)
                  </p>
                )}
                {doctor.subscription_end_date && doctor.subscription_status === 'active' && (
                  <p className="text-muted-foreground">
                    Próxima cobrança: <strong className="text-foreground">{formatDate(doctor.subscription_end_date)}</strong>
                  </p>
                )}
                {(doctor.subscription_status === 'inactive' || (doctor.subscription_status === 'trial' && daysRemaining(doctor.trial_ends_at) <= 7)) && (
                  <Card className="rounded-xl border-warning/30 bg-warning/5">
                    <CardContent className="p-4">
                      <p className="text-sm text-foreground mb-3">
                        {doctor.subscription_status === 'inactive'
                          ? 'Sua assinatura está inativa. Reative para continuar atendendo seus pacientes.'
                          : 'Seu trial está acabando! Assine para não perder acesso.'}
                      </p>
                      <Button className="rounded-xl w-full">Assinar por R$ 97/mês</Button>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
