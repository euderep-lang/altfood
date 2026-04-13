import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import AltfoodIcon from '@/components/AltfoodIcon';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { setPendingCheckoutPlan } from '@/lib/checkoutIntent';
import { formatProMonthlyWithPeriod, formatRefundGuaranteeShort } from '@/lib/subscriptionPricing';

const CREATE_CHECKOUT_TIMEOUT_MS = 28_000;

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
  /** Evita re-disparar create-checkout quando `user` troca de referência após refresh de sessão (causava piscar / loop). */
  const userId = user?.id;

  const plan = searchParams.get('plan') === 'annual' ? 'annual' : 'monthly';
  const checkoutReturnPath = `/checkout?plan=${plan}`;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const planLabel = 'Altfood PRO — Mensal';
  const priceLabel = formatProMonthlyWithPeriod();

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!userId) {
      setPendingCheckoutPlan('monthly');
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchCheckout = async () => {
      setLoading(true);
      setError(null);

      const { data: authData, error: authReadError } = await supabase.auth.getSession();
      if (cancelled) return;
      if (authReadError || !authData.session?.access_token) {
        setError('Sessão não disponível ou expirada. Entre de novo e abra o checkout outra vez.');
        setLoading(false);
        return;
      }

      const { error: refreshErr } = await supabase.auth.refreshSession();
      if (cancelled) return;
      if (refreshErr) {
        console.warn('[checkout] refreshSession:', refreshErr.message);
      }

      try {
        const invokePromise = supabase.functions.invoke('create-checkout', {
          body: { plan: 'monthly' },
        });
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(
            () =>
              reject(
                new Error(
                  'Tempo esgotado ao preparar o pagamento. Verifique se a edge function create-checkout está deployada e os secrets da Abacate Pay no Supabase.',
                ),
              ),
            CREATE_CHECKOUT_TIMEOUT_MS,
          );
        });
        const { data, error } = await Promise.race([invokePromise, timeoutPromise]);

        if (cancelled) return;

        if (error) {
          const detail = await messageFromInvokeError(error);
          console.error('[checkout] create-checkout falhou:', error, detail);
          throw new Error(detail);
        }
        const url = data && typeof (data as { checkout_url?: string }).checkout_url === 'string'
          ? (data as { checkout_url: string }).checkout_url
          : '';
        if (!url) throw new Error('Link de pagamento não retornado pela Abacate Pay.');
        if (cancelled) return;
        window.location.assign(url);
        return;
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar checkout');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchCheckout();

    return () => {
      cancelled = true;
    };
  }, [authLoading, userId]);

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
              Cobrança mensal recorrente. Acesso após confirmação do pagamento. {formatRefundGuaranteeShort()}.
            </p>
          </div>
          <span className="text-lg font-bold text-primary">{priceLabel}</span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          {!authLoading && !user && (
            <div className="text-center py-8 space-y-4">
              <p className="text-sm text-foreground font-medium">Entre ou crie uma conta para concluir o pagamento</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Você será redirecionado para o checkout seguro da Abacate Pay (Pix e cartão). Depois de entrar, continue aqui.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button asChild className="rounded-xl">
                  <Link to={`/login?next=${encodeURIComponent(checkoutReturnPath)}`}>Já tenho conta</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-xl">
                  <Link to={`/register?next=${encodeURIComponent(checkoutReturnPath)}`}>Criar conta</Link>
                </Button>
              </div>
            </div>
          )}

          {(authLoading || (user && loading)) && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {authLoading ? 'Verificando sua sessão...' : 'Abrindo checkout seguro da Abacate Pay...'}
              </p>
            </div>
          )}

          {!authLoading && user && error && (
            <div className="text-center py-10">
              <p className="text-sm text-destructive">{error}</p>
              <button type="button" onClick={() => window.location.reload()} className="mt-4 text-sm text-primary underline">
                Tentar novamente
              </button>
            </div>
          )}

        </div>

        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          Pagamento processado pela Abacate Pay
        </div>
      </main>
    </div>
  );
}
