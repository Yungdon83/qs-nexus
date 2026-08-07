import { createClient } from "https://esm.sh/@supabase/supabase-js@2"


const corsHeaders = {

  "Access-Control-Allow-Origin": "*",

  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",

}





Deno.serve(async (req) => {


  // Handle browser preflight request

  if (req.method === "OPTIONS") {

    return new Response(

      "ok",

      {
        headers: corsHeaders
      }

    )

  }




  try {


    const {
      full_name,
      email,
      password,
      department
    } = await req.json()





    const supabaseAdmin = createClient(

      Deno.env.get("SUPABASE_URL")!,

      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

    )





    const { data, error } = await supabaseAdmin.auth.admin.createUser({

      email,

      password,

      email_confirm: true

    })





    if (error) {


      return new Response(

        JSON.stringify({

          error: error.message

        }),

        {

          status: 400,

          headers: {

            ...corsHeaders,

            "Content-Type": "application/json"

          }

        }

      )


    }







    const { error: profileError } = await supabaseAdmin

      .from("profiles")

      .insert({

        id: data.user.id,

        full_name,

        email,

        department,

        role: "lecturer"

      })







    if (profileError) {


      return new Response(

        JSON.stringify({

          error: profileError.message

        }),

        {

          status: 400,

          headers: {

            ...corsHeaders,

            "Content-Type": "application/json"

          }

        }

      )


    }







    return new Response(

      JSON.stringify({

        message: "Lecturer created successfully"

      }),

      {

        headers: {

          ...corsHeaders,

          "Content-Type": "application/json"

        }

      }

    )







  } catch(error) {


    return new Response(

      JSON.stringify({

        error: error.message

      }),

      {

        status: 500,

        headers: {

          ...corsHeaders,

          "Content-Type": "application/json"

        }

      }

    )


  }


})