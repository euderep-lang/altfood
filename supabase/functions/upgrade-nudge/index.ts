import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function buildNudgeHtml(name: string, viewCount: number): string {
  const firstName = name.split(" ")[0];
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8faf9;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
      <div style="background:linear-gradient(135deg,#0F766E,#059669);padding:32px 28px;text-align:center;">
        <h1 style="color:#fff;font-size:22px;margin:0;">🚀 Seus pacientes estão engajados!</h1>
      </div>
      <div style="padding:32px 28px;">
        <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Olá, ${firstName}! Sua página já teve <strong style="color:#0F766E;font-size:18px;">${viewCount} visitas</strong> neste mês. Isso mostra que seus pacientes estão usando a ferramenta!
        </p>

        <h3 style="color:#1a1a1a;font-size:15px;margin:0 0 12px;">Com o plano Pro (R$29/mês) você desbloqueia:</h3>
        <div style="margin:0 0 24px;">
          <p style="color:#555;font-size:13px;line-height:1.8;margin:0;">
            ✅ Estatísticas detalhadas de acesso<br>
            ✅ Relatório semanal por e-mail<br>
            ✅ Personalização completa da página<br>
            ✅ Logo e bio profissional<br>
            ✅ Exportar dados em CSV<br>
            ✅ Links de WhatsApp e Instagram
          </p>
        </div>

        <div style="text-align:center;">
          <a href="https://altfood.app/planos" style="display:inline-block;background:#0F766E;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:14px;font-weight:600;">Quero o plano Pro →</a>
        </div>
      </div>
      <div style="border-top:1px solid #eee;padding:20px 28px;text-align:center;">
        <p style="color:#999;font-size:11px;margin:0;">© Altfood — Substituição alimentar inteligente</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get free/trial doctors
    const { data: doctors, error: docErr } = await supabase
      .from("doctors")
      .select("id, name, email, subscription_status")
      .in("subscription_status", ["free", "trial"]);

    if (docErr) throw docErr;
    if (!doctors || doctors.length === 0) {
      return new Response(JSON.stringify({ message: "No free doctors" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    let sent = 0;

    for (const doc of doctors) {
      const { count } = await supabase
        .from("page_views")
        .select("*", { count: "exact", head: true })
        .eq("doctor_id", doc.id)
        .gte("viewed_at", monthStart.toISOString());

      if ((count || 0) >= 50) {
        const firstName = doc.name.split(" ")[0];
        const subject = `${firstName}, seus pacientes estão acessando sua página! 🚀`;
        const html = buildNudgeHtml(doc.name, count || 0);

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Altfood <noreply@altfood.app>",
            to: [doc.email],
            subject,
            html,
          }),
        });
        sent++;
      }
    }

    return new Response(JSON.stringify({ success: true, sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
