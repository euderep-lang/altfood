import { useState, useMemo } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDate, formatNumber } from '@/lib/helpers';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, Users, Crown, ArrowLeft, Loader2, Shield, Eye
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const PRO_PRICE = 29.9;

type PeriodFilter = '7d' | '30d' | '90d' | '12m' | 'all';

function getPeriodStart(filter: PeriodFilter): Date | null {
  const now = new Date();
  switch (filter) {
    case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '12m': return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    case 'all': return null;
  }
}

export default function AdminFinanceiro() {
  const { isAdmin, loading: authLoading } = useAdmin();
  const [period, setPeriod] = useState<PeriodFilter>('30d');
  const [mrrDetailOpen, setMrrDetailOpen] = useState(false);

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const { data, error } = await supabase.from('payments').select('*').order('paid_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ['admin-doctors-fin'],
    queryFn: async () => {
      const { data, error } = await supabase.from('doctors').select('id, name, email, subscription_status, created_at');
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  const doctorMap = useMemo(() => {
    const m: Record<string, { name: string; email: string }> = {};
    doctors.forEach((d: any) => { m[d.id] = { name: d.name, email: d.email }; });
    return m;
  }, [doctors]);

  const proDoctors = doctors.filter((d: any) => d.subscription_status === 'active');
  const mrr = proDoctors.length * PRO_PRICE;

  const periodStart = getPeriodStart(period);
  const filteredPayments = useMemo(() => {
    if (!periodStart) return payments;
    return payments.filter((p: any) => new Date(p.paid_at) >= periodStart);
  }, [payments, periodStart]);

  const totalRevenue = filteredPayments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
  const avgTicket = filteredPayments.length > 0 ? totalRevenue / filteredPayments.length : 0;

  // Revenue chart data
  const revenueChart = useMemo(() => {
    const map: Record<string, number> = {};
    const isLongPeriod = period === '12m' || period === 'all';

    filteredPayments.forEach((p: any) => {
      const d = new Date(p.paid_at);
      const key = isLongPeriod
        ? `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
        : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      map[key] = (map[key] || 0) + Number(p.amount);
    });

    // Sort keys
    const entries = Object.entries(map).sort((a, b) => {
      const partsA = a[0].split('/').reverse().join('');
      const partsB = b[0].split('/').reverse().join('');
      return partsA.localeCompare(partsB);
    });

    return entries.map(([date, total]) => ({ date, total: Number(total.toFixed(2)) }));
  }, [filteredPayments, period]);

  // MRR evolution chart (monthly)
  const mrrChart = useMemo(() => {
    const monthMap: Record<string, Set<string>> = {};
    payments.forEach((p: any) => {
      const d = new Date(p.paid_at);
      const key = `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      if (!monthMap[key]) monthMap[key] = new Set();
      monthMap[key].add(p.doctor_id);
    });

    const entries = Object.entries(monthMap).sort((a, b) => {
      const pa = a[0].split('/').reverse().join('');
      const pb = b[0].split('/').reverse().join('');
      return pa.localeCompare(pb);
    });

    return entries.map(([month, doctorSet]) => ({
      month,
      mrr: Number((doctorSet.size * PRO_PRICE).toFixed(2)),
      assinantes: doctorSet.size,
    }));
  }, [payments]);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }
  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  const periodLabels: Record<PeriodFilter, string> = {
    '7d': '7 dias',
    '30d': '30 dias',
    '90d': '90 dias',
    '12m': '12 meses',
    'all': 'Todo período',
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Financeiro</h1>
              <p className="text-xs text-muted-foreground">Receitas, MRR e histórico de pagamentos</p>
            </div>
          </div>
          <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
            <SelectTrigger className="w-36 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(periodLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'MRR', value: `R$ ${mrr.toFixed(2).replace('.', ',')}`, icon: DollarSign, clickable: true },
            { label: 'Receita no período', value: `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`, icon: TrendingUp },
            { label: 'Pagamentos', value: formatNumber(filteredPayments.length), icon: Crown },
            { label: 'Ticket médio', value: `R$ ${avgTicket.toFixed(2).replace('.', ',')}`, icon: Users },
          ].map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card
                className={`rounded-2xl shadow-sm border-border/50 ${m.clickable ? 'cursor-pointer hover:border-primary/40 transition-colors' : ''}`}
                onClick={m.clickable ? () => setMrrDetailOpen(true) : undefined}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <m.icon className="w-4 h-4 text-muted-foreground" />
                    {m.clickable && <Eye className="w-3 h-3 text-muted-foreground" />}
                  </div>
                  <p className="text-xl font-bold text-foreground">{m.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Revenue chart */}
        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Receita — {periodLabels[period]}</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueChart.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">Nenhum pagamento neste período</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }}
                    formatter={(value: number) => [`R$ ${value.toFixed(2).replace('.', ',')}`, 'Receita']}
                  />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* MRR evolution chart */}
        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Evolução do MRR</CardTitle>
          </CardHeader>
          <CardContent>
            {mrrChart.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">Sem dados suficientes</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={mrrChart}>
                  <defs>
                    <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }}
                    formatter={(value: number, name: string) => {
                      if (name === 'mrr') return [`R$ ${value.toFixed(2).replace('.', ',')}`, 'MRR'];
                      return [value, 'Assinantes'];
                    }}
                  />
                  <Area type="monotone" dataKey="mrr" stroke="hsl(var(--primary))" fill="url(#mrrGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Payments table */}
        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Histórico de pagamentos ({filteredPayments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
            ) : filteredPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">Nenhum pagamento encontrado</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Profissional</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="hidden md:table-cell">ID Pagamento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((p: any) => {
                      const doc = doctorMap[p.doctor_id];
                      return (
                        <TableRow key={p.id}>
                          <TableCell>
                            <div className="font-medium text-foreground">{doc?.name || 'Desconhecido'}</div>
                            <div className="text-xs text-muted-foreground">{p.payer_email || doc?.email || '—'}</div>
                          </TableCell>
                          <TableCell className="font-semibold text-foreground">
                            R$ {Number(p.amount).toFixed(2).replace('.', ',')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{p.plan === 'monthly' ? 'Mensal' : p.plan === 'yearly' ? 'Anual' : p.plan}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={p.status === 'approved' ? 'default' : 'destructive'}>
                              {p.status === 'approved' ? 'Aprovado' : p.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{formatDate(p.paid_at)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden md:table-cell font-mono">{p.mp_payment_id}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* MRR Detail Dialog */}
      <Dialog open={mrrDetailOpen} onOpenChange={setMrrDetailOpen}>
        <DialogContent className="rounded-2xl max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Composição do MRR — R$ {mrr.toFixed(2).replace('.', ',')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground mb-3">{proDoctors.length} assinante(s) ativo(s) × R$ {PRO_PRICE.toFixed(2).replace('.', ',')} / mês</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profissional</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead className="text-right">Valor/mês</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proDoctors.map((d: any) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium text-foreground">{d.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{d.email}</TableCell>
                    <TableCell className="text-right font-semibold text-foreground">R$ {PRO_PRICE.toFixed(2).replace('.', ',')}</TableCell>
                  </TableRow>
                ))}
                {proDoctors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">Nenhum assinante ativo</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
