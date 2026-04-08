import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDoctor } from '@/hooks/useDoctor';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Eye, TrendingUp, TrendingDown, Download, Lock, Crown, BarChart3, Users, Calendar, Minus,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { formatNumber } from '@/lib/helpers';

const SOURCE_COLORS: Record<string, string> = {
  whatsapp: '#25D366',
  instagram: '#E1306C',
  facebook: '#1877F2',
  google: '#4285F4',
  direct: '#6B7280',
  other: '#9CA3AF',
};

const SOURCE_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  facebook: 'Facebook',
  google: 'Google',
  direct: 'Direto',
  other: 'Outro',
};

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

function ProLockOverlay() {
  return (
    <div className="absolute inset-0 z-10 backdrop-blur-md bg-background/60 rounded-2xl flex flex-col items-center justify-center gap-3 p-6">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Lock className="w-6 h-6 text-primary" />
      </div>
      <p className="text-sm font-semibold text-foreground text-center">Recurso exclusivo Pro</p>
      <p className="text-xs text-muted-foreground text-center">Pare de responder substituições — R$ 47,90/mês</p>
      <Link to="/planos">
        <Button size="sm" className="rounded-xl gap-2 bg-primary hover:bg-primary/90">
          <Crown className="w-4 h-4" /> Fazer upgrade
        </Button>
      </Link>
    </div>
  );
}

export default function Stats() {
  const { data: doctor, isLoading: loadingDoctor } = useDoctor();
  const [todayCount, setTodayCount] = useState(0);

  const isPro = doctor?.subscription_status === 'active' || doctor?.subscription_status === 'trial';

  const { data: pageViews = [], isLoading: loadingViews, error: pageViewsError } = useQuery({
    queryKey: ['stats-pageViews', doctor?.id],
    queryFn: async () => {
      if (!doctor) return [];
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('page_views')
        .select('*')
        .eq('doctor_id', doctor.id)
        .gte('viewed_at', sixtyDaysAgo)
        .order('viewed_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!doctor && isPro,
  });

  const { data: topFoods = [], error: topFoodsError } = useQuery({
    queryKey: ['stats-topFoods', doctor?.id],
    queryFn: async () => {
      if (!doctor) return [];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('substitution_queries')
        .select('food_name')
        .eq('doctor_id', doctor.id)
        .gte('queried_at', thirtyDaysAgo);
      if (error) throw error;
      if (!data) return [];
      const counts: Record<string, number> = {};
      data.forEach(q => { counts[q.food_name] = (counts[q.food_name] || 0) + 1; });
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
    },
    enabled: !!doctor && isPro,
  });

  // Realtime today count
  useEffect(() => {
    if (!doctor || !isPro) return;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayViews = pageViews.filter(pv => new Date(pv.viewed_at) >= todayStart);
    setTodayCount(todayViews.length);

    const channel = supabase
      .channel('stats-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'page_views',
        filter: `doctor_id=eq.${doctor.id}`,
      }, () => {
        setTodayCount(prev => prev + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [doctor, isPro, pageViews]);

  // Computed stats
  const { dailyViews, thisMonthCount, lastMonthCount, sourceData, bestDay } = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    let thisMonthCount = 0;
    let lastMonthCount = 0;
    const sourceCounts: Record<string, number> = {};
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];

    const thirtyDaysViews = pageViews.filter(pv => {
      const d = new Date(pv.viewed_at);
      return d >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    });

    pageViews.forEach(pv => {
      const d = new Date(pv.viewed_at);
      if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) thisMonthCount++;
      const lastM = thisMonth === 0 ? 11 : thisMonth - 1;
      const lastY = thisMonth === 0 ? thisYear - 1 : thisYear;
      if (d.getMonth() === lastM && d.getFullYear() === lastY) lastMonthCount++;
    });

    thirtyDaysViews.forEach(pv => {
      const d = new Date(pv.viewed_at);
      dayCounts[d.getDay()]++;
      const src = pv.source || 'direct';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    });

    // Daily chart
    const map: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      map[key] = 0;
    }
    thirtyDaysViews.forEach(pv => {
      const d = new Date(pv.viewed_at);
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      if (map[key] !== undefined) map[key]++;
    });
    const dailyViews = Object.entries(map).map(([date, count]) => ({ date, count }));

    const sourceData = Object.entries(sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value, label: SOURCE_LABELS[name] || name }));

    const bestDayIdx = dayCounts.indexOf(Math.max(...dayCounts));
    const bestDay = dayCounts[bestDayIdx] > 0 ? DAY_LABELS[bestDayIdx] : '—';

    return { dailyViews, thisMonthCount, lastMonthCount, sourceData, bestDay };
  }, [pageViews]);

  const monthChange = lastMonthCount > 0
    ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
    : thisMonthCount > 0 ? 100 : 0;

  const hasAnalyticsError = Boolean(pageViewsError || topFoodsError);
  const hasNoAnalyticsYet = isPro && !loadingViews && !hasAnalyticsError && pageViews.length === 0 && topFoods.length === 0;
  const publicPageUrl = doctor ? `${window.location.origin}/${doctor.slug}` : '';

  const exportCSV = () => {
    const header = 'Data,Fonte,User Agent\n';
    const rows = pageViews
      .filter(pv => new Date(pv.viewed_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .map(pv => `${new Date(pv.viewed_at).toLocaleString('pt-BR')},"${pv.source || 'direct'}","${pv.user_agent || ''}"`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `altfood-stats-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loadingDoctor) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" /> Estatísticas
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Acompanhe o desempenho da sua página</p>
          </div>
          <div className="flex items-center gap-3">
            {isPro && todayCount > 0 && (
              <span className="flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full animate-pulse">
                <span className="w-2 h-2 rounded-full bg-primary" /> {todayCount} {todayCount === 1 ? 'visita' : 'visitas'} hoje
              </span>
            )}
            {isPro && (
              <Button variant="outline" className="rounded-xl gap-2" onClick={exportCSV}>
                <Download className="w-4 h-4" /> Exportar CSV
              </Button>
            )}
          </div>
        </motion.div>

        {hasAnalyticsError && (
          <Card className="rounded-2xl border-destructive/20 bg-destructive/5 shadow-sm">
            <CardContent className="p-4 space-y-2">
              <p className="text-sm font-semibold text-foreground">Não foi possível carregar as estatísticas.</p>
              <p className="text-sm text-muted-foreground">Tente novamente em instantes. Se o problema persistir, verifique se sua página pública está abrindo normalmente.</p>
            </CardContent>
          </Card>
        )}

        {hasNoAnalyticsYet && (
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardContent className="p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Ainda não há dados para exibir.</p>
                <p className="text-sm text-muted-foreground">Abra sua página pública e faça uma busca de teste para começar a alimentar as estatísticas.</p>
              </div>
              <a href={publicPageUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="rounded-xl">Abrir minha página</Button>
              </a>
            </CardContent>
          </Card>
        )}

        {/* Summary cards */}
        <motion.div initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: 'Visitas este mês',
              value: isPro ? formatNumber(thisMonthCount) : '—',
              icon: Eye,
              extra: isPro && monthChange !== 0 ? (
                <span className={`flex items-center gap-0.5 text-xs font-medium ${monthChange > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {monthChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(monthChange)}% vs mês anterior
                </span>
              ) : isPro ? (
                <span className="flex items-center gap-0.5 text-xs text-muted-foreground"><Minus className="w-3 h-3" /> sem dados anteriores</span>
              ) : null,
            },
            {
              label: 'Mês anterior',
              value: isPro ? formatNumber(lastMonthCount) : '—',
              icon: Calendar,
            },
            {
              label: 'Melhor dia da semana',
              value: isPro ? bestDay : '—',
              icon: TrendingUp,
            },
            {
              label: 'Fontes de tráfego',
              value: isPro ? formatNumber(sourceData.length) : '—',
              icon: Users,
            },
          ].map((s, i) => (
            <motion.div key={s.label} custom={i + 1} variants={fadeUp}>
              <Card className="rounded-2xl shadow-sm border-border/50">
                <CardContent className="p-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <s.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  {s.extra}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts row */}
        <div className="grid md:grid-cols-5 gap-4">
          {/* Line chart */}
          <motion.div initial="hidden" animate="visible" custom={5} variants={fadeUp} className="md:col-span-3 relative">
            <Card className="rounded-2xl shadow-sm border-border/50 h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Visitas diárias — últimos 30 dias</CardTitle>
              </CardHeader>
              <CardContent>
                {isPro ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={dailyViews}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
                      <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Visitas" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] bg-muted/30 rounded-xl" />
                )}
              </CardContent>
            </Card>
            {!isPro && <ProLockOverlay />}
          </motion.div>

          {/* Donut chart */}
          <motion.div initial="hidden" animate="visible" custom={6} variants={fadeUp} className="md:col-span-2 relative">
            <Card className="rounded-2xl shadow-sm border-border/50 h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Fontes de tráfego</CardTitle>
              </CardHeader>
              <CardContent>
                {isPro && sourceData.length > 0 ? (
                  <div className="flex flex-col items-center">
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={sourceData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" nameKey="label">
                          {sourceData.map((entry) => (
                            <Cell key={entry.name} fill={SOURCE_COLORS[entry.name] || '#9CA3AF'} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [value, 'Visitas']} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-2 mt-2 justify-center">
                      {sourceData.map(s => (
                        <span key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SOURCE_COLORS[s.name] || '#9CA3AF' }} />
                          {s.label} ({s.value})
                        </span>
                      ))}
                    </div>
                  </div>
                ) : isPro ? (
                  <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">Sem dados ainda</div>
                ) : (
                  <div className="h-[200px] bg-muted/30 rounded-xl" />
                )}
              </CardContent>
            </Card>
            {!isPro && <ProLockOverlay />}
          </motion.div>
        </div>

        {/* Top foods */}
        <motion.div initial="hidden" animate="visible" custom={7} variants={fadeUp} className="relative">
          <Card className="rounded-2xl shadow-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Top 5 alimentos mais buscados (30 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              {isPro && topFoods.length > 0 ? (
                <div className="space-y-3">
                  {topFoods.map((food, i) => {
                    const maxCount = topFoods[0]?.count || 1;
                    const pct = (food.count / maxCount) * 100;
                    return (
                      <div key={food.name} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-muted-foreground w-5 text-right">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-foreground truncate">{food.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">{food.count}x</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : isPro ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Nenhuma busca registrada ainda.</div>
              ) : (
                <div className="h-[180px] bg-muted/30 rounded-xl" />
              )}
            </CardContent>
          </Card>
          {!isPro && <ProLockOverlay />}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
