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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = claimsData.claims.sub;

    // Use service role for updates
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get doctor
    const { data: doctor, error: docErr } = await supabase
      .from('doctors')
      .select('id, subscription_status, subscription_end_date, mp_subscription_id')
      .eq('user_id', userId)
      .single();

    if (docErr || !doctor) {
      return new Response(JSON.stringify({ error: 'Doctor not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (doctor.subscription_status !== 'active') {
      return new Response(JSON.stringify({ error: 'No active subscription to cancel' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Try to cancel on MercadoPago if there's a subscription/preapproval ID
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (accessToken && doctor.mp_subscription_id) {
      try {
        // Try cancelling as preapproval (subscription)
        const cancelRes = await fetch(
          `https://api.mercadopago.com/preapproval/${doctor.mp_subscription_id}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'cancelled' }),
          }
        );
        if (cancelRes.ok) {
          console.log(`MercadoPago subscription ${doctor.mp_subscription_id} cancelled`);
        } else {
          // If not a preapproval, it might be a payment ID - just log it
          console.log(`Could not cancel MP subscription ${doctor.mp_subscription_id}: ${await cancelRes.text()}`);
        }
      } catch (mpErr) {
        console.error('MercadoPago cancel error (non-blocking):', mpErr);
      }
    }

    // Update doctor: mark as cancelled but keep access until end date
    const { error: updateErr } = await supabase
      .from('doctors')
      .update({
        subscription_status: 'cancelled',
        // Keep subscription_end_date so they have access until it expires
      })
      .eq('id', doctor.id);

    if (updateErr) {
      return new Response(JSON.stringify({ error: 'Failed to cancel subscription' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Doctor ${doctor.id} subscription cancelled. Access until ${doctor.subscription_end_date}`);

    return new Response(
      JSON.stringify({
        ok: true,
        access_until: doctor.subscription_end_date,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Cancel error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
