import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('MP Webhook received:', JSON.stringify(body));

    // Mercado Pago sends different notification types
    if (body.type !== 'payment' && body.action !== 'payment.created' && body.action !== 'payment.updated') {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      console.log('No payment ID in webhook');
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch payment details from Mercado Pago
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!accessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN not configured');
      return new Response(JSON.stringify({ error: 'Not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!mpRes.ok) {
      const errText = await mpRes.text();
      console.error('Failed to fetch payment:', errText);
      return new Response(JSON.stringify({ error: 'Failed to fetch payment' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payment = await mpRes.json();
    console.log('Payment status:', payment.status, 'external_reference:', payment.external_reference);

    // Only process approved payments
    if (payment.status !== 'approved') {
      console.log('Payment not approved, skipping. Status:', payment.status);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse external_reference: "doctor_id|plan"
    const externalRef = payment.external_reference;
    if (!externalRef || !externalRef.includes('|')) {
      console.error('Invalid external_reference:', externalRef);
      return new Response(JSON.stringify({ error: 'Invalid reference' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const [doctorId, plan] = externalRef.split('|');
    const isAnnual = plan === 'annual';

    // Calculate subscription end date
    const now = new Date();
    const endDate = new Date(now);
    if (isAnnual) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Update doctor subscription using service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { error: updateErr } = await supabase
      .from('doctors')
      .update({
        subscription_status: 'active',
        subscription_end_date: endDate.toISOString(),
        mp_subscription_id: String(paymentId),
        mp_payer_email: payment.payer?.email || null,
      })
      .eq('id', doctorId);

    // Save payment record
    await supabase.from('payments').insert({
      doctor_id: doctorId,
      mp_payment_id: String(paymentId),
      amount: payment.transaction_amount || (isAnnual ? 358.80 : 47.90),
      currency: payment.currency_id || 'BRL',
      plan: plan,
      status: 'approved',
      payer_email: payment.payer?.email || null,
      paid_at: new Date().toISOString(),
    });

    if (updateErr) {
      console.error('Failed to update doctor:', updateErr);
      return new Response(JSON.stringify({ error: 'Database update failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Doctor ${doctorId} upgraded to Pro (${plan}) until ${endDate.toISOString()}`);

    // === Referral reward: grant 1 month to whoever referred this doctor ===
    const { data: doctor } = await supabase
      .from('doctors')
      .select('referred_by')
      .eq('id', doctorId)
      .single();

    if (doctor?.referred_by) {
      // Check for pending referral
      const { data: referral } = await supabase
        .from('referrals')
        .select('id, status')
        .eq('referred_id', doctorId)
        .eq('referrer_id', doctor.referred_by)
        .eq('status', 'pending')
        .maybeSingle();

      if (referral) {
        // Get referrer's current subscription info
        const { data: referrer } = await supabase
          .from('doctors')
          .select('subscription_end_date, subscription_status, trial_ends_at')
          .eq('id', doctor.referred_by)
          .single();

        if (referrer) {
          const baseDate = referrer.subscription_status === 'active' && referrer.subscription_end_date
            ? new Date(referrer.subscription_end_date)
            : referrer.subscription_status === 'trial'
            ? new Date(referrer.trial_ends_at)
            : new Date();
          const newEnd = new Date(Math.max(baseDate.getTime(), Date.now()) + 30 * 24 * 60 * 60 * 1000);

          if (referrer.subscription_status === 'active') {
            await supabase.from('doctors').update({ subscription_end_date: newEnd.toISOString() }).eq('id', doctor.referred_by);
          } else {
            await supabase.from('doctors').update({
              subscription_status: 'active',
              subscription_end_date: newEnd.toISOString(),
            }).eq('id', doctor.referred_by);
          }

          // Mark referral as completed
          await supabase.from('referrals').update({
            status: 'completed',
            reward_given_at: new Date().toISOString(),
          }).eq('id', referral.id);

          console.log(`Referral reward granted to doctor ${doctor.referred_by} for referring ${doctorId}`);
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
