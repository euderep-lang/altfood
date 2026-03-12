import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDoctor } from '@/hooks/useDoctor';
import { LayoutDashboard, User, HelpCircle, LogOut, Leaf, Loader2, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { daysRemaining } from '@/lib/helpers';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/stats', icon: BarChart3, label: 'Estatísticas' },
  { to: '/dashboard/profile', icon: User, label: 'Perfil' },
  { to: '/dashboard/support', icon: HelpCircle, label: 'Suporte' },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { signOut, loading: authLoading } = useAuth();
  const { data: doctor, isLoading } = useDoctor();
  const location = useLocation();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">Altfood</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
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
      <div className="flex-1 flex flex-col min-h-screen pb-16 md:pb-0">
        {subscriptionBanner()}
        <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around items-center h-16 z-50">
        {navItems.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              'flex flex-col items-center gap-0.5 text-xs py-1 px-3',
              location.pathname === item.to ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        ))}
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center gap-0.5 text-xs py-1 px-3 text-muted-foreground"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </nav>
    </div>
  );
}
