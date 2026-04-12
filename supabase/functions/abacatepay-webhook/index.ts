import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

/** Aceita billing.paid (v1/v2) e variações; exige status PAID no payload quando aplicável. */
function isPaidBillingEvent(event: string, data: Record<string, unknown>): boolean {
  const ev = event.toLowerCase();
  if (ev === "billing.paid" || ev.endsWith(".paid")) return true;
  const status = typeof data.status === "string" ? data.status.toUpperCase() : "";
  if (status === "PAID" && (data.id || data.externalId)) return true;
  return false;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);

  if (req.method === "GET") {
    return new Response(JSON.stringify({ ok: true, provider: "abacatepay" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: Record<string, unknown> = {};
  try {
    const text = await req.text();
    if (text.trim()) body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    body = {};
  }

  try {
    const expectedSecret = Deno.env.get("ABACATEPAY_WEBHOOK_SECRET");
    const qSecret = url.searchParams.get("secret") ?? url.searchParams.get("webhookSecret") ?? "";
    if (expectedSecret) {
      if (!qSecret || !timingSafeEqual(qSecret, expectedSecret)) {
        console.error("[abacatepay-webhook] Invalid or missing secret query param");
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const event = String(body.event ?? "");
    const data = (typeof body.data === "object" && body.data !== null)
      ? body.data as Record<string, unknown>
      : {};

    console.log("[abacatepay-webhook] event:", event, "data.id:", data.id);

    if (!isPaidBillingEvent(event, data)) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const billId = data.id != null ? String(data.id) : "";
    const externalRef = data.externalId != null ? String(data.externalId) : "";
    const ref = externalRef || (typeof data.metadata === "object" && data.metadata !== null &&
        "external_ref" in (data.metadata as object)
      ? String((data.metadata as Record<string, unknown>).external_ref)
      : "");

    const combined = ref || "";
    if (!combined.includes("|")) {
      console.error("[abacatepay-webhook] Missing externalId doctor|plan:", combined, billId);
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: "no_external_ref" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [doctorId, plan] = combined.split("|");
    const isAnnual = plan === "annual"; // legado; oferta atual só mensal

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (!billId) {
      console.error("[abacatepay-webhook] Missing bill id in payload");
      return new Response(JSON.stringify({ error: "Missing bill id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { count: priorPaymentCount } = await supabase
      .from("payments")
      .select("id", { count: "exact", head: true })
      .eq("doctor_id", doctorId)
      .eq("status", "approved");
    const isFirstApprovedPayment = (priorPaymentCount ?? 0) === 0;

    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id")
      .eq("mp_payment_id", billId)
      .maybeSingle();

    if (existingPayment) {
      console.log("[abacatepay-webhook] Idempotent ok:", billId);
      return new Response(JSON.stringify({ ok: true, duplicate: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const endDate = new Date(now);
    if (isAnnual) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const customer = typeof data.customer === "object" && data.customer !== null
      ? data.customer as Record<string, unknown>
      : {};
    const payerEmail = typeof customer.email === "string" ? customer.email : null;
    const amountCents = typeof data.amount === "number" ? data.amount : (typeof data.paidAmount === "number"
      ? data.paidAmount
      : null);
    const amountBrl = amountCents != null
      ? Math.round((amountCents / 100) * 100) / 100
      : (isAnnual ? 358.8 : 19.9);

    const refundGuaranteeUntil = new Date(now);
    refundGuaranteeUntil.setDate(refundGuaranteeUntil.getDate() + 14);

    const doctorUpdate: Record<string, unknown> = {
      subscription_status: "active",
      subscription_end_date: endDate.toISOString(),
      mp_subscription_id: billId,
      mp_payer_email: payerEmail,
    };
    if (isFirstApprovedPayment) {
      doctorUpdate.trial_ends_at = refundGuaranteeUntil.toISOString();
    }

    const { error: updateErr } = await supabase
      .from("doctors")
      .update(doctorUpdate)
      .eq("id", doctorId);

    if (updateErr) {
      console.error("[abacatepay-webhook] Failed to update doctor:", updateErr);
      return new Response(JSON.stringify({ error: "Database update failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: insertErr } = await supabase.from("payments").insert({
      doctor_id: doctorId,
      mp_payment_id: billId,
      amount: amountBrl,
      currency: "BRL",
      plan: plan,
      status: "approved",
      payer_email: payerEmail,
      paid_at: new Date().toISOString(),
    });

    if (insertErr) {
      console.error("[abacatepay-webhook] Failed to insert payment:", insertErr);
      return new Response(JSON.stringify({ error: "Payment record failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[abacatepay-webhook] Doctor ${doctorId} Pro (${plan}) until ${endDate.toISOString()}`);

    const { data: doctor } = await supabase
      .from("doctors")
      .select("referred_by")
      .eq("id", doctorId)
      .single();

    if (doctor?.referred_by) {
      const { data: referral } = await supabase
        .from("referrals")
        .select("id, status")
        .eq("referred_id", doctorId)
        .eq("referrer_id", doctor.referred_by)
        .eq("status", "pending")
        .maybeSingle();

      if (referral) {
        const { data: referrer } = await supabase
          .from("doctors")
          .select("subscription_end_date, subscription_status, trial_ends_at")
          .eq("id", doctor.referred_by)
          .single();

        if (referrer) {
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
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[abacatepay-webhook] error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
