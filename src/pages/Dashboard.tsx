import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDoctor } from '@/hooks/useDoctor';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Eye, Search, Leaf, Crown, Copy, Share2, ExternalLink, Palette, Users, Loader2, Sparkles, ArrowUpRight } from 'lucide-react';
import { formatDateTime, formatNumber, daysRemaining } from '@/lib/helpers';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Link, Navigate } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

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

  const { data: foodCount = 0 } = useQuery({
    queryKey: ['foodCount'],
    queryFn: async () => {
      const { count } = await supabase.from('foods').select('*', { count: 'exact', head: true }).eq('is_active', true);
      return count || 0;
    },
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
  const initials = doctor.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const isTrial = doctor.subscription_status === 'trial';
  const isInactive = doctor.subscription_status === 'inactive';
  const trialDays = isTrial ? daysRemaining(doctor.trial_ends_at) : 0;

  const copyLink = async () => {
    await navigator.clipboard.writeText(patientUrl);
    toast({ title: '✅ Link copiado!', description: 'Cole e envie para seus pacientes.' });
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

  const thisMonthViews = pageViews.filter(pv => {
    const d = new Date(pv.viewed_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const uniqueVisitors = new Set(pageViews.map(pv => pv.ip_hash).filter(Boolean)).size;

  const planLabel = isTrial ? 'Trial' : isInactive ? 'Inativo' : 'Ativo';
  const planColor = isTrial ? 'text-warning' : isInactive ? 'text-destructive' : 'text-primary';

  const stats = [
    { label: 'Visitantes únicos', value: formatNumber(uniqueVisitors), icon: Users, bg: 'bg-primary/10', iconColor: 'text-primary' },
    { label: 'Visualizações este mês', value: formatNumber(thisMonthViews), icon: Eye, bg: 'bg-secondary/10', iconColor: 'text-secondary' },
    { label: 'Alimentos no banco', value: formatNumber(foodCount), icon: Leaf, bg: 'bg-accent', iconColor: 'text-accent-foreground' },
    { label: 'Plano atual', value: planLabel, icon: Crown, bg: isTrial ? 'bg-warning/10' : isInactive ? 'bg-destructive/10' : 'bg-primary/10', iconColor: planColor, isCta: isTrial || isInactive },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial="hidden" animate="visible" custom={0} variants={fadeUp}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {doctor.logo_url ? (
              <img src={doctor.logo_url} alt={doctor.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-border shadow-sm" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-sm">
                <span className="text-primary-foreground font-bold text-lg">{initials}</span>
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">Olá, {doctor.name.split(' ')[0]}!</h1>
              <p className="text-sm text-muted-foreground">{doctor.specialty} · {doctor.document_type} {doctor.document_number || ''}</p>
            </div>
          </div>
          <Button onClick={copyLink} variant="outline" className="rounded-xl gap-2 shrink-0">
            <Copy className="w-4 h-4" />
            Meu perfil público
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <motion.div key={s.label} custom={i + 1} variants={fadeUp}>
              <Card className="rounded-2xl shadow-sm border-border/50 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                    <s.icon className={`w-5 h-5 ${s.iconColor}`} />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  {s.isCta && (
                    <Button size="sm" className="mt-2 rounded-lg text-xs h-7 gap-1 bg-primary hover:bg-primary/90">
                      <Sparkles className="w-3 h-3" /> Fazer upgrade
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial="hidden" animate="visible" custom={5} variants={fadeUp}>
          <div className="flex flex-wrap gap-2">
            <Link to="/dashboard/profile">
              <Button variant="outline" className="rounded-xl gap-2">
                <Palette className="w-4 h-4" /> Personalizar minha página
              </Button>
            </Link>
            <Button variant="outline" className="rounded-xl gap-2" onClick={shareLink}>
              <Share2 className="w-4 h-4" /> Compartilhar link
            </Button>
            <a href={patientUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="rounded-xl gap-2">
                <ExternalLink className="w-4 h-4" /> Ver como paciente
              </Button>
            </a>
          </div>
        </motion.div>

        {/* Chart + Link */}
        <motion.div initial="hidden" animate="visible" custom={6} variants={fadeUp} className="grid md:grid-cols-5 gap-4">
          <Card className="rounded-2xl shadow-sm md:col-span-3 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Acessos — últimos 30 dias</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={dailyViews}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm md:col-span-2 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Seu link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 bg-muted p-3 rounded-xl">
                <code className="text-xs flex-1 truncate text-foreground">{patientUrl}</code>
                <Button variant="ghost" size="icon" onClick={copyLink} className="shrink-0 h-8 w-8">
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="flex justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(patientUrl)}&color=0F766E`}
                  alt="QR Code"
                  className="w-32 h-32 rounded-xl"
                  loading="lazy"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Patients / Recent Activity */}
        <motion.div initial="hidden" animate="visible" custom={7} variants={fadeUp}>
          <Card className="rounded-2xl shadow-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Atividade recente</CardTitle>
            </CardHeader>
            <CardContent>
              {queries.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <Search className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">Nenhuma consulta registrada ainda.</p>
                  <p className="text-muted-foreground text-xs mt-1">Compartilhe seu link para que pacientes comecem a buscar.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Data/Hora</th>
                        <th className="text-left py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Alimento</th>
                        <th className="text-right py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Peso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queries.slice(0, 15).map((q, i) => (
                        <tr key={q.id} className="border-b border-border/30 hover:bg-muted/50 transition-colors">
                          <td className="py-2.5 text-muted-foreground text-xs">{formatDateTime(q.queried_at)}</td>
                          <td className="py-2.5 text-foreground font-medium">{q.food_name}</td>
                          <td className="py-2.5 text-right">
                            <span className="inline-flex items-center bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-lg">
                              {q.weight_grams}g
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Plan Status */}
        {(isTrial || isInactive) && (
          <motion.div initial="hidden" animate="visible" custom={8} variants={fadeUp}>
            <Card className="rounded-2xl shadow-sm border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground">
                    {isTrial ? `Trial — ${trialDays} dias restantes` : 'Assinatura inativa'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {isTrial
                      ? 'Faça upgrade para o plano Pro e mantenha seus pacientes com acesso ilimitado.'
                      : 'Reative sua assinatura para seus pacientes continuarem acessando.'}
                  </p>
                </div>
                <Button className="rounded-xl gap-2 bg-primary hover:bg-primary/90 shrink-0">
                  <ArrowUpRight className="w-4 h-4" /> Fazer upgrade
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
