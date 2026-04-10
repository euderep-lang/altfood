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

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: doctor, error: docErr } = await supabase
      .from("doctors")
      .select(
        "id, subscription_status, subscription_end_date, stripe_subscription_id",
      )
      .eq("user_id", userId)
      .single();

    if (docErr || !doctor) {
      return new Response(JSON.stringify({ error: "Doctor not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (doctor.subscription_status !== "active") {
      return new Response(JSON.stringify({ error: "No active subscription to cancel" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
    let accessUntil = doctor.subscription_end_date;

    if (secretKey && doctor.stripe_subscription_id) {
      try {
        const stripe = new Stripe(secretKey, {
          httpClient: Stripe.createFetchHttpClient(),
        });
        const sub = await stripe.subscriptions.update(
          doctor.stripe_subscription_id,
          { cancel_at_period_end: true },
        );
        accessUntil = new Date(sub.current_period_end * 1000).toISOString();

        await supabase.from("doctors").update({
          subscription_end_date: accessUntil,
        }).eq("id", doctor.id);
      } catch (stripeErr) {
        console.error("Stripe cancel_at_period_end error:", stripeErr);
        return new Response(
          JSON.stringify({ error: "Could not cancel subscription with Stripe" }),
          {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    const { error: updateErr } = await supabase
      .from("doctors")
      .update({ subscription_status: "cancelled" })
      .eq("id", doctor.id);

    if (updateErr) {
      return new Response(JSON.stringify({ error: "Failed to cancel subscription" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Doctor ${doctor.id} subscription cancelled. Access until ${accessUntil}`);

    return new Response(
      JSON.stringify({
        ok: true,
        access_until: accessUntil,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Cancel error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
