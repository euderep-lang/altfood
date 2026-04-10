import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import Stripe from "npm:stripe@17.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    const { plan } = await req.json();
    if (plan !== "monthly" && plan !== "annual") {
      return new Response(JSON.stringify({ error: "Invalid plan" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: doctor, error: docErr } = await supabase
      .from("doctors")
      .select(
        "id, email, subscription_status, subscription_end_date, stripe_customer_id, stripe_subscription_id",
      )
      .eq("user_id", userId)
      .single();

    if (docErr || !doctor) {
      return new Response(JSON.stringify({ error: "Doctor not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const periodEnd = doctor.subscription_end_date
      ? new Date(doctor.subscription_end_date)
      : null;
    const periodStillValid = periodEnd !== null && periodEnd > new Date();

    if (doctor.subscription_status === "active") {
      return new Response(JSON.stringify({ error: "Already subscribed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (
      doctor.subscription_status === "cancelled" &&
      periodStillValid &&
      doctor.stripe_subscription_id
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Assinatura cancelada mas ainda ativa até o fim do período. Use o portal de cobrança do Stripe para reativar, ou aguarde o término para assinar de novo.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const priceMonthly = Deno.env.get("STRIPE_PRICE_MONTHLY");
    const priceAnnual = Deno.env.get("STRIPE_PRICE_ANNUAL");
    if (!secretKey || !priceMonthly || !priceAnnual) {
      console.error("Missing STRIPE_SECRET_KEY or price env vars");
      return new Response(JSON.stringify({ error: "Payment not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(secretKey, {
      httpClient: Stripe.createFetchHttpClient(),
    });

    const priceId = plan === "annual" ? priceAnnual : priceMonthly;
    const origin =
      req.headers.get("origin") ||
      Deno.env.get("STRIPE_APP_URL") ||
      "https://altfood.com";
    const base = origin.replace(/\/$/, "");

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/assinatura/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/planos`,
      metadata: {
        doctor_id: doctor.id,
        plan,
      },
      subscription_data: {
        metadata: {
          doctor_id: doctor.id,
          plan,
        },
      },
      allow_promotion_codes: true,
    };

    if (doctor.stripe_customer_id) {
      sessionParams.customer = doctor.stripe_customer_id;
    } else {
      sessionParams.customer_email = doctor.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(
      JSON.stringify({ checkout_url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("create-stripe-checkout:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
