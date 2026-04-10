# Prompt — Checkout Mercado Pago Bricks

## Objetivo
Substituir o Checkout Pro (que redireciona para o site do Mercado Pago) por uma página de checkout personalizada usando **Mercado Pago Payment Brick**, mantendo todo o fluxo de webhook intacto.

---

## Mudança 1 — Edge Function `create-checkout`

Arquivo: `supabase/functions/create-checkout/index.ts`

A função atual retorna `checkout_url` (o `init_point` do MP). Precisa passar a retornar `preference_id` para uso com o Brick.

**Troque** o return final de:
```ts
return new Response(
  JSON.stringify({ checkout_url: mpData.init_point }),
  { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
);
```

**Para:**
```ts
return new Response(
  JSON.stringify({ preference_id: mpData.id }),
  { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
);
```

Após essa mudança, fazer redeploy da função:
```bash
npx supabase functions deploy create-checkout
```

---

## Mudança 2 — Variável de ambiente

Adicionar no arquivo `.env`:
```
VITE_MP_PUBLIC_KEY="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

O valor é a **Public Key de produção** do Mercado Pago, encontrada em:
Painel MP → Seu negócio → Credenciais → **Public key** (produção)

---

## Mudança 3 — Instalar SDK do Mercado Pago

```bash
npm install @mercadopago/sdk-react
```

---

## Mudança 4 — Nova página `/checkout`

Criar arquivo `src/pages/Checkout.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import AltfoodIcon from '@/components/AltfoodIcon';

initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, { locale: 'pt-BR' });

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const plan = searchParams.get('plan') || 'monthly';

  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAnnual = plan === 'annual';
  const price = isAnnual ? 'R$ 358,80/ano' : 'R$ 47,90/mês';
  const planLabel = isAnnual ? 'Altfood Pro — Anual' : 'Altfood Pro — Mensal';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchPreference = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: { plan },
        });
        if (error) throw error;
        if (!data?.preference_id) throw new Error('Preferência não gerada');
        setPreferenceId(data.preference_id);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar checkout');
      } finally {
        setLoading(false);
      }
    };

    fetchPreference();
  }, [user, plan]);

  const initialization = {
    amount: isAnnual ? 358.80 : 47.90,
    preferenceId: preferenceId!,
  };

  const customization = {
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

  const onSubmit = async ({ selectedPaymentMethod, formData }: any) => {
    // O Brick cuida do envio — o webhook MP notifica o backend
    return new Promise<void>((resolve) => {
      resolve();
    });
  };

  const onError = (error: any) => {
    console.error('MP Brick error:', error);
    setError('Erro no processamento. Tente novamente.');
  };

  const onReady = () => {
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <AltfoodIcon size="sm" />
            <span className="font-logo font-bold text-lg text-foreground">Altfood</span>
          </Link>
          <Link to="/planos" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar aos planos
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* Resumo do plano */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">{planLabel}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isAnnual ? 'Cobrança única anual — economize R$ 215,40' : 'Cobrança mensal recorrente. Cancele quando quiser.'}
            </p>
          </div>
          <span className="text-lg font-bold text-primary">{price}</span>
        </div>

        {/* Brick de pagamento */}
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
              <button
                onClick={() => window.location.reload()}
                className="mt-4 text-sm text-primary underline"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!error && preferenceId && (
            <Payment
              initialization={initialization}
              customization={customization as any}
              onSubmit={onSubmit}
              onReady={onReady}
              onError={onError}
            />
          )}
        </div>

        {/* Segurança */}
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          Pagamento seguro processado pelo Mercado Pago
        </div>
      </main>
    </div>
  );
}
```

---

## Mudança 5 — Atualizar `Pricing.tsx`

Trocar a função `handleSubscribe` para navegar para `/checkout` em vez de chamar a edge function:

```tsx
const handleSubscribe = () => {
  if (!user) {
    navigate('/register');
    return;
  }
  navigate(`/checkout?plan=${annual ? 'annual' : 'monthly'}`);
};
```

Remover os imports de `useState` para `loading`, `useToast` e `supabase` se não forem mais usados em outro lugar da página.

---

## Mudança 6 — Adicionar rota em `App.tsx`

Adicionar import lazy:
```tsx
const Checkout = lazy(() => import('./pages/Checkout'));
```

Adicionar rota (fora do ProtectedRoute, pois o redirect interno já faz o check):
```tsx
<Route path="/checkout" element={<Checkout />} />
```

---

## Mudança 7 — Página de sucesso

A função `create-checkout` já configura `back_urls.success` como `/assinatura/sucesso`. Verificar se essa rota existe em `App.tsx`. Se não existir, criar uma página simples `src/pages/SubscriptionSuccess.tsx` (provavelmente já existe — verificar).

---

## Resultado esperado
- Usuário clica em "Assinar Pro" na página `/planos`
- É redirecionado para `/checkout?plan=monthly` (ou annual)
- Vê um resumo do plano + formulário de pagamento com cartão, PIX e boleto
- Ao pagar, o webhook do MP notifica o backend automaticamente
- Backend atualiza `subscription_status = 'active'` na tabela `doctors`
- Usuário é redirecionado para `/assinatura/sucesso`

## Observação
Todo o código de webhook (`mp-webhook`) permanece igual — não precisa de nenhuma alteração.
