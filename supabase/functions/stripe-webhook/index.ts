import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import Stripe from "npm:stripe@17.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

async function grantReferralReward(
  supabase: SupabaseClient,
  doctorId: string,
): Promise<void> {
  const { data: doctor } = await supabase
    .from("doctors")
    .select("referred_by")
    .eq("id", doctorId)
    .single();

  if (!doctor?.referred_by) return;

  const { data: referral } = await supabase
    .from("referrals")
    .select("id, status")
    .eq("referred_id", doctorId)
    .eq("referrer_id", doctor.referred_by)
    .eq("status", "pending")
    .maybeSingle();

  if (!referral) return;

  const { data: referrer } = await supabase
    .from("doctors")
    .select("subscription_end_date, subscription_status, trial_ends_at")
    .eq("id", doctor.referred_by)
    .single();

  if (!referrer) return;

  const baseDate =
    referrer.subscription_status === "active" && referrer.subscription_end_date
      ? new Date(referrer.subscription_end_date)
      : referrer.subscription_status === "trial"
      ? new Date(referrer.trial_ends_at)
      : new Date();
  const newEnd = new Date(
    Math.max(baseDate.getTime(), Date.now()) + 30 * 24 * 60 * 60 * 1000,
  );

  if (referrer.subscription_status === "active") {
    await supabase.from("doctors").update({
      subscription_end_date: newEnd.toISOString(),
    }).eq("id", doctor.referred_by);
  } else {
    await supabase.from("doctors").update({
      subscription_status: "active",
      subscription_end_date: newEnd.toISOString(),
    }).eq("id", doctor.referred_by);
  }

  await supabase.from("referrals").update({
    status: "completed",
    reward_given_at: new Date().toISOString(),
  }).eq("id", referral.id);

  console.log(
    `Referral reward granted to doctor ${doctor.referred_by} for referring ${doctorId}`,
  );
}

function planFromMetadata(meta: Stripe.Metadata | null): "monthly" | "annual" {
  const p = meta?.plan;
  if (p === "annual") return "annual";
  return "monthly";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!secretKey || !webhookSecret) {
    console.error("Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return new Response(JSON.stringify({ error: "Not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const stripe = new Stripe(secretKey, {
    httpClient: Stripe.createFetchHttpClient(),
  });
  const cryptoProvider = Stripe.createSubtleCryptoProvider();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      webhookSecret,
      undefined,
      cryptoProvider,
    );
  } catch (err) {
    console.error("Stripe webhook signature:", err);
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const doctorId = session.metadata?.doctor_id;
        if (!doctorId) {
          console.error("checkout.session.completed: missing doctor_id metadata");
          break;
        }

        const subId = session.subscription;
        const customerId = session.customer;
        if (typeof subId !== "string" || typeof customerId !== "string") {
          console.error("checkout.session.completed: missing subscription/customer id");
          break;
        }

        const sub = await stripe.subscriptions.retrieve(subId);
        const periodEnd = new Date(sub.current_period_end * 1000).toISOString();
        const plan = planFromMetadata(sub.metadata);

        const { error } = await supabase.from("doctors").update({
          subscription_status: "active",
          subscription_end_date: periodEnd,
          stripe_customer_id: customerId,
          stripe_subscription_id: subId,
          mp_payer_email: session.customer_details?.email ?? null,
        }).eq("id", doctorId);

        if (error) {
          console.error("Failed to update doctor after checkout:", error);
          return new Response(JSON.stringify({ error: "Database error" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        await grantReferralReward(supabase, doctorId);
        console.log(`Stripe checkout completed for doctor ${doctorId}`);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.subscription) break;

        const subId = typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription.id;

        const sub = await stripe.subscriptions.retrieve(subId);
        const doctorId = sub.metadata?.doctor_id;
        if (!doctorId) {
          console.log("invoice.paid: no doctor_id on subscription metadata");
          break;
        }

        const plan = planFromMetadata(sub.metadata);
        const invId = invoice.id;
        if (!invId) break;

        const { data: existing } = await supabase
          .from("payments")
          .select("id")
          .eq("mp_payment_id", invId)
          .maybeSingle();

        if (existing) break;

        const amount = (invoice.amount_paid ?? 0) / 100;
        const email = invoice.customer_email ?? null;

        const paidTs = invoice.status_transitions?.paid_at ?? invoice.created;
        const paidAt = paidTs
          ? new Date(paidTs * 1000).toISOString()
          : new Date().toISOString();

        await supabase.from("payments").insert({
          doctor_id: doctorId,
          mp_payment_id: invId,
          amount,
          currency: (invoice.currency ?? "brl").toUpperCase(),
          plan,
          status: "approved",
          payer_email: email,
          paid_at: paidAt,
        });

        const periodEnd = new Date(sub.current_period_end * 1000).toISOString();
        await supabase.from("doctors").update({
          subscription_end_date: periodEnd,
          subscription_status: "active",
        }).eq("id", doctorId);

        console.log(`invoice.paid recorded for doctor ${doctorId} invoice ${invId}`);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const doctorId = sub.metadata?.doctor_id;
        if (!doctorId) break;

        const periodEnd = new Date(sub.current_period_end * 1000).toISOString();

        if (sub.status === "canceled" || sub.status === "unpaid" || sub.status === "incomplete_expired") {
          await supabase.from("doctors").update({
            subscription_status: "inactive",
            subscription_end_date: null,
            stripe_subscription_id: null,
          }).eq("id", doctorId);
          console.log(`Subscription ended for doctor ${doctorId} (${sub.status})`);
          break;
        }

        if (sub.status === "active") {
          const updates: Record<string, string> = {
            subscription_end_date: periodEnd,
          };
          if (sub.cancel_at_period_end) {
            updates.subscription_status = "cancelled";
          } else {
            updates.subscription_status = "active";
          }
          await supabase.from("doctors").update(updates).eq("id", doctorId);
        }

        if (sub.status === "past_due") {
          await supabase.from("doctors").update({
            subscription_end_date: periodEnd,
          }).eq("id", doctorId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const doctorId = sub.metadata?.doctor_id;
        if (!doctorId) break;

        await supabase.from("doctors").update({
          subscription_status: "inactive",
          subscription_end_date: null,
          stripe_subscription_id: null,
        }).eq("id", doctorId);

        console.log(`Subscription deleted for doctor ${doctorId}`);
        break;
      }

      default:
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("stripe-webhook handler:", err);
    return new Response(JSON.stringify({ error: "Handler error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
