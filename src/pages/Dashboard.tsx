import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDoctor } from '@/hooks/useDoctor';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Eye, Search, TrendingUp, Calendar, Copy, Share2, Loader2 } from 'lucide-react';
import { formatDateTime, formatNumber } from '@/lib/helpers';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { data: doctor } = useDoctor();
  const { toast } = useToast();

  const { data: pageViews = [] } = useQuery({
    queryKey: ['pageViews', doctor?.id],
    queryFn: async () => {
      if (!doctor) return [];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from('page_views')
        .select('*')
        .eq('doctor_id', doctor.id)
        .gte('viewed_at', thirtyDaysAgo)
        .order('viewed_at', { ascending: true });
      return data || [];
    },
    enabled: !!doctor,
  });

  const { data: queries = [] } = useQuery({
    queryKey: ['subQueries', doctor?.id],
    queryFn: async () => {
      if (!doctor) return [];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from('substitution_queries')
        .select('*')
        .eq('doctor_id', doctor.id)
        .gte('queried_at', thirtyDaysAgo)
        .order('queried_at', { ascending: false });
      return data || [];
    },
    enabled: !!doctor,
  });

  if (!doctor) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const patientUrl = `${window.location.origin}/p/${doctor.slug}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(patientUrl);
    toast({ title: 'Link copiado!' });
  };

  const shareLink = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Altfood - Substituição Alimentar', url: patientUrl });
    } else {
      copyLink();
    }
  };

  // Chart data
  const dailyViews = (() => {
    const map: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      map[key] = 0;
    }
    pageViews.forEach(pv => {
      const d = new Date(pv.viewed_at);
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      if (map[key] !== undefined) map[key]++;
    });
    return Object.entries(map).map(([date, count]) => ({ date, count }));
  })();

  const topFoods = (() => {
    const map: Record<string, number> = {};
    queries.forEach(q => {
      map[q.food_name] = (map[q.food_name] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name: name.length > 15 ? name.slice(0, 15) + '…' : name, count }));
  })();

  const uniqueDays = new Set(pageViews.map(pv => new Date(pv.viewed_at).toDateString())).size;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Acessos (30d)</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{formatNumber(pageViews.length)}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Search className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Substituições (30d)</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{formatNumber(queries.length)}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Mais buscado</span>
              </div>
              <p className="text-lg font-bold text-foreground truncate">{topFoods[0]?.name || '—'}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Dias com acesso</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{uniqueDays}</p>
            </CardContent>
          </Card>
        </div>

        {/* Patient link */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Seu link personalizado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 bg-muted p-3 rounded-xl">
              <code className="text-sm flex-1 truncate text-foreground">{patientUrl}</code>
              <Button variant="ghost" size="icon" onClick={copyLink} className="shrink-0">
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={shareLink} className="shrink-0">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(patientUrl)}`}
                alt="QR Code"
                className="w-40 h-40 rounded-xl"
                loading="lazy"
              />
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Acessos diários</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={dailyViews}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top alimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topFoods} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent activity */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Atividade recente</CardTitle>
          </CardHeader>
          <CardContent>
            {queries.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">Nenhuma consulta registrada ainda.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-medium text-muted-foreground">Data/Hora</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">Alimento</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Peso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queries.slice(0, 20).map(q => (
                      <tr key={q.id} className="border-b border-border/50">
                        <td className="py-2 text-muted-foreground">{formatDateTime(q.queried_at)}</td>
                        <td className="py-2 text-foreground">{q.food_name}</td>
                        <td className="py-2 text-right text-foreground">{q.weight_grams}g</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
