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

type DoctorRow = {
  id: string;
  user_id: string;
  email: string;
  logo_url: string | null;
  favicon_url?: string | null;
};

const AUTH_USER_NOT_FOUND_MESSAGES = ["User not found", "not found"];
const DOCTOR_LOGO_PUBLIC_PATH = "/storage/v1/object/public/doctor-logos/";

const normalize = (value?: string) => value?.trim() || undefined;
const normalizeEmail = (value?: string) => normalize(value)?.toLowerCase();

const isAuthUserNotFound = (message?: string) =>
  AUTH_USER_NOT_FOUND_MESSAGES.some((text) => message?.toLowerCase().includes(text.toLowerCase()));

const unique = <T>(items: T[]) => [...new Set(items)];

function getLogoPathFromPublicUrl(logoUrl: string | null): string | null {
  if (!logoUrl) return null;

  const markerIndex = logoUrl.indexOf(DOCTOR_LOGO_PUBLIC_PATH);
  if (markerIndex === -1) return null;

  const path = logoUrl.slice(markerIndex + DOCTOR_LOGO_PUBLIC_PATH.length);
  return path ? decodeURIComponent(path) : null;
}

async function findAuthUserIdsByEmails(
  supabaseAdmin: ReturnType<typeof createClient>,
  emails: Set<string>
): Promise<Map<string, string[]>> {
  const normalizedEmails = new Set(Array.from(emails).map((email) => email.toLowerCase()));
  const result = new Map<string, string[]>();

  if (normalizedEmails.size === 0) return result;

  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);

    for (const user of data.users) {
      const userEmail = user.email?.toLowerCase();
      if (!userEmail || !normalizedEmails.has(userEmail)) continue;

      const existing = result.get(userEmail) ?? [];
      existing.push(user.id);
      result.set(userEmail, existing);
    }

    if (data.users.length < perPage) break;
    page += 1;
  }

  return result;
}

async function hardDeleteAuthUser(
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string
): Promise<void> {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId, false);

  if (error && !isAuthUserNotFound(error.message)) {
    throw new Error(error.message);
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
    const emailFromPayload = normalizeEmail(payload?.email);

    if (!doctorId && !userIdFromPayload && !emailFromPayload) {
      return new Response(JSON.stringify({ error: "doctor_id, user_id or email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userIdsToDelete = new Set<string>();
    const emailsToDelete = new Set<string>();
    const doctorRowsById = new Map<string, DoctorRow>();

    const addDoctorRows = (rows: DoctorRow[] | null) => {
      if (!rows?.length) return;

      for (const row of rows) {
        doctorRowsById.set(row.id, row);
        userIdsToDelete.add(row.user_id);
        if (row.email) emailsToDelete.add(row.email.toLowerCase());
      }
    };

    if (userIdFromPayload) userIdsToDelete.add(userIdFromPayload);
    if (emailFromPayload) emailsToDelete.add(emailFromPayload);

    if (doctorId) {
      const { data: doctorById, error: doctorByIdError } = await supabaseAdmin
        .from("doctors")
        .select("id, user_id, email, logo_url")
        .eq("id", doctorId)
        .maybeSingle();

      if (doctorByIdError) {
        return new Response(JSON.stringify({ error: doctorByIdError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (doctorById) addDoctorRows([doctorById]);
    }

    if (userIdsToDelete.size > 0) {
      const { data: doctorsByUser, error: doctorsByUserError } = await supabaseAdmin
        .from("doctors")
        .select("id, user_id, email, logo_url")
        .in("user_id", Array.from(userIdsToDelete));

      if (doctorsByUserError) {
        return new Response(JSON.stringify({ error: doctorsByUserError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      addDoctorRows(doctorsByUser ?? []);
    }

    if (emailsToDelete.size > 0) {
      const orFilter = Array.from(emailsToDelete)
        .map((email) => `email.ilike.${email}`)
        .join(",");

      if (orFilter) {
        const { data: doctorsByEmail, error: doctorsByEmailError } = await supabaseAdmin
          .from("doctors")
          .select("id, user_id, email, logo_url")
          .or(orFilter);

        if (doctorsByEmailError) {
          return new Response(JSON.stringify({ error: doctorsByEmailError.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        addDoctorRows(doctorsByEmail ?? []);
      }
    }

    const authUserIdsByEmail = await findAuthUserIdsByEmails(supabaseAdmin, emailsToDelete);
    for (const ids of authUserIdsByEmail.values()) {
      for (const userId of ids) userIdsToDelete.add(userId);
    }

    if (userIdsToDelete.size > 0) {
      const { data: additionalDoctors, error: additionalDoctorsError } = await supabaseAdmin
        .from("doctors")
        .select("id, user_id, email, logo_url")
        .in("user_id", Array.from(userIdsToDelete));

      if (additionalDoctorsError) {
        return new Response(JSON.stringify({ error: additionalDoctorsError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      addDoctorRows(additionalDoctors ?? []);
    }

    const doctorRows = Array.from(doctorRowsById.values());
    const doctorIds = unique(doctorRows.map((row) => row.id));
    const allUserIds = unique(Array.from(userIdsToDelete));
    const logoPaths = unique(
      doctorRows
        .flatMap((row) => [
          getLogoPathFromPublicUrl(row.logo_url),
          getLogoPathFromPublicUrl(row.favicon_url),
        ])
        .filter((path): path is string => Boolean(path))
    );

    if (doctorIds.length === 0 && allUserIds.length === 0) {
      return new Response(JSON.stringify({ error: "Professional/Auth user not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

      const { error: deleteDoctorsByIdError } = await supabaseAdmin
        .from("doctors")
        .delete()
        .in("id", doctorIds);

      if (deleteDoctorsByIdError) {
        return new Response(JSON.stringify({ error: deleteDoctorsByIdError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (allUserIds.length > 0) {
      const { error: deleteDoctorsByUserError } = await supabaseAdmin
        .from("doctors")
        .delete()
        .in("user_id", allUserIds);

      if (deleteDoctorsByUserError) {
        return new Response(JSON.stringify({ error: deleteDoctorsByUserError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: deleteRolesError } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .in("user_id", allUserIds);

      if (deleteRolesError) {
        return new Response(JSON.stringify({ error: deleteRolesError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (logoPaths.length > 0) {
      await supabaseAdmin.storage.from("doctor-logos").remove(logoPaths);
    }

    const deletedAuthUserIds: string[] = [];

    for (const userId of allUserIds) {
      await hardDeleteAuthUser(supabaseAdmin, userId);
      deletedAuthUserIds.push(userId);
    }

    if (emailsToDelete.size > 0) {
      const remainingAuthUsers = await findAuthUserIdsByEmails(supabaseAdmin, emailsToDelete);
      const remainingIds = unique(Array.from(remainingAuthUsers.values()).flat());

      for (const userId of remainingIds) {
        if (deletedAuthUserIds.includes(userId)) continue;
        await hardDeleteAuthUser(supabaseAdmin, userId);
        deletedAuthUserIds.push(userId);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        deleted_doctors: doctorIds.length,
        deleted_auth_users: deletedAuthUserIds.length,
      }),
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