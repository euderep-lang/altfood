import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ABACATE_API = "https://api.abacatepay.com/v2";

/** Plano único: mensal recorrente (compat: body.plan ignorado se não for monthly). */
const PLAN = "monthly" as const;

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
      .select("id, name, email")
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
    const productId =
      Deno.env.get("ABACATEPAY_PRODUCT_ID")?.trim() ||
      Deno.env.get("ABACATEPAY_PRODUCT_ID_MONTHLY")?.trim();
    if (!apiKey || !productId) {
      console.error("[create-checkout] Abacate Pay env vars missing");
      return new Response(
        JSON.stringify({
          error:
            "Pagamento não configurado no servidor. No Supabase (Edge Functions → Secrets): ABACATEPAY_API_KEY e ABACATEPAY_PRODUCT_ID (produto mensal R$ 19,90 na Abacate).",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const origin = req.headers.get("origin") || "https://altfood.com.br";

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

    console.log("[create-checkout] Abacate Pay checkout for doctor:", doctor.id, "plan:", PLAN);

    const abRes = await fetch(`${ABACATE_API}/checkouts/create`, {
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
      console.error("[create-checkout] Abacate API error:", abRes.status, rawText.slice(0, 500));
      const abMsg = String(
        json.error ?? json.message ?? rawText,
      ).slice(0, 280);
      let error = `Abacate Pay (${abRes.status}): ${abMsg}`;
      const hint =
        /version mismatch|api key/i.test(abMsg)
          ? " Crie no painel Abacate (Integração → API) uma chave nova com permissão CHECKOUT:CREATE, compatível com a API v2, e atualize o secret ABACATEPAY_API_KEY no Supabase (sem aspas nem espaços no início/fim). Chaves antigas podem ser só da API v1."
          : "";
      return new Response(
        JSON.stringify({ error: error + hint }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
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
      console.error("[create-checkout] Missing url in response:", rawText.slice(0, 400));
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
