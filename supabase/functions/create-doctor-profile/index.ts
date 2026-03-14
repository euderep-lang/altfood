import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RESERVED_SLUGS = [
  'login', 'register', 'signup', 'dashboard', 'onboarding', 'profile',
  'billing', 'planos', 'admin', 'support', 'changelog', 'reset-password',
  'forgot-password', 'p', 'ref', 'compartilhar', 'novidades', 'assinatura',
];

type CreateDoctorPayload = {
  name?: string;
  email?: string;
  document_number?: string | null;
  specialty?: string;
  slug?: string;
  referred_by?: string | null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "").trim();

    // Use anon client with getClaims for signing-keys compatibility
    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claimsData, error: claimsError } = await supabaseAnon.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = {
      id: claimsData.claims.sub as string,
      email: claimsData.claims.email as string | undefined,
      user_metadata: claimsData.claims.user_metadata as Record<string, unknown> ?? {},
    };

    const payload = (await req.json()) as CreateDoctorPayload;
    const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;

    const userId = user.id;
    const email = (user.email || payload.email || "").trim().toLowerCase();
    const name = (payload.name || (typeof metadata.name === "string" ? metadata.name : "") || email.split("@")[0] || "Profissional").trim();
    const specialty = (payload.specialty || (typeof metadata.specialty === "string" ? metadata.specialty : "") || "Nutricionista").trim();
    const documentNumber = payload.document_number ?? (typeof metadata.document_number === "string" ? metadata.document_number : null);
    const slug = payload.slug?.trim() || "";
    const referredBy = payload.referred_by ?? null;

    if (!email || !name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: existingByUser, error: existingByUserError } = await supabaseAdmin
      .from("doctors")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingByUserError) {
      return new Response(
        JSON.stringify({ error: existingByUserError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (existingByUser?.id) {
      return new Response(
        JSON.stringify({ success: true, id: existingByUser.id, source: "existing_user" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: existingByEmail, error: existingByEmailError } = await supabaseAdmin
      .from("doctors")
      .select("id, referred_by")
      .ilike("email", email)
      .maybeSingle();

    if (existingByEmailError) {
      return new Response(
        JSON.stringify({ error: existingByEmailError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (existingByEmail?.id) {
      const { data: relinkedDoctor, error: relinkError } = await supabaseAdmin
        .from("doctors")
        .update({
          user_id: userId,
          name,
          specialty,
          document_number: documentNumber || null,
          updated_at: new Date().toISOString(),
          referred_by: existingByEmail.referred_by ?? referredBy,
        })
        .eq("id", existingByEmail.id)
        .select("id")
        .single();

      if (relinkError) {
        return new Response(
          JSON.stringify({ error: relinkError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, id: relinkedDoctor.id, linked_existing: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!slug) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let finalSlug = slug;
    if (RESERVED_SLUGS.includes(finalSlug)) {
      finalSlug = `${finalSlug}-2`;
    }

    // Check for slug uniqueness and increment if needed
    let slugAttempt = finalSlug;
    let counter = 2;
    while (true) {
      const { data: existingSlug } = await supabaseAdmin
        .from("doctors")
        .select("id")
        .eq("slug", slugAttempt)
        .maybeSingle();
      if (!existingSlug) break;
      slugAttempt = `${finalSlug}-${counter}`;
      counter++;
    }

    const insertData: Record<string, unknown> = {
      user_id: userId,
      name,
      email,
      document_number: documentNumber || null,
      specialty,
      slug: slugAttempt,
    };

    if (referredBy) {
      insertData.referred_by = referredBy;
    }

    const { data: insertedDoctor, error: insertError } = await supabaseAdmin
      .from("doctors")
      .insert(insertData)
      .select("id")
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (referredBy && insertedDoctor) {
      await supabaseAdmin.from("referrals").insert({
        referrer_id: referredBy,
        referred_id: insertedDoctor.id,
        status: "pending",
      }).catch(() => {});
    }

    return new Response(
      JSON.stringify({ success: true, id: insertedDoctor.id, created: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
