import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ABACATE_V2 = "https://api.abacatepay.com/v2";
const ABACATE_V1 = "https://api.abacatepay.com/v1";

/** Plano único: mensal recorrente (compat: body.plan ignorado se não for monthly). */
const PLAN = "monthly" as const;

const PRO_PRICE_CENTS = 1990;

function isV2KeyVersionMismatch(status: number, rawText: string, json: Record<string, unknown>): boolean {
  if (status !== 401) return false;
  const msg = String(json.error ?? json.message ?? rawText).toLowerCase();
  return msg.includes("version mismatch");
}

function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

function v1Customer(doctor: {
  name: string;
  email: string;
  phone: string | null;
  document_number: string | null;
}) {
  const email = (doctor.email || "contato@altfood.app").trim();
  const name = (doctor.name || "Profissional").trim();
  const raw = digitsOnly(doctor.phone || "");
  const cellphone =
    raw.length >= 10
      ? `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7, 11)}`
      : "(11) 99999-9999";
  let taxId = digitsOnly(doctor.document_number || "");
  if (taxId.length < 11) taxId = "00000000191";
  if (taxId.length > 11) taxId = taxId.slice(0, 11);
  return { name, cellphone, email, taxId };
}

async function abacateCreateCheckoutV1(
  apiKey: string,
  doctor: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    document_number: string | null;
  },
  origin: string,
): Promise<{ ok: true; checkout_url: string; bill_id?: string } | { ok: false; status: number; body: string; json: Record<string, unknown> }> {
  const payload = {
    frequency: "ONE_TIME",
    methods: ["PIX", "CARD"],
    products: [
      {
        externalId: `altfood-pro-${doctor.id}`,
        name: "Altfood Pro — Mensal",
        description: "Assinatura mensal Altfood Pro",
        quantity: 1,
        price: PRO_PRICE_CENTS,
      },
    ],
    returnUrl: `${origin}/planos`,
    completionUrl: `${origin}/assinatura/sucesso`,
    externalId: `${doctor.id}|${PLAN}`,
    customer: v1Customer(doctor),
  };

  const abRes = await fetch(`${ABACATE_V1}/billing/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const rawText = await abRes.text();
  let json: Record<string, unknown> = {};
  try {
    if (rawText.trim()) json = JSON.parse(rawText) as Record<string, unknown>;
  } catch {
    /* ignore */
  }

  if (!abRes.ok) {
    return { ok: false, status: abRes.status, body: rawText, json };
  }

  const data = json.data as Record<string, unknown> | undefined;
  const checkoutUrl = data?.url ? String(data.url) : "";
  const billId = data?.id != null ? String(data.id) : "";

  if (!checkoutUrl) {
    return { ok: false, status: 500, body: rawText, json: { error: "v1 sem url" } };
  }

  return { ok: true, checkout_url: checkoutUrl, bill_id: billId || undefined };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("[create-checkout] Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ error: "Sessão inválida ou expirada. Entre de novo e tente o pagamento." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      console.error("[create-checkout] getUser failed:", userError?.message);
      return new Response(
        JSON.stringify({ error: "Sessão inválida ou expirada. Entre de novo e tente o pagamento." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const userId = userData.user.id;

    try {
      await req.json();
    } catch {
      /* body opcional */
    }

    const { data: doctor, error: docErr } = await supabase
      .from("doctors")
      .select("id, name, email, phone, document_number")
      .eq("user_id", userId)
      .single();

    if (docErr || !doctor) {
      console.error("[create-checkout] Doctor not found for userId:", userId, "error:", docErr?.message);
      return new Response(
        JSON.stringify({
          error:
            "Não encontramos seu cadastro de profissional. Conclua o onboarding (dados e perfil) antes de assinar, ou entre em contato com o suporte.",
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const apiKey = Deno.env.get("ABACATEPAY_API_KEY");
    const forceV1 = (Deno.env.get("ABACATEPAY_CHECKOUT_VERSION") || "").toLowerCase().trim() === "v1";
    const productId =
      Deno.env.get("ABACATEPAY_PRODUCT_ID")?.trim() ||
      Deno.env.get("ABACATEPAY_PRODUCT_ID_MONTHLY")?.trim();

    if (!apiKey) {
      console.error("[create-checkout] ABACATEPAY_API_KEY missing");
      return new Response(
        JSON.stringify({
          error: "Pagamento não configurado: defina ABACATEPAY_API_KEY nas secrets da função.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!forceV1 && !productId) {
      console.error("[create-checkout] Abacate v2: product id missing");
      return new Response(
        JSON.stringify({
          error:
            "Pagamento não configurado no servidor. Secrets: ABACATEPAY_API_KEY e ABACATEPAY_PRODUCT_ID (v2). Ou use ABACATEPAY_CHECKOUT_VERSION=v1 para cobrança pela API v1 (sem id de produto).",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const origin = req.headers.get("origin") || "https://altfood.com.br";

    if (forceV1) {
      console.log("[create-checkout] ABACATEPAY_CHECKOUT_VERSION=v1 → billing/create");
      const v1 = await abacateCreateCheckoutV1(apiKey, doctor, origin);
      if (!v1.ok) {
        const abMsg = String(v1.json.error ?? v1.json.message ?? v1.body).slice(0, 280);
        return new Response(
          JSON.stringify({ error: `Abacate Pay v1 (${v1.status}): ${abMsg}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(JSON.stringify({ checkout_url: v1.checkout_url, bill_id: v1.bill_id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = {
      items: [{ id: productId, quantity: 1 }],
      methods: ["PIX", "CARD"],
      returnUrl: `${origin}/planos`,
      completionUrl: `${origin}/assinatura/sucesso`,
      externalId: `${doctor.id}|${PLAN}`,
      metadata: {
        doctor_id: doctor.id,
        plan: PLAN,
        source: "altfood-checkout",
      },
    };

    console.log("[create-checkout] Abacate v2 checkouts/create doctor:", doctor.id);

    const abRes = await fetch(`${ABACATE_V2}/checkouts/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const rawText = await abRes.text();
    let json: Record<string, unknown> = {};
    try {
      if (rawText.trim()) json = JSON.parse(rawText) as Record<string, unknown>;
    } catch {
      /* ignore */
    }

    if (!abRes.ok && isV2KeyVersionMismatch(abRes.status, rawText, json)) {
      console.warn("[create-checkout] v2 401 (chave incompatível com v2) → tentando v1/billing/create");
      const v1 = await abacateCreateCheckoutV1(apiKey, doctor, origin);
      if (v1.ok) {
        return new Response(JSON.stringify({ checkout_url: v1.checkout_url, bill_id: v1.bill_id }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const abMsg = String(v1.json.error ?? v1.json.message ?? v1.body).slice(0, 280);
      return new Response(
        JSON.stringify({
          error: `Abacate Pay: a chave não aceitou a API v2 nem a v1. v2: API key version mismatch. v1 (${v1.status}): ${abMsg}`,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!abRes.ok) {
      console.error("[create-checkout] Abacate v2 API error:", abRes.status, rawText.slice(0, 500));
      const abMsg = String(json.error ?? json.message ?? rawText).slice(0, 280);
      const error = `Abacate Pay (${abRes.status}): ${abMsg}`;
      const hint =
        /version mismatch|api key/i.test(abMsg)
          ? " Crie no painel Abacate (Integração → API) uma chave com permissão CHECKOUT:CREATE para v2, ou defina ABACATEPAY_CHECKOUT_VERSION=v1 no Supabase para usar cobrança v1."
          : "";
      return new Response(JSON.stringify({ error: error + hint }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = json.data as Record<string, unknown> | undefined;
    const checkoutUrl = data?.url
      ? String(data.url)
      : typeof json.url === "string"
      ? json.url
      : "";
    const billId = data?.id != null
      ? String(data.id)
      : (json.id != null ? String(json.id) : "");

    if (!checkoutUrl) {
      console.error("[create-checkout] Missing url in v2 response:", rawText.slice(0, 400));
      return new Response(JSON.stringify({ error: "Resposta inválida da Abacate Pay (sem URL de checkout)." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ checkout_url: checkoutUrl, bill_id: billId || undefined }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[create-checkout] Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno ao preparar o pagamento. Tente de novo em instantes.", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
