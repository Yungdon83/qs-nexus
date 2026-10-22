import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    })
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase environment variables are missing.")
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey
    )

    const authHeader = req.headers.get("Authorization")

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      )
    }

    const token = authHeader.replace("Bearer ", "")

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      )
    }

    const { data: adminProfile, error: profileError } =
      await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (
      profileError ||
      !adminProfile ||
      adminProfile.role !== "admin"
    ) {
      return new Response(
        JSON.stringify({
          error: "Only administrators can create lecturer accounts.",
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      )
    }

    const body = await req.json()

    const {
      email,
      password,
      full_name,
      department,
    } = body

    if (!email || !password || !full_name) {
      return new Response(
        JSON.stringify({
          error: "Email, password and full name are required.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      )
    }

    const {
      data: createdUser,
      error: createUserError,
    } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          role: "lecturer",
        },
      })

    if (createUserError) {
      return new Response(
        JSON.stringify({
          error: createUserError.message,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      )
    }

    const { error: insertProfileError } =
      await supabaseAdmin
        .from("profiles")
        .insert({
          id: createdUser.user.id,
          full_name,
          role: "lecturer",
          department: department || "Quantity Surveying",
        })

    if (insertProfileError) {

      await supabaseAdmin.auth.admin.deleteUser(
        createdUser.user.id
      )

      return new Response(
        JSON.stringify({
          error: insertProfileError.message,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Lecturer account created successfully.",
        userId: createdUser.user.id,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    )

  } catch (error) {

    return new Response(
      JSON.stringify({
        error: "Unable to create lecturer account.",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    )
  }
})