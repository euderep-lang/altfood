import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import AltfoodIcon from '@/components/AltfoodIcon';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { setPendingCheckoutPlan } from '@/lib/checkoutIntent';

const mpPublicKey = import.meta.env.VITE_MP_PUBLIC_KEY?.trim();
if (mpPublicKey) {
  initMercadoPago(mpPublicKey, { locale: 'pt-BR' });
}

const CREATE_CHECKOUT_TIMEOUT_MS = 28_000;

/** Lê o corpo da Response da edge function. Evita depender de `instanceof` (quebra com duplicata no bundle). */
async function messageFromInvokeError(error: unknown): Promise<string> {
  const ctx =
    error && typeof error === 'object' && 'context' in error
      ? (error as { context: unknown }).context
      : null;
  if (ctx instanceof Response) {
    const status = ctx.status;
    const statusHint = status ? ` [HTTP ${status}]` : '';
    try {
      const raw = (await ctx.text()).trim();
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as { error?: string; detail?: string; message?: string; code?: number };
          if (typeof parsed.error === 'string' && parsed.error.trim()) {
            return `${parsed.error.trim()}${statusHint}`;
          }
          if (typeof parsed.message === 'string' && parsed.message.trim()) {
            const m = parsed.message.trim();
            if (m === 'Invalid JWT') {
              return `Sessão expirada ou inválida. Atualize a página ou entre de novo.${statusHint}`;
            }
            return `${m}${statusHint}`;
          }
          if (typeof parsed.detail === 'string' && parsed.detail.trim()) {
            return `${parsed.detail.trim()}${statusHint}`;
          }
        } catch {
          return `${raw.slice(0, 400)}${statusHint}`;
        }
        return `${raw.slice(0, 400)}${statusHint}`;
      }
      return `Resposta vazia da função create-checkout${statusHint}`;
    } catch {
      return `Não foi possível ler a resposta da função${statusHint}`;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Erro ao chamar função de pagamento';
}

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const plan = searchParams.get('plan') === 'annual' ? 'annual' : 'monthly';
  const isAnnual = plan === 'annual';
  const checkoutReturnPath = `/checkout?plan=${plan}`;

  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const planLabel = isAnnual ? 'Altfood Pro — Anual' : 'Altfood Pro — Mensal';
  const priceLabel = isAnnual ? 'R$ 358,80/ano' : 'R$ 47,90/mês';

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setPendingCheckoutPlan(plan);
      setPreferenceId(null);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchPreference = async () => {
      setLoading(true);
      setError(null);
      setPreferenceId(null);

      if (!mpPublicKey) {
        setError('Chave pública do Mercado Pago ausente. Configure VITE_MP_PUBLIC_KEY no deploy (ex.: Vercel).');
        setLoading(false);
        return;
      }

      const { data: authData, error: authReadError } = await supabase.auth.getSession();
      if (authReadError || !authData.session?.access_token) {
        setError('Sessão não disponível ou expirada. Entre de novo e abra o checkout outra vez.');
        setLoading(false);
        return;
      }

      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.warn('[checkout] refreshSession:', refreshError.message);
      }

      try {
        // Não enviar Authorization manual: o fetch do cliente injeta o token atual após refreshSession.
        const invokePromise = supabase.functions.invoke('create-checkout', {
          body: { plan },
        });
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(
            () =>
              reject(
                new Error(
                  'Tempo esgotado ao preparar o pagamento. Verifique se a edge function create-checkout está deployada e se o usuário já tem cadastro de profissional (doctor).'
                )
              ),
            CREATE_CHECKOUT_TIMEOUT_MS
          );
        });
        const { data, error } = await Promise.race([invokePromise, timeoutPromise]);

        if (error) {
          const detail = await messageFromInvokeError(error);
          console.error('[checkout] create-checkout falhou:', error, detail);
          throw new Error(detail);
        }
        if (!data?.preference_id) throw new Error('Preferência não gerada');
        setPreferenceId(data.preference_id);
      } catch (err: any) {
        setError(err?.message || 'Erro ao carregar checkout');
      } finally {
        setLoading(false);
      }
    };

    fetchPreference();
  }, [user, plan, authLoading]);

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
          {!user && (
            <div className="text-center py-8 space-y-4">
              <p className="text-sm text-foreground font-medium">Entre ou crie uma conta para concluir o pagamento</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                O checkout usa seus dados de profissional cadastrado. Depois de entrar, você volta aqui para pagar com cartão, Pix ou boleto.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button asChild className="rounded-xl">
                  <Link to={`/login?next=${encodeURIComponent(checkoutReturnPath)}`}>Já tenho conta</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-xl">
                  <Link to="/register">Criar conta</Link>
                </Button>
              </div>
            </div>
          )}

          {user && loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Carregando formas de pagamento...</p>
            </div>
          )}

          {user && error && (
            <div className="text-center py-10">
              <p className="text-sm text-destructive">{error}</p>
              <button onClick={() => window.location.reload()} className="mt-4 text-sm text-primary underline">
                Tentar novamente
              </button>
            </div>
          )}

          {user && !error && preferenceId && (
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

