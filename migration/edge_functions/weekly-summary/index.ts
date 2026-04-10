import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function buildSummaryHtml(
  name: string,
  viewsThisWeek: number,
  viewsLastWeek: number,
  topFood: string,
  topSource: string
): string {
  const firstName = name.split(" ")[0];
  const change = viewsLastWeek > 0
    ? Math.round(((viewsThisWeek - viewsLastWeek) / viewsLastWeek) * 100)
    : viewsThisWeek > 0 ? 100 : 0;
  const arrow = change >= 0 ? "↑" : "↓";
  const changeColor = change >= 0 ? "#059669" : "#dc2626";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8faf9;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
      <div style="background:linear-gradient(135deg,#0F766E,#059669);padding:32px 28px;text-align:center;">
        <h1 style="color:#fff;font-size:22px;margin:0;">📊 Seu resumo semanal</h1>
        <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:6px 0 0;">Altfood — Semana anterior</p>
      </div>
      <div style="padding:32px 28px;">
        <p style="color:#555;font-size:14px;margin:0 0 24px;">Olá, ${firstName}! Aqui está o resumo da sua página na última semana.</p>
        
        <!-- Stats cards -->
        <div style="display:flex;gap:12px;margin:0 0 24px;">
          <div style="flex:1;background:#f0fdf9;border-radius:12px;padding:16px;text-align:center;">
            <p style="color:#0F766E;font-size:28px;font-weight:700;margin:0;">${viewsThisWeek}</p>
            <p style="color:#666;font-size:11px;margin:4px 0 0;">visitas esta semana</p>
            <p style="color:${changeColor};font-size:12px;font-weight:600;margin:4px 0 0;">${arrow} ${Math.abs(change)}%</p>
          </div>
        </div>

        <!-- Details -->
        <div style="background:#fafafa;border-radius:12px;padding:16px;margin:0 0 24px;">
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;">
            <span style="color:#888;font-size:13px;">🍽️ Alimento mais buscado</span>
            <span style="color:#1a1a1a;font-size:13px;font-weight:600;">${topFood || "—"}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;">
            <span style="color:#888;font-size:13px;">📱 Principal fonte de tráfego</span>
            <span style="color:#1a1a1a;font-size:13px;font-weight:600;">${topSource || "Direto"}</span>
          </div>
        </div>

        <div style="text-align:center;">
          <a href="https://altfood.app/dashboard/stats" style="display:inline-block;background:#0F766E;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:14px;font-weight:600;">Ver estatísticas completas →</a>
        </div>
      </div>
      <div style="border-top:1px solid #eee;padding:20px 28px;text-align:center;">
        <p style="color:#999;font-size:11px;margin:0;">Você recebe este email porque ativou o resumo semanal. <a href="https://altfood.app/dashboard/profile" style="color:#0F766E;">Desativar</a></p>
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

    // Get Pro doctors with weekly summary enabled
    const { data: doctors, error: docErr } = await supabase
      .from("doctors")
      .select("id, name, email, email_weekly_summary")
      .eq("subscription_status", "active")
      .eq("email_weekly_summary", true);

    if (docErr) throw docErr;
    if (!doctors || doctors.length === 0) {
      return new Response(JSON.stringify({ message: "No doctors to email" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - 7);
    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(now.getDate() - 14);

    let sent = 0;
    for (const doc of doctors) {
      // Views this week
      const { count: viewsThisWeek } = await supabase
        .from("page_views")
        .select("*", { count: "exact", head: true })
        .eq("doctor_id", doc.id)
        .gte("viewed_at", thisWeekStart.toISOString());

      // Views last week
      const { count: viewsLastWeek } = await supabase
        .from("page_views")
        .select("*", { count: "exact", head: true })
        .eq("doctor_id", doc.id)
        .gte("viewed_at", lastWeekStart.toISOString())
        .lt("viewed_at", thisWeekStart.toISOString());

      // Top food
      const { data: foods } = await supabase
        .from("substitution_queries")
        .select("food_name")
        .eq("doctor_id", doc.id)
        .gte("queried_at", thisWeekStart.toISOString())
        .limit(100);

      let topFood = "—";
      if (foods && foods.length > 0) {
        const counts: Record<string, number> = {};
        foods.forEach((f) => { counts[f.food_name] = (counts[f.food_name] || 0) + 1; });
        topFood = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
      }

      // Top source
      const { data: views } = await supabase
        .from("page_views")
        .select("referrer")
        .eq("doctor_id", doc.id)
        .gte("viewed_at", thisWeekStart.toISOString())
        .limit(200);

      let topSource = "Direto";
      if (views && views.length > 0) {
        const counts: Record<string, number> = {};
        views.forEach((v) => { const r = v.referrer || "Direto"; counts[r] = (counts[r] || 0) + 1; });
        topSource = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Direto";
      }

      const firstName = doc.name.split(" ")[0];
      const subject = `Seu resumo semanal Altfood 📊`;
      const html = buildSummaryHtml(doc.name, viewsThisWeek || 0, viewsLastWeek || 0, topFood, topSource);

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Altfood <onboarding@resend.dev>",
          to: [doc.email],
          subject,
          html,
        }),
      });

      sent++;
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
