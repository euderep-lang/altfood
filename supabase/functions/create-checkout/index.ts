import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[create-checkout] Missing or invalid Authorization header');
      return new Response(JSON.stringify({ error: 'Sessão inválida ou expirada. Entre de novo e tente o pagamento.' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Passa o JWT explicitamente — getUser() sem token não funciona em Edge Functions
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      console.error('[create-checkout] getUser failed:', userError?.message);
      return new Response(JSON.stringify({ error: 'Sessão inválida ou expirada. Entre de novo e tente o pagamento.' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const userId = userData.user.id;
    console.log('[create-checkout] userId:', userId);

    let plan: string;
    try {
      const body = await req.json();
      plan = body?.plan;
    } catch {
      return new Response(JSON.stringify({ error: 'Plano inválido. Use ?plan=monthly ou ?plan=annual.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const planNorm = plan === 'annual' ? 'annual' : 'monthly';
    console.log('[create-checkout] plan:', planNorm);

    // Get doctor
    const { data: doctor, error: docErr } = await supabase
      .from('doctors')
      .select('id, name, email')
      .eq('user_id', userId)
      .single();

    if (docErr || !doctor) {
      console.error('[create-checkout] Doctor not found for userId:', userId, 'error:', docErr?.message);
      return new Response(
        JSON.stringify({
          error:
            'Não encontramos seu cadastro de profissional. Conclua o onboarding (dados e perfil) antes de assinar, ou entre em contato com o suporte.',
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    console.log('[create-checkout] doctor found:', doctor.id);

    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!accessToken) {
      console.error('[create-checkout] MERCADOPAGO_ACCESS_TOKEN not set');
      return new Response(
        JSON.stringify({
          error:
            'Pagamento não configurado no servidor (token Mercado Pago ausente). No Supabase: Project Settings → Edge Functions → Secrets → MERCADOPAGO_ACCESS_TOKEN.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const isAnnual = planNorm === 'annual';
    const price = isAnnual ? 358.80 : 47.90;
    const title = isAnnual ? 'Altfood Pro — Anual (12 meses)' : 'Altfood Pro — Mensal';
    const origin = req.headers.get('origin') || 'https://altfood.com.br';

    const supabaseUrl = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '');
    const notificationUrl = supabaseUrl
      ? `${supabaseUrl}/functions/v1/mp-webhook`
      : undefined;

    const preference: Record<string, unknown> = {
      items: [{
        title,
        quantity: 1,
        unit_price: price,
        currency_id: 'BRL',
      }],
      payer: {
        email: doctor.email,
      },
      back_urls: {
        success: `${origin}/assinatura/sucesso`,
        failure: `${origin}/planos`,
        pending: `${origin}/planos`,
      },
      auto_return: 'approved',
      external_reference: `${doctor.id}|${planNorm}`,
      statement_descriptor: 'ALTFOOD PRO',
      metadata: {
        doctor_id: doctor.id,
        plan: planNorm,
      },
    };

    if (notificationUrl) {
      preference.notification_url = notificationUrl;
    }

    console.log('[create-checkout] Calling MP API for doctor:', doctor.id, 'plan:', planNorm);

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    });

    if (!mpRes.ok) {
      const errBody = await mpRes.text();
      console.error('[create-checkout] MP API error status:', mpRes.status, 'body:', errBody);
      // Repassa o erro do MP para o cliente para facilitar debug
      return new Response(
        JSON.stringify({
          error: `Mercado Pago recusou a preferência (${mpRes.status}). Verifique o token de produção/teste e as credenciais da conta. Detalhe: ${errBody.slice(0, 280)}`,
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const mpData = await mpRes.json();
    console.log('[create-checkout] MP preference created:', mpData.id);

    return new Response(
      JSON.stringify({ preference_id: mpData.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[create-checkout] Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Erro interno ao preparar o pagamento. Tente de novo em instantes.', detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
