import DashboardLayout from '@/components/DashboardLayout';
import { useDoctor } from '@/hooks/useDoctor';
import { Loader2 } from 'lucide-react';
import SubscriptionManager from '@/components/SubscriptionManager';

export default function Billing() {
  const { data: doctor, isLoading } = useDoctor();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!doctor) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie sua assinatura, plano e histórico de pagamentos</p>
        </div>

        <SubscriptionManager doctor={doctor} />
      </div>
    </DashboardLayout>
  );
}
