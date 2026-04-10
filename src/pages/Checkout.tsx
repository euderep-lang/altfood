import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import AltfoodIcon from '@/components/AltfoodIcon';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, { locale: 'pt-BR' });

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const plan = searchParams.get('plan') || 'monthly';
  const isAnnual = plan === 'annual';

  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const planLabel = isAnnual ? 'Altfood Pro — Anual' : 'Altfood Pro — Mensal';
  const priceLabel = isAnnual ? 'R$ 358,80/ano' : 'R$ 47,90/mês';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchPreference = async () => {
      setLoading(true);
      setError(null);
      setPreferenceId(null);

      try {
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: { plan },
        });

        if (error) throw error;
        if (!data?.preference_id) throw new Error('Preferência não gerada');
        setPreferenceId(data.preference_id);
      } catch (err: any) {
        setError(err?.message || 'Erro ao carregar checkout');
      } finally {
        setLoading(false);
      }
    };

    fetchPreference();
  }, [user, plan, navigate]);

  const initialization = useMemo(() => {
    return {
      amount: isAnnual ? 358.8 : 47.9,
      preferenceId: preferenceId ?? '',
    };
  }, [isAnnual, preferenceId]);

  const customization = useMemo(() => {
    return {
      paymentMethods: {
        creditCard: 'all',
        debitCard: 'all',
        ticket: 'all',
        bankTransfer: 'all',
        atm: 'all',
      },
      visual: {
        style: {
          theme: 'default',
          customVariables: {
            baseColor: '#0F766E',
          },
        },
      },
    };
  }, []);

  const onSubmit = async () => {
    // O Brick cuida do envio — o webhook MP notifica o backend
    return new Promise<void>((resolve) => resolve());
  };

  const onError = (e: any) => {
    console.error('MP Brick error:', e);
    setError('Erro no processamento. Tente novamente.');
  };

  const onReady = () => {
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <AltfoodIcon size="sm" />
            <span className="font-logo font-bold text-lg text-foreground">Altfood</span>
          </Link>
          <Link
            to="/planos"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar aos planos
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">{planLabel}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isAnnual
                ? 'Cobrança única anual — economize R$ 215,40'
                : 'Cobrança mensal recorrente. Cancele quando quiser.'}
            </p>
          </div>
          <span className="text-lg font-bold text-primary">{priceLabel}</span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Carregando formas de pagamento...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-10">
              <p className="text-sm text-destructive">{error}</p>
              <button onClick={() => window.location.reload()} className="mt-4 text-sm text-primary underline">
                Tentar novamente
              </button>
            </div>
          )}

          {!error && preferenceId && (
            <Payment
              initialization={initialization as any}
              customization={customization as any}
              onSubmit={onSubmit}
              onReady={onReady}
              onError={onError}
            />
          )}
        </div>

        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          Pagamento seguro processado pelo Mercado Pago
        </div>
      </main>
    </div>
  );
}

