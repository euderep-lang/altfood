import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-signature, x-request-id",
};

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

/** Mercado Pago: manifest id uses query `data.id` when present; otherwise body data.id (lowercase if alphanumeric per docs). */
function resolveSignatureDataId(
  url: URL,
  body: Record<string, unknown>,
): string {
  const qp = url.searchParams.get("data.id");
  if (qp) return qp.toLowerCase();
  const raw = body?.data &&
      typeof body.data === "object" &&
      body.data !== null &&
      "id" in body.data
    ? String((body.data as { id: unknown }).id)
    : "";
  return /^[a-zA-Z0-9]+$/.test(raw) ? raw.toLowerCase() : raw;
}

async function verifyMercadoPagoSignature(
  req: Request,
  url: URL,
  body: Record<string, unknown>,
  secret: string,
): Promise<boolean> {
  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id") ?? "";
  if (!xSignature) return false;

  let ts = "";
  let v1 = "";
  for (const part of xSignature.split(",").map((p) => p.trim())) {
    if (part.startsWith("ts=")) ts = part.slice(3);
    if (part.startsWith("v1=")) v1 = part.slice(3);
  }
  if (!ts || !v1) return false;

  const dataID = resolveSignatureDataId(url, body);
  const manifest = `id:${dataID};request-id:${xRequestId};ts:${ts};`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(manifest),
  );
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return timingSafeEqual(hex, v1);
}

function extractPaymentId(
  body: Record<string, unknown>,
  url: URL,
): string | null {
  const fromData =
    body?.data &&
      typeof body.data === "object" &&
      body.data !== null &&
      "id" in body.data
      ? String((body.data as { id: unknown }).id)
      : null;
  if (fromData) return fromData;

  const qDataId = url.searchParams.get("data.id");
  if (qDataId) return qDataId;

  if (url.searchParams.get("topic") === "payment") {
    const id = url.searchParams.get("id");
    if (id) return id;
  }
  return null;
}

function isPaymentEvent(body: Record<string, unknown>, url: URL): boolean {
  if (body.type === "payment") return true;
  const action = String(body.action ?? "");
  if (
    action === "payment.created" ||
    action === "payment.updated" ||
    action.startsWith("payment.")
  ) {
    return true;
  }
  if (url.searchParams.get("topic") === "payment") return true;
  return false;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);

  if (req.method === "GET") {
    return new Response(JSON.stringify({ ok: true }), {
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
    console.log("MP Webhook received:", JSON.stringify({ url: url.pathname, body }));

    const webhookSecret = Deno.env.get("MERCADOPAGO_WEBHOOK_SECRET");
    const xSignature = req.headers.get("x-signature");
    if (webhookSecret && xSignature) {
      const ok = await verifyMercadoPagoSignature(req, url, body, webhookSecret);
      if (!ok) {
        console.error("Invalid Mercado Pago webhook signature");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (!isPaymentEvent(body, url)) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paymentId = extractPaymentId(body, url);
    if (!paymentId) {
      console.log("No payment ID in webhook");
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!accessToken) {
      console.error("MERCADOPAGO_ACCESS_TOKEN not configured");
      return new Response(JSON.stringify({ error: "Not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mpRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!mpRes.ok) {
      const errText = await mpRes.text();
      console.error("Failed to fetch payment:", errText);
      return new Response(JSON.stringify({ error: "Failed to fetch payment" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payment = await mpRes.json();
    console.log(
      "Payment status:",
      payment.status,
      "external_reference:",
      payment.external_reference,
    );

    if (payment.status !== "approved") {
      console.log("Payment not approved, skipping. Status:", payment.status);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const externalRef = payment.external_reference;
    if (!externalRef || !String(externalRef).includes("|")) {
      console.error("Invalid external_reference:", externalRef);
      return new Response(JSON.stringify({ error: "Invalid reference" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [doctorId, plan] = String(externalRef).split("|");
    const isAnnual = plan === "annual";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id")
      .eq("mp_payment_id", String(paymentId))
      .maybeSingle();

    if (existingPayment) {
      console.log("Payment already processed, idempotent ok:", paymentId);
      return new Response(JSON.stringify({ ok: true, duplicate: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { count: priorPaymentCount } = await supabase
      .from("payments")
      .select("id", { count: "exact", head: true })
      .eq("doctor_id", doctorId)
      .eq("status", "approved");
    const isFirstApprovedPayment = (priorPaymentCount ?? 0) === 0;

    const now = new Date();
    const endDate = new Date(now);
    if (isAnnual) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const refundGuaranteeUntil = new Date(now);
    refundGuaranteeUntil.setDate(refundGuaranteeUntil.getDate() + 14);
    const doctorUpdate: Record<string, unknown> = {
      subscription_status: "active",
      subscription_end_date: endDate.toISOString(),
      mp_subscription_id: String(paymentId),
      mp_payer_email: payment.payer?.email || null,
    };
    if (isFirstApprovedPayment) {
      doctorUpdate.trial_ends_at = refundGuaranteeUntil.toISOString();
    }

    const { error: updateErr } = await supabase
      .from("doctors")
      .update(doctorUpdate)
      .eq("id", doctorId);

    if (updateErr) {
      console.error("Failed to update doctor:", updateErr);
      return new Response(JSON.stringify({ error: "Database update failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: insertErr } = await supabase.from("payments").insert({
      doctor_id: doctorId,
      mp_payment_id: String(paymentId),
      amount: payment.transaction_amount ?? (isAnnual ? 358.8 : 19.9),
      currency: payment.currency_id || "BRL",
      plan: plan,
      status: "approved",
      payer_email: payment.payer?.email || null,
      paid_at: new Date().toISOString(),
    });

    if (insertErr) {
      console.error("Failed to insert payment:", insertErr);
      return new Response(JSON.stringify({ error: "Payment record failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(
      `Doctor ${doctorId} upgraded to Pro (${plan}) until ${endDate.toISOString()}`,
    );

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
            referrer.subscription_status === "active" &&
              referrer.subscription_end_date
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
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
