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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const userId = claimsData.claims.sub;

    const { plan } = await req.json();

    // Get doctor
    const { data: doctor, error: docErr } = await supabase
      .from('doctors')
      .select('id, name, email')
      .eq('user_id', userId)
      .single();

    if (docErr || !doctor) {
      return new Response(JSON.stringify({ error: 'Doctor not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'Payment service not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const isAnnual = plan === 'annual';
    const price = isAnnual ? 358.80 : 47.90;
    const title = isAnnual ? 'Altfood Pro — Anual (12 meses)' : 'Altfood Pro — Mensal';
    const origin = req.headers.get('origin') || 'https://altfood.com';

    const preference = {
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
      external_reference: `${doctor.id}|${plan}`,
      statement_descriptor: 'ALTFOOD PRO',
    };

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    });

    if (!mpRes.ok) {
      const err = await mpRes.text();
      console.error('MP error:', err);
      return new Response(JSON.stringify({ error: 'Failed to create checkout' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const mpData = await mpRes.json();

    return new Response(
      JSON.stringify({ checkout_url: mpData.init_point }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
