import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDoctor } from '@/hooks/useDoctor';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Eye, Search, Leaf, Crown, Copy, Share2, ExternalLink, Palette, Users, Loader2, Sparkles, Gift, Lightbulb } from 'lucide-react';
import { formatDateTime, formatNumber, getShareableUrl } from '@/lib/helpers';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Link, Navigate } from 'react-router-dom';
import { useMemo } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const GROWTH_TIPS = [
  { emoji: '📲', tip: 'Coloque seu link do Altfood na bio do Instagram. Pacientes acessam direto pelo celular.' },
  { emoji: '💬', tip: 'Envie o link pelo WhatsApp após cada consulta. "Aqui você encontra substituições do seu plano alimentar."' },
  { emoji: '🖨️', tip: 'Imprima o QR Code e cole no consultório. Pacientes escaneiam e acessam na hora.' },
  { emoji: '📧', tip: 'Inclua o link na sua assinatura de e-mail profissional.' },
  { emoji: '🎥', tip: 'Grave um Story mostrando como seus pacientes usam o Altfood. Funciona muito!' },
  { emoji: '👥', tip: 'Indique colegas e ganhe 1 mês grátis por indicação. Use seu link de referral!' },
  { emoji: '📋', tip: 'Adicione o link do Altfood no final dos seus planos alimentares impressos.' },
];

function getBadges(doctor: any, pageViewCount: number, referralCount: number) {
  const badges = [];
  const now = new Date();
  const created = new Date(doctor.created_at);
  const monthsSince = (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth());

  if (pageViewCount > 0) badges.push({ emoji: '🌱', label: 'Primeiro acesso', desc: 'Seu primeiro paciente acessou sua página' });
  if (pageViewCount >= 100) badges.push({ emoji: '🚀', label: '100 visualizações', desc: 'Sua página já teve 100+ acessos' });
  if (monthsSince >= 1) badges.push({ emoji: '⭐', label: '1 mês no Altfood', desc: 'Você está conosco há mais de 1 mês' });
  if (referralCount > 0) badges.push({ emoji: '💚', label: 'Primeira indicação', desc: 'Você indicou seu primeiro colega' });

  return badges;
}

export default function Dashboard() {
  const { data: doctor, isLoading: doctorLoading, isError: doctorError, isFetched } = useDoctor();
  const { toast } = useToast();

  const { data: pageViews = [] } = useQuery({
    queryKey: ['pageViews', doctor?.id],
    queryFn: async () => {
      if (!doctor) return [];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('page_views')
        .select('viewed_at, ip_hash')
        .eq('doctor_id', doctor.id)
        .gte('viewed_at', thirtyDaysAgo)
        .order('viewed_at', { ascending: true })
        .limit(1000);
      if (error) throw error;
      return data || [];
    },
    enabled: !!doctor,
    staleTime: 60000,
  });

  const { data: queries = [] } = useQuery({
    queryKey: ['subQueries', doctor?.id],
    queryFn: async () => {
      if (!doctor) return [];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('substitution_queries')
        .select('id, food_name, weight_grams, queried_at')
        .eq('doctor_id', doctor.id)
        .gte('queried_at', thirtyDaysAgo)
        .order('queried_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!doctor,
    staleTime: 60000,
  });

  const { data: foodCount = 0 } = useQuery({
    queryKey: ['foodCount'],
    queryFn: async () => {
      const { count, error } = await supabase.from('foods').select('id', { count: 'exact', head: true }).eq('is_active', true);
      if (error) throw error;
      return count || 0;
    },
    staleTime: 300000,
  });

  const { data: referrals = [] } = useQuery({
    queryKey: ['referrals', doctor?.id],
    queryFn: async () => {
      if (!doctor) return [];
      const { data, error } = await supabase
        .from('referrals')
        .select('id, status, reward_given_at, created_at')
        .eq('referrer_id', doctor.id)
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!doctor,
    staleTime: 60000,
  });

  // Weekly tip based on current week
  const weeklyTip = useMemo(() => {
    const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    return GROWTH_TIPS[weekNumber % GROWTH_TIPS.length];
  }, []);

  if (doctorLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Se a query terminou (com erro ou sem dados) e não há doctor, redireciona
  if (isFetched && (!doctor || doctorError)) {
    return <Navigate to="/onboarding" replace />;
  }

  // Aguarda dados (não deve acontecer se ProtectedRoute funcionou, mas evita crash)
  if (!doctor) return null;

  if (!(doctor as any).onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  const patientUrl = `${window.location.origin}/${doctor.slug}`;
  const shareUrl = getShareableUrl(doctor.slug);
  const referralCode = (doctor as any).referral_code || '';
  const referralUrl = `${window.location.origin}/ref/${referralCode}`;
  const initials = doctor.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const cancelledButValid =
    doctor.subscription_status === 'cancelled' &&
    doctor.subscription_end_date &&
    new Date(doctor.subscription_end_date) > new Date();

  const completedReferrals = referrals.filter((r: any) => r.status === 'completed');
  const monthsEarned = completedReferrals.length;
  const badges = getBadges(doctor, pageViews.length, completedReferrals.length);

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast({ title: '✅ Link copiado!', description: 'Cole e envie para seus pacientes.' });
  };

  const copyReferralLink = async () => {
    await navigator.clipboard.writeText(referralUrl);
    toast({ title: '✅ Link de indicação copiado!', description: 'Envie para colegas profissionais.' });
  };

  const shareLink = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Altfood - Substituição Alimentar', url: shareUrl });
    } else {
      copyLink();
    }
  };

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
  const planLabel = cancelledButValid ? 'Pro (cancelado)' : 'Pro ativo';
  const planColor = cancelledButValid ? 'text-amber-600' : 'text-primary';

  const stats = [
    { label: 'Visitantes únicos', value: formatNumber(uniqueVisitors), icon: Users, bg: 'bg-primary/10', iconColor: 'text-primary' },
    { label: 'Visualizações este mês', value: formatNumber(thisMonthViews), icon: Eye, bg: 'bg-secondary/10', iconColor: 'text-secondary' },
    { label: 'Alimentos no banco', value: formatNumber(foodCount), icon: Leaf, bg: 'bg-accent', iconColor: 'text-accent-foreground' },
    { label: 'Plano atual', value: planLabel, icon: Crown, bg: cancelledButValid ? 'bg-amber-50' : 'bg-primary/10', iconColor: planColor, isCta: false },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
            <Copy className="w-4 h-4" /> Meu perfil público
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
                    <Link to="/planos">
                      <Button size="sm" className="mt-2 rounded-lg text-xs h-7 gap-1 bg-primary hover:bg-primary/90">
                        <Sparkles className="w-3 h-3" /> Fazer upgrade
                      </Button>
                    </Link>
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

        {/* Referral + Growth Tip row */}
        <motion.div initial="hidden" animate="visible" custom={6} variants={fadeUp} className="grid md:grid-cols-2 gap-4">
          {/* Referral Card */}
          <Card className="rounded-2xl shadow-sm border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Indique e ganhe</h3>
                  <p className="text-xs text-muted-foreground">1 mês grátis por indicação</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-background/80 p-2.5 rounded-xl">
                <code className="text-xs flex-1 truncate text-foreground">{referralUrl}</code>
                <Button variant="ghost" size="icon" onClick={copyReferralLink} className="shrink-0 h-8 w-8">
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{completedReferrals.length}</p>
                  <p className="text-[10px] text-muted-foreground">Indicações</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-primary">{monthsEarned}</p>
                  <p className="text-[10px] text-muted-foreground">Meses ganhos</p>
                </div>
                <div className="flex-1" />
                <Link to="/compartilhar">
                  <Button size="sm" variant="outline" className="rounded-lg text-xs gap-1">
                    <Share2 className="w-3 h-3" /> Kit de indicação
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Growth Tip */}
          <Card className="rounded-2xl shadow-sm border-border/50">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Dica da semana</h3>
                  <p className="text-xs text-muted-foreground">Para aumentar seus acessos</p>
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-sm text-foreground leading-relaxed">
                  <span className="text-lg mr-2">{weeklyTip.emoji}</span>
                  {weeklyTip.tip}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Badges */}
        {badges.length > 0 && (
          <motion.div initial="hidden" animate="visible" custom={7} variants={fadeUp}>
            <Card className="rounded-2xl shadow-sm border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Suas conquistas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {badges.map(b => (
                    <div key={b.label} className="flex items-center gap-2.5 bg-muted/50 rounded-xl px-3.5 py-2.5 border border-border/50">
                      <span className="text-xl">{b.emoji}</span>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{b.label}</p>
                        <p className="text-[10px] text-muted-foreground">{b.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Chart + Link */}
        <motion.div initial="hidden" animate="visible" custom={8} variants={fadeUp} className="grid md:grid-cols-5 gap-4">
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

        {/* Analytics Widgets */}
        {(() => {
          const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

          // Top 5 foods
          const foodCounts: Record<string, number> = {};
          queries.forEach(q => {
            foodCounts[q.food_name] = (foodCounts[q.food_name] || 0) + 1;
          });
          const topFoods = Object.entries(foodCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name: name.length > 18 ? name.slice(0, 18) + '…' : name, count }));

          // Searches by day of week
          const dayCounts = Array(7).fill(0);
          queries.forEach(q => {
            const day = new Date(q.queried_at).getDay();
            dayCounts[day]++;
          });
          const dayData = DAY_NAMES.map((name, i) => ({ name, count: dayCounts[i] }));

          // Engagement rate
          const totalSearches = queries.length;
          const totalViews = pageViews.length;
          const engagementRate = totalViews > 0 ? Math.round((totalSearches / totalViews) * 100) : 0;
          const engagementColor = engagementRate > 30 ? 'text-emerald-600' : engagementRate >= 10 ? 'text-amber-600' : 'text-destructive';
          const engagementBg = engagementRate > 30 ? 'bg-emerald-50' : engagementRate >= 10 ? 'bg-amber-50' : 'bg-destructive/5';

          return (
            <motion.div initial="hidden" animate="visible" custom={8.5} variants={fadeUp} className="grid md:grid-cols-3 gap-4">
              {/* Top 5 Foods */}
              <Card className="rounded-2xl shadow-sm border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground">Alimentos mais buscados</CardTitle>
                </CardHeader>
                <CardContent>
                  {topFoods.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-8 text-center">Nenhuma busca registrada ainda.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={topFoods} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Searches by Day of Week */}
              <Card className="rounded-2xl shadow-sm border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground">Quando seus pacientes consultam</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={dayData} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis hide allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
                      <Bar dataKey="count" fill="hsl(var(--secondary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Engagement Rate */}
              <Card className="rounded-2xl shadow-sm border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground">Taxa de engajamento</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-[160px]">
                  <div className={`w-20 h-20 rounded-2xl ${engagementBg} flex items-center justify-center mb-3`}>
                    <span className={`text-3xl font-bold ${engagementColor}`}>{engagementRate}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    dos visitantes fizeram uma busca
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 text-center mt-1">
                    {totalSearches} buscas / {totalViews} visitas (30 dias)
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })()}

        <motion.div initial="hidden" animate="visible" custom={9} variants={fadeUp}>
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
                      {queries.slice(0, 15).map((q) => (
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

      </div>
    </DashboardLayout>
  );
}
