import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function buildWelcomeHtml(name: string, patientUrl: string): string {
  const firstName = name.split(" ")[0];
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8faf9;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#0F766E,#059669);padding:32px 28px;text-align:center;">
        <h1 style="color:#fff;font-size:24px;margin:0;">🌿 Altfood</h1>
        <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:8px 0 0;">Substituição alimentar inteligente</p>
      </div>
      <!-- Body -->
      <div style="padding:32px 28px;">
        <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 8px;">Bem-vindo, ${firstName}! 🎉</h2>
        <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 20px;">
          Sua página de pacientes já está no ar e pronta para ser compartilhada. Seus pacientes agora podem acessar substituições alimentares de forma prática e personalizada.
        </p>
        
        <!-- Patient URL -->
        <div style="background:#f0fdf9;border:1px solid #d1fae5;border-radius:12px;padding:16px;margin:0 0 24px;">
          <p style="color:#0F766E;font-size:12px;font-weight:600;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.5px;">Sua página de paciente</p>
          <a href="${patientUrl}" style="color:#0F766E;font-size:14px;font-weight:600;word-break:break-all;text-decoration:none;">${patientUrl}</a>
        </div>

        <!-- Tips -->
        <h3 style="color:#1a1a1a;font-size:15px;margin:0 0 12px;">💡 3 dicas rápidas para começar:</h3>
        <div style="margin:0 0 24px;">
          <div style="display:flex;gap:8px;margin:0 0 10px;align-items:start;">
            <span style="background:#0F766E;color:#fff;font-size:11px;font-weight:700;width:22px;height:22px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">1</span>
            <p style="color:#555;font-size:13px;line-height:1.5;margin:0;"><strong>Compartilhe via WhatsApp</strong> — Envie o link direto na conversa com seu paciente após a consulta.</p>
          </div>
          <div style="display:flex;gap:8px;margin:0 0 10px;align-items:start;">
            <span style="background:#0F766E;color:#fff;font-size:11px;font-weight:700;width:22px;height:22px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">2</span>
            <p style="color:#555;font-size:13px;line-height:1.5;margin:0;"><strong>Adicione à sua bio do Instagram</strong> — Coloque o link na bio para que pacientes encontrem facilmente.</p>
          </div>
          <div style="display:flex;gap:8px;margin:0 0 10px;align-items:start;">
            <span style="background:#0F766E;color:#fff;font-size:11px;font-weight:700;width:22px;height:22px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">3</span>
            <p style="color:#555;font-size:13px;line-height:1.5;margin:0;"><strong>Personalize seu perfil</strong> — Adicione sua foto, cor e bio para deixar a página com a sua cara.</p>
          </div>
        </div>

        <!-- CTA -->
        <div style="text-align:center;">
          <a href="https://altfood.app/dashboard" style="display:inline-block;background:#0F766E;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:14px;font-weight:600;">Acessar meu dashboard →</a>
        </div>
      </div>
      <!-- Footer -->
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
    const { doctor_name, doctor_email, patient_url } = await req.json();

    if (!doctor_name || !doctor_email || !patient_url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const firstName = doctor_name.split(" ")[0];
    const subject = `Bem-vindo ao Altfood, ${firstName}! 🌿`;
    const html_body = buildWelcomeHtml(doctor_name, patient_url);

    // Call send-email function
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Altfood <noreply@altfood.app>",
        to: [doctor_email],
        subject,
        html: html_body,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Resend error:", data);
      return new Response(JSON.stringify({ error: "Failed to send", details: data }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
