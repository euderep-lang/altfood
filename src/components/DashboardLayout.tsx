import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDoctor } from '@/hooks/useDoctor';
import { LayoutDashboard, User, HelpCircle, LogOut, Loader2, BarChart3, ExternalLink, X, Wallet } from 'lucide-react';
import AltfoodIcon from '@/components/AltfoodIcon';
import { cn } from '@/lib/utils';
import { daysRemaining } from '@/lib/helpers';
import SupportWidget from '@/components/SupportWidget';
import NpsSurvey from '@/components/NpsSurvey';
import { AnimatePresence, motion } from 'framer-motion';

const sidebarNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/stats', icon: BarChart3, label: 'Estatísticas' },
  { to: '/dashboard/profile', icon: User, label: 'Perfil' },
  { to: '/dashboard/support', icon: HelpCircle, label: 'Suporte' },
];

const mobileTabItems = [
  { to: '/dashboard', emoji: '🏠', label: 'Início' },
  { to: '/dashboard/stats', emoji: '📊', label: 'Estatísticas' },
  { to: '__patient__', emoji: '🔗', label: 'Minha página' },
  { to: '/dashboard/profile', emoji: '👤', label: 'Perfil' },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { signOut, loading: authLoading } = useAuth();
  const { data: doctor, isLoading } = useDoctor();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);

  // Listen for SW update
  useEffect(() => {
    const handler = () => setShowUpdateBanner(true);
    window.addEventListener('sw-update-available', handler);
    return () => window.removeEventListener('sw-update-available', handler);
  }, []);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const patientUrl = doctor ? `${window.location.origin}/p/${doctor.slug}` : '';

  const subscriptionBanner = () => {
    if (!doctor) return null;
    if (doctor.subscription_status === 'trial') {
      const days = daysRemaining(doctor.trial_ends_at);
      return (
        <div className="bg-warning/10 border-b border-warning/20 px-4 py-2.5 text-sm text-center">
          <span className="font-medium text-warning">⏰ Período trial — {days} dias restantes.</span>
          {' '}Assine para continuar.
        </div>
      );
    }
    if (doctor.subscription_status === 'inactive') {
      return (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2.5 text-sm text-center">
          <span className="font-medium text-destructive">⚠️ Assinatura inativa</span>
          {' '}— Reative para seus pacientes continuarem acessando.
        </div>
      );
    }
    return null;
  };

  const isActiveTab = (to: string) => {
    if (to === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(to);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Update banner */}
      <AnimatePresence>
        {showUpdateBanner && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[60] bg-primary text-primary-foreground px-4 py-3 flex items-center justify-center gap-3"
          >
            <span className="text-sm font-medium">Nova versão disponível!</span>
            <button
              onClick={() => window.location.reload()}
              className="text-sm font-bold underline underline-offset-2"
            >
              Toque para atualizar →
            </button>
            <button onClick={() => setShowUpdateBanner(false)} className="absolute right-3">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2">
            <AltfoodIcon size="sm" />
            <span className="font-logo font-bold text-lg text-foreground">Altfood</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {sidebarNav.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                location.pathname === item.to
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0">
        {subscriptionBanner()}
        <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border flex justify-around items-center h-16 z-50 safe-area-bottom">
        {mobileTabItems.map(item => {
          if (item.to === '__patient__') {
            return (
              <a
                key={item.to}
                href={patientUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-0.5 text-xs py-1 px-3 text-muted-foreground"
              >
                <span className="text-lg">{item.emoji}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </a>
            );
          }
          const active = isActiveTab(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-col items-center gap-0.5 text-xs py-1 px-3 relative',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <span className="text-lg">{item.emoji}</span>
              <span className={cn('text-[10px]', active ? 'font-bold' : 'font-medium')}>{item.label}</span>
              {active && (
                <motion.div
                  layoutId="dashboard-tab-indicator"
                  className="absolute -bottom-0 w-6 h-0.5 rounded-full bg-primary"
                />
              )}
            </Link>
          );
        })}
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center gap-0.5 text-xs py-1 px-3 text-muted-foreground"
        >
          <span className="text-lg">🚪</span>
          <span className="text-[10px] font-medium">Sair</span>
        </button>
      </nav>

      <SupportWidget />
      <NpsSurvey />
    </div>
  );
}