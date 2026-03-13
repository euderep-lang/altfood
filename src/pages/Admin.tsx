import { useState, useMemo } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatDate, formatNumber } from '@/lib/helpers';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import {
  Users, Crown, Eye, TrendingUp, TrendingDown, RefreshCw, Download, Search,
  ChevronLeft, ChevronRight, ArrowUpRight, Loader2, Shield, DollarSign, MessageSquare, UtensilsCrossed, Tags,
  Globe, Wrench, Database, AlertTriangle, Ban, Trash2, LogOut
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';

const PER_PAGE = 20;
const PRO_PRICE_MONTHLY = 47.90;
const PRO_PRICE_ANNUAL = 358.80; // R$ 29,90/mês × 12

function MaintenanceToggle() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: isMaintenanceOn = false } = useQuery({
    queryKey: ['maintenance-mode'],
    queryFn: async () => {
      const { data } = await supabase.from('site_settings').select('value').eq('key', 'maintenance_mode').maybeSingle();
      return data?.value === 'true';
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { error } = await supabase.from('site_settings').upsert(
        { key: 'maintenance_mode', value: String(enabled), updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
      if (error) throw error;
    },
    onSuccess: (_, enabled) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-mode'] });
      toast({ title: enabled ? '🔧 Modo manutenção ativado' : '✅ Modo manutenção desativado' });
    },
  });

  return (
    <Card className="rounded-2xl shadow-sm border-border/50">
      <CardContent className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Modo manutenção</p>
            <p className="text-xs text-muted-foreground">Exibe aviso em todas as páginas públicas</p>
          </div>
        </div>
        <Switch checked={isMaintenanceOn} onCheckedChange={(v) => toggleMutation.mutate(v)} disabled={toggleMutation.isPending} />
      </CardContent>
    </Card>
  );
}

function BackupCard() {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const exportBackup = async () => {
    setExporting(true);
    try {
      const tables = ['doctors', 'foods', 'food_categories', 'doctor_sections', 'hidden_foods', 'page_views', 'substitution_queries', 'support_tickets', 'referrals', 'nps_responses', 'patient_feedback'] as const;
      const backup: Record<string, any> = { exported_at: new Date().toISOString() };

      for (const table of tables) {
        const { data } = await supabase.from(table).select('*');
        backup[table] = data || [];
      }

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `altfood-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: '✅ Backup exportado com sucesso' });
    } catch (e: any) {
      toast({ title: 'Erro ao exportar', description: e.message, variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <Card className="rounded-2xl shadow-sm border-border/50">
      <CardContent className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
            <Database className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Backup do banco</p>
            <p className="text-xs text-muted-foreground">Último: {today}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={exportBackup} disabled={exporting}>
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {exporting ? 'Exportando...' : 'Fazer backup'}
        </Button>
      </CardContent>
    </Card>
  );
}

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export default function Admin() {
  const { isAdmin, loading: authLoading, user } = useAdmin();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<any>(null);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [doctorToUpgrade, setDoctorToUpgrade] = useState<any>(null);
  const [upgradePlan, setUpgradePlan] = useState<'monthly' | 'annual'>('monthly');
  const [upgradeRegisterPayment, setUpgradeRegisterPayment] = useState(true);

  // Fetch all doctors
  const { data: doctors = [], isLoading: doctorsLoading } = useQuery({
    queryKey: ['admin-doctors'],
    queryFn: async () => {
      const { data, error } = await supabase.from('doctors').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  // Fetch all page views (last 60 days for comparison)
  const { data: allPageViews = [] } = useQuery({
    queryKey: ['admin-page-views'],
    queryFn: async () => {
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase.rpc('admin_get_page_views_since', { since_date: sixtyDaysAgo });
      return (data || []) as { viewed_at: string }[];
    },
    enabled: isAdmin,
  });

  // Metrics computed values
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const totalDoctors = doctors.length;
  const proDoctors = doctors.filter((d: any) => d.subscription_status === 'active');
  const totalPro = proDoctors.length;
  const mrr = totalPro * PRO_PRICE;

  const activeThisMonth = doctors.filter((d: any) => new Date(d.updated_at) >= thisMonthStart).length;
  const activeLastMonth = doctors.filter((d: any) => {
    const u = new Date(d.updated_at);
    return u >= lastMonthStart && u <= lastMonthEnd;
  }).length;

  const newSignupsThisMonth = doctors.filter((d: any) => new Date(d.created_at) >= thisMonthStart).length;
  const newSignupsLastMonth = doctors.filter((d: any) => {
    const c = new Date(d.created_at);
    return c >= lastMonthStart && c <= lastMonthEnd;
  }).length;

  const proLastMonth = doctors.filter((d: any) => {
    const c = new Date(d.created_at);
    return d.subscription_status === 'active' && c <= lastMonthEnd;
  }).length;
  const mrrLastMonth = proLastMonth * PRO_PRICE;

  const viewsToday = allPageViews.filter((v: any) => new Date(v.viewed_at) >= todayStart).length;
  const viewsThisMonth = allPageViews.filter((v: any) => new Date(v.viewed_at) >= thisMonthStart).length;

  // Chart: signups last 30 days
  const signupChart = useMemo(() => {
    const map: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      map[`${d.getDate()}/${d.getMonth() + 1}`] = 0;
    }
    doctors.forEach((d: any) => {
      const dt = new Date(d.created_at);
      const key = `${dt.getDate()}/${dt.getMonth() + 1}`;
      if (map[key] !== undefined) map[key]++;
    });
    return Object.entries(map).map(([date, count]) => ({ date, count }));
  }, [doctors]);

  // Filtered & paginated doctors
  const filtered = useMemo(() => {
    let list = doctors;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((d: any) => d.name.toLowerCase().includes(q) || d.email.toLowerCase().includes(q));
    }
    if (planFilter !== 'all') {
      list = list.filter((d: any) => d.subscription_status === planFilter);
    }
    return list;
  }, [doctors, search, planFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Auth guard (after all hooks)
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
    queryClient.invalidateQueries({ queryKey: ['admin-page-views'] });
    toast({ title: '✅ Dados atualizados' });
  };

  const exportCSV = () => {
    const header = 'Nome,Email,Plano,Cadastro,Slug\n';
    const rows = filtered.map((d: any) => `"${d.name}","${d.email}","${d.subscription_status}","${formatDate(d.created_at)}","${d.slug}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `altfood-doctors-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const changePlan = async (doctorId: string, newStatus: string, insertPayment = false) => {
    const updates: any = { subscription_status: newStatus };
    if (newStatus === 'active') {
      updates.subscription_end_date = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    }
    const { error } = await supabase.from('doctors').update(updates).eq('id', doctorId);
    if (error) {
      toast({ title: 'Erro ao alterar plano', description: error.message, variant: 'destructive' });
      return;
    }
    if (insertPayment && newStatus === 'active') {
      const doctor = doctors.find((d: any) => d.id === doctorId);
      await supabase.from('payments').insert({
        doctor_id: doctorId,
        amount: PRO_PRICE,
        plan: 'monthly',
        mp_payment_id: `manual-${Date.now()}`,
        payer_email: doctor?.email || null,
        status: 'approved',
        paid_at: new Date().toISOString(),
      });
    }
    toast({ title: '✅ Plano atualizado' });
    queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
    setDialogOpen(false);
    setUpgradeDialogOpen(false);
    setDoctorToUpgrade(null);
  };

  const deleteDoctor = async (doctor: { id: string; user_id: string; email: string }) => {
    const { data, error } = await supabase.functions.invoke<{ error?: string }>('admin-delete-professional', {
      body: { doctor_id: doctor.id, user_id: doctor.user_id, email: doctor.email },
    });

    if (error || data?.error) {
      toast({
        title: 'Erro ao excluir',
        description: error?.message || data?.error || 'Não foi possível excluir o profissional.',
        variant: 'destructive',
      });
      return;
    }

    toast({ title: '✅ Profissional excluído por completo' });
    queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
    setDialogOpen(false);
    setDeleteConfirmOpen(false);
    setDoctorToDelete(null);
  };

  const blockDoctor = async (doctorId: string) => {
    const { error } = await supabase.from('doctors').update({ subscription_status: 'blocked' }).eq('id', doctorId);
    if (error) {
      toast({ title: 'Erro ao bloquear', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '🚫 Usuário bloqueado' });
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      setDialogOpen(false);
    }
  };

  const unblockDoctor = async (doctorId: string) => {
    const { error } = await supabase.from('doctors').update({ subscription_status: 'trial' }).eq('id', doctorId);
    if (error) {
      toast({ title: 'Erro ao desbloquear', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✅ Usuário desbloqueado' });
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      setDialogOpen(false);
    }
  };

  const handleAdminLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const isPaymentOk = (d: any) => {
    if (d.subscription_status === 'active') return true;
    if (d.subscription_status === 'trial') {
      return new Date(d.trial_ends_at) > new Date();
    }
    return false;
  };

  const planBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      active: { label: 'Pro', variant: 'default' },
      trial: { label: 'Trial', variant: 'secondary' },
      inactive: { label: 'Inativo', variant: 'destructive' },
      blocked: { label: 'Bloqueado', variant: 'destructive' },
    };
    const conf = map[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={conf.variant}>{conf.label}</Badge>;
  };

  const paymentBadge = (d: any) => {
    if (d.subscription_status === 'blocked') return <Badge variant="destructive">Bloqueado</Badge>;
    if (isPaymentOk(d)) return <Badge variant="default" className="bg-green-600">Em dia</Badge>;
    return <Badge variant="destructive">Pendente</Badge>;
  };

  const TrendArrow = ({ value }: { value: number }) => (
    <span className={`inline-flex items-center text-xs font-semibold gap-0.5 ${value >= 0 ? 'text-green-600' : 'text-destructive'}`}>
      {value >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {Math.abs(value)}%
    </span>
  );

  const metrics = [
    { label: 'Total de médicos', value: formatNumber(totalDoctors), icon: Users, trend: pctChange(newSignupsThisMonth, newSignupsLastMonth) },
    { label: 'Ativos este mês', value: formatNumber(activeThisMonth), icon: TrendingUp, trend: pctChange(activeThisMonth, activeLastMonth) },
    { label: 'Assinantes Pro', value: formatNumber(totalPro), icon: Crown },
    { label: 'MRR (R$)', value: `R$ ${mrr.toFixed(2).replace('.', ',')}`, icon: DollarSign, trend: pctChange(mrr, mrrLastMonth) },
    { label: 'Views hoje', value: formatNumber(viewsToday), icon: Eye },
    { label: 'Views este mês', value: formatNumber(viewsThisMonth), icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Painel Admin</h1>
              <p className="text-xs text-muted-foreground">Altfood — Visão geral</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to="/admin/alimentos">
              <Button variant="outline" size="sm" className="rounded-xl gap-2">
                <UtensilsCrossed className="w-4 h-4" /> Alimentos
              </Button>
            </Link>
            <Link to="/admin/categorias">
              <Button variant="outline" size="sm" className="rounded-xl gap-2">
                <Tags className="w-4 h-4" /> Categorias
              </Button>
            </Link>
            <Link to="/admin/suporte">
              <Button variant="outline" size="sm" className="rounded-xl gap-2">
                <MessageSquare className="w-4 h-4" /> Suporte
              </Button>
            </Link>
            <Link to="/admin/financeiro">
              <Button variant="outline" size="sm" className="rounded-xl gap-2">
                <DollarSign className="w-4 h-4" /> Financeiro
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={refreshAll}>
              <RefreshCw className="w-4 h-4" /> Atualizar
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={exportCSV}>
              <Download className="w-4 h-4" /> CSV
            </Button>
            <Button variant="ghost" size="sm" className="rounded-xl gap-2 text-muted-foreground" onClick={handleAdminLogout}>
              <LogOut className="w-4 h-4" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Custom domain banner */}
        <Card className="rounded-2xl border-primary/30 bg-primary/5 shadow-sm">
          <CardContent className="p-4 flex items-start gap-3">
            <Globe className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Domínio personalizado</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Para conectar seu domínio personalizado (ex: altfood.com.br), acesse as configurações do Lovable em <strong>Settings → Custom Domain</strong> e aponte seu DNS.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance mode + Backup */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MaintenanceToggle />
          <BackupCard />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {metrics.map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="rounded-2xl shadow-sm border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <m.icon className="w-4 h-4 text-muted-foreground" />
                    {m.trend !== undefined && <TrendArrow value={m.trend} />}
                  </div>
                  <p className="text-xl font-bold text-foreground">{m.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Signup chart */}
        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Novos cadastros — últimos 30 dias</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={signupChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Doctors table */}
        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle className="text-sm font-semibold text-foreground">Profissionais cadastrados ({filtered.length})</CardTitle>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou e-mail..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="pl-9 rounded-xl"
                  />
                </div>
                <Select value={planFilter} onValueChange={(v) => { setPlanFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-32 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Pro</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="blocked">Bloqueado</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {doctorsLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Nome</th>
                        <th className="text-left py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider hidden md:table-cell">E-mail</th>
                        <th className="text-center py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Plano</th>
                        <th className="text-center py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Pagamento</th>
                        <th className="text-left py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Cadastro</th>
                        <th className="text-right py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((d: any) => (
                        <tr key={d.id} className="border-b border-border/30 hover:bg-muted/50 transition-colors">
                          <td className="py-2.5 font-medium text-foreground">
                            <div>{d.name}</div>
                            <div className="text-xs text-muted-foreground md:hidden">{d.email}</div>
                          </td>
                          <td className="py-2.5 text-muted-foreground hidden md:table-cell">{d.email}</td>
                          <td className="py-2.5 text-center">{planBadge(d.subscription_status)}</td>
                          <td className="py-2.5 text-center">{paymentBadge(d)}</td>
                          <td className="py-2.5 text-muted-foreground text-xs hidden lg:table-cell">{formatDate(d.created_at)}</td>
                          <td className="py-2.5 text-right">
                            <Button variant="ghost" size="sm" className="rounded-lg text-xs gap-1" onClick={() => { setSelectedDoctor(d); setDialogOpen(true); }}>
                              <ArrowUpRight className="w-3 h-3" /> Ver
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Página {page} de {totalPages}
                  </p>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Doctor detail dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl max-w-lg">
          {selectedDoctor && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground">{selectedDoctor.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-muted-foreground">E-mail:</span><p className="font-medium text-foreground">{selectedDoctor.email}</p></div>
                  <div><span className="text-muted-foreground">Telefone:</span><p className="font-medium text-foreground">{selectedDoctor.phone || '—'}</p></div>
                  <div><span className="text-muted-foreground">Especialidade:</span><p className="font-medium text-foreground">{selectedDoctor.specialty}</p></div>
                  <div><span className="text-muted-foreground">Documento:</span><p className="font-medium text-foreground">{selectedDoctor.document_type} {selectedDoctor.document_number || '—'}</p></div>
                  <div><span className="text-muted-foreground">Slug:</span><p className="font-medium text-foreground">/p/{selectedDoctor.slug}</p></div>
                  <div><span className="text-muted-foreground">Cadastro:</span><p className="font-medium text-foreground">{formatDate(selectedDoctor.created_at)}</p></div>
                  <div><span className="text-muted-foreground">Plano:</span><p className="font-medium">{planBadge(selectedDoctor.subscription_status)}</p></div>
                  <div><span className="text-muted-foreground">Pagamento:</span><p className="font-medium">{paymentBadge(selectedDoctor)}</p></div>
                  <div><span className="text-muted-foreground">Trial até:</span><p className="font-medium text-foreground">{formatDate(selectedDoctor.trial_ends_at)}</p></div>
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
                {selectedDoctor.subscription_status !== 'active' && selectedDoctor.subscription_status !== 'blocked' && (
                  <Button size="sm" className="rounded-xl gap-1" onClick={() => { setDoctorToUpgrade(selectedDoctor); setUpgradeDialogOpen(true); }}>
                    <Crown className="w-3 h-3" /> Upgrade para Pro
                  </Button>
                )}
                {selectedDoctor.subscription_status === 'active' && (
                  <Button size="sm" variant="outline" className="rounded-xl gap-1" onClick={() => changePlan(selectedDoctor.id, 'inactive')}>
                    Remover Pro
                  </Button>
                )}
                {selectedDoctor.subscription_status !== 'blocked' ? (
                  <Button size="sm" variant="outline" className="rounded-xl gap-1 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => blockDoctor(selectedDoctor.id)}>
                    <Ban className="w-3 h-3" /> Bloquear
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="rounded-xl gap-1" onClick={() => unblockDoctor(selectedDoctor.id)}>
                    Desbloquear
                  </Button>
                )}
                <Button size="sm" variant="destructive" className="rounded-xl gap-1" onClick={() => { setDoctorToDelete(selectedDoctor); setDeleteConfirmOpen(true); }}>
                  <Trash2 className="w-3 h-3" /> Excluir
                </Button>
                <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setDialogOpen(false)}>
                  Fechar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Upgrade confirmation */}
      <AlertDialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Upgrade para Pro</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja registrar o pagamento de <strong>R$ {PRO_PRICE.toFixed(2).replace('.', ',')}</strong> para <strong>{doctorToUpgrade?.name}</strong> no financeiro?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => doctorToUpgrade && changePlan(doctorToUpgrade.id, 'active', false)}>
              Não, upgrade gratuito
            </Button>
            <Button size="sm" className="rounded-xl gap-1" onClick={() => doctorToUpgrade && changePlan(doctorToUpgrade.id, 'active', true)}>
              <DollarSign className="w-3 h-3" /> Sim, registrar pagamento
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cadastro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{doctorToDelete?.name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl bg-destructive hover:bg-destructive/90" onClick={() => doctorToDelete && deleteDoctor(doctorToDelete)}>
              Excluir permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
