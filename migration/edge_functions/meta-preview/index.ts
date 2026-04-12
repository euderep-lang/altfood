import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BOT_UA =
  /whatsapp|telegrambot|twitterbot|facebookexternalhit|linkedinbot|slackbot|discordbot|googlebot|bingbot|yandexbot|baiduspider|duckduckbot|pinterest|embedly|quora|showyoubot|outbrain|vkshare|tumblr|skypeuripreview|nuzzel|w3c_validator/i;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const base = url.searchParams.get("base") || "https://altfood.com.br";

  if (!slug) {
    return new Response("Missing slug", { status: 400, headers: corsHeaders });
  }

  const targetUrl = `${base}/${slug}`;
  const ua = req.headers.get("user-agent") || "";

  // If it's a real user (not a bot), redirect immediately
  if (!BOT_UA.test(ua)) {
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, Location: targetUrl },
    });
  }

  // It's a bot — fetch doctor data and return HTML with meta tags
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(supabaseUrl, supabaseKey);

  const { data: doctor } = await sb
    .from("doctors")
    .select("name, specialty, bio, logo_url, slug, primary_color")
    .eq("slug", slug)
    .single();

  if (!doctor) {
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, Location: targetUrl },
    });
  }

  const title = `${doctor.name} — Substituições Alimentares | Altfood`;
  const description = doctor.bio
    ? doctor.bio.slice(0, 155)
    : `${doctor.name} é ${doctor.specialty} e usa o Altfood para oferecer substituições alimentares personalizadas aos seus pacientes.`;
  const image = doctor.logo_url || `${base}/altfood-brand.png`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}"/>
  <meta name="theme-color" content="${doctor.primary_color || '#0F766E'}"/>

  <meta property="og:type" content="profile"/>
  <meta property="og:title" content="${escapeHtml(title)}"/>
  <meta property="og:description" content="${escapeHtml(description)}"/>
  <meta property="og:url" content="${escapeHtml(targetUrl)}"/>
  <meta property="og:image" content="${escapeHtml(image)}"/>
  <meta property="og:locale" content="pt_BR"/>

  <meta name="twitter:card" content="summary"/>
  <meta name="twitter:title" content="${escapeHtml(title)}"/>
  <meta name="twitter:description" content="${escapeHtml(description)}"/>
  <meta name="twitter:image" content="${escapeHtml(image)}"/>

  <link rel="canonical" href="${escapeHtml(targetUrl)}"/>
  <meta http-equiv="refresh" content="0;url=${escapeHtml(targetUrl)}"/>
</head>
<body>
  <script>window.location.replace("${escapeJs(targetUrl)}");</script>
  <p>Redirecionando para <a href="${escapeHtml(targetUrl)}">${escapeHtml(doctor.name)}</a>...</p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeJs(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
