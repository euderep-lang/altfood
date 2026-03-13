import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type DeleteProfessionalPayload = {
  doctor_id?: string;
  user_id?: string;
  email?: string;
};

const AUTH_USER_NOT_FOUND_MESSAGES = ["User not found", "not found"];

const normalize = (value?: string) => value?.trim() || undefined;

async function findUserIdByEmail(
  supabaseAdmin: ReturnType<typeof createClient>,
  email: string
): Promise<string | null> {
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);

    const foundUser = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (foundUser) return foundUser.id;

    if (data.users.length < perPage) return null;
    page += 1;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "").trim();

    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authData.user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc("has_role", {
      _user_id: authData.user.id,
      _role: "admin",
    });

    if (roleError) {
      return new Response(JSON.stringify({ error: roleError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = (await req.json()) as DeleteProfessionalPayload;
    const doctorId = normalize(payload?.doctor_id);
    const userIdFromPayload = normalize(payload?.user_id);
    const emailFromPayload = normalize(payload?.email)?.toLowerCase();

    if (!doctorId && !userIdFromPayload && !emailFromPayload) {
      return new Response(JSON.stringify({ error: "doctor_id, user_id or email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let targetUserId = userIdFromPayload ?? null;

    if (doctorId) {
      const { data: selectedDoctor, error: selectedDoctorError } = await supabaseAdmin
        .from("doctors")
        .select("id, user_id")
        .eq("id", doctorId)
        .maybeSingle();

      if (selectedDoctorError) {
        return new Response(JSON.stringify({ error: selectedDoctorError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (selectedDoctor) {
        targetUserId = selectedDoctor.user_id;
      }
    }

    if (!targetUserId && emailFromPayload) {
      targetUserId = await findUserIdByEmail(supabaseAdmin, emailFromPayload);
    }

    if (!targetUserId) {
      return new Response(JSON.stringify({ error: "Professional/Auth user not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: userDoctors, error: userDoctorsError } = await supabaseAdmin
      .from("doctors")
      .select("id")
      .eq("user_id", targetUserId);

    if (userDoctorsError) {
      return new Response(JSON.stringify({ error: userDoctorsError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const doctorIds = (userDoctors || []).map((doctor) => doctor.id);

    if (doctorIds.length > 0) {
      const doctorScopedTables = [
        "doctor_sections",
        "domain_interests",
        "hidden_foods",
        "nps_responses",
        "page_views",
        "patient_feedback",
        "payments",
        "substitution_queries",
        "support_tickets",
      ] as const;

      for (const table of doctorScopedTables) {
        const { error } = await supabaseAdmin.from(table).delete().in("doctor_id", doctorIds);
        if (error) {
          return new Response(JSON.stringify({ error: `Failed to delete ${table}: ${error.message}` }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      const { error: cleanReferredByError } = await supabaseAdmin
        .from("doctors")
        .update({ referred_by: null })
        .in("referred_by", doctorIds);

      if (cleanReferredByError) {
        return new Response(JSON.stringify({ error: cleanReferredByError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: deleteReferralsAsReferredError } = await supabaseAdmin
        .from("referrals")
        .delete()
        .in("referred_id", doctorIds);

      if (deleteReferralsAsReferredError) {
        return new Response(JSON.stringify({ error: deleteReferralsAsReferredError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: deleteReferralsAsReferrerError } = await supabaseAdmin
        .from("referrals")
        .delete()
        .in("referrer_id", doctorIds);

      if (deleteReferralsAsReferrerError) {
        return new Response(JSON.stringify({ error: deleteReferralsAsReferrerError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { error: deleteDoctorsError } = await supabaseAdmin
      .from("doctors")
      .delete()
      .eq("user_id", targetUserId);

    if (deleteDoctorsError) {
      return new Response(JSON.stringify({ error: deleteDoctorsError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: deleteRolesError } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", targetUserId);

    if (deleteRolesError) {
      return new Response(JSON.stringify({ error: deleteRolesError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: deleteAuthUserError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);

    if (deleteAuthUserError) {
      const isUserAlreadyDeleted = AUTH_USER_NOT_FOUND_MESSAGES.some((msg) =>
        deleteAuthUserError.message?.toLowerCase().includes(msg.toLowerCase())
      );

      if (!isUserAlreadyDeleted) {
        return new Response(JSON.stringify({ error: deleteAuthUserError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, user_id: targetUserId, deleted_doctors: doctorIds.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
