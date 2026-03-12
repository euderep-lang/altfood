import { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatDate, formatNumber } from '@/lib/helpers';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import {
  Users, Crown, Eye, TrendingUp, TrendingDown, RefreshCw, Download, Search,
  ChevronLeft, ChevronRight, ArrowUpRight, Loader2, Shield, DollarSign
} from 'lucide-react';

const ADMIN_EMAIL = 'carine@dracarinecassol.com.br';
const PER_PAGE = 20;
const PRO_PRICE = 49.90;

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const isAdmin = !!user && user.email === ADMIN_EMAIL;

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
      const { data } = await supabase.from('page_views').select('viewed_at').gte('viewed_at', sixtyDaysAgo);
      return data || [];
    },
  });

  // Metrics
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

  const changePlan = async (doctorId: string, newStatus: string) => {
    const updates: any = { subscription_status: newStatus };
    if (newStatus === 'active') {
      updates.subscription_end_date = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    }
    const { error } = await supabase.from('doctors').update(updates).eq('id', doctorId);
    if (error) {
      toast({ title: 'Erro ao alterar plano', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✅ Plano atualizado' });
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      setDialogOpen(false);
    }
  };

  const planBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      active: { label: 'Pro', variant: 'default' },
      trial: { label: 'Trial', variant: 'secondary' },
      inactive: { label: 'Inativo', variant: 'destructive' },
    };
    const conf = map[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={conf.variant}>{conf.label}</Badge>;
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
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={refreshAll}>
              <RefreshCw className="w-4 h-4" /> Atualizar dados
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={exportCSV}>
              <Download className="w-4 h-4" /> CSV
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
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
              <CardTitle className="text-sm font-semibold text-foreground">Médicos cadastrados ({filtered.length})</CardTitle>
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
                        <th className="text-left py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Cadastro</th>
                        <th className="text-left py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Última atividade</th>
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
                          <td className="py-2.5 text-muted-foreground text-xs hidden lg:table-cell">{formatDate(d.created_at)}</td>
                          <td className="py-2.5 text-muted-foreground text-xs hidden lg:table-cell">{formatDate(d.updated_at)}</td>
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
                  <div><span className="text-muted-foreground">Trial até:</span><p className="font-medium text-foreground">{formatDate(selectedDoctor.trial_ends_at)}</p></div>
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
                {selectedDoctor.subscription_status !== 'active' && (
                  <Button size="sm" className="rounded-xl gap-1" onClick={() => changePlan(selectedDoctor.id, 'active')}>
                    <Crown className="w-3 h-3" /> Upgrade para Pro
                  </Button>
                )}
                {selectedDoctor.subscription_status === 'active' && (
                  <Button size="sm" variant="destructive" className="rounded-xl gap-1" onClick={() => changePlan(selectedDoctor.id, 'inactive')}>
                    Downgrade para Free
                  </Button>
                )}
                <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setDialogOpen(false)}>
                  Fechar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
