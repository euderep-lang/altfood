import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, name, email, document_number, specialty, slug, referred_by } = await req.json();

    if (!user_id || !name || !email || !slug) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const insertData: Record<string, unknown> = {
      user_id,
      name,
      email,
      document_number: document_number || null,
      specialty: specialty || "Nutricionista",
      slug,
    };

    if (referred_by) {
      insertData.referred_by = referred_by;
    }

    const { data, error } = await supabaseAdmin
      .from("doctors")
      .insert(insertData)
      .select("id")
      .single();

    if (error) {
      console.error("Insert error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create referral record if applicable
    if (referred_by && data) {
      await supabaseAdmin.from("referrals").insert({
        referrer_id: referred_by,
        referred_id: data.id,
        status: "pending",
      }).catch(() => {});
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
