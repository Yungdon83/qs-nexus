const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    })
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY")

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY is missing",
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

    const body = await req.json()

    const question = body.question?.trim()
    const courseCode = body.courseCode || ""
    const courseTitle = body.courseTitle || ""
    const history = Array.isArray(body.history)
      ? body.history
      : []

    if (!question) {
      return new Response(
        JSON.stringify({
          error: "Question is required",
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

    const contents = [
      {
        role: "user",
        parts: [
          {
            text: `
You are the QS Nexus AI Study Assistant.

QS Nexus is an academic portal for Quantity Surveying students.

The student is currently studying:

Course code:
${courseCode || "Not specified"}

Course title:
${courseTitle || "Not specified"}

Your job is to help the student understand academic topics.

Rules:

- Give accurate academic answers.
- Explain difficult concepts clearly.
- Use examples when useful.
- For calculations, show the working steps.
- Explain formulas and define variables.
- Maintain context from the previous conversation.
- If the student asks a follow-up question, use the conversation history.
- Do not invent information.
- If you are unsure, clearly say so.
- Keep answers useful and reasonably concise.
- Do not pretend to be a human lecturer.

The student is starting a conversation.
`,
          },
        ],
      },
    ]

    for (const message of history) {
      if (
        message.role !== "user" &&
        message.role !== "model"
      ) {
        continue
      }

      if (!message.text) {
        continue
      }

      contents.push({
        role: message.role,
        parts: [
          {
            text: message.text,
          },
        ],
      })
    }

    contents.push({
      role: "user",
      parts: [
        {
          text: question,
        },
      ],
    })

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            maxOutputTokens: 2500,
          },
        }),
      }
    )

    const responseText = await response.text()

    if (!response.ok) {
      console.error(
        "GEMINI ERROR:",
        responseText
      )

      return new Response(
        JSON.stringify({
          error: "Gemini request failed",
          details: responseText,
        }),
        {
          status: response.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      )
    }

    let geminiData

    try {
      geminiData = JSON.parse(responseText)
    } catch {
      return new Response(
        JSON.stringify({
          error: "Invalid Gemini response",
          details: responseText,
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

    const answer =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!answer) {
      console.error(
        "NO GEMINI ANSWER:",
        JSON.stringify(geminiData)
      )

      return new Response(
        JSON.stringify({
          error: "Gemini returned no answer",
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

    return new Response(
      JSON.stringify({
        answer,
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
    console.error(
      "STUDY ASSISTANT ERROR:",
      error
    )

    return new Response(
      JSON.stringify({
        error: "Unable to process question",
        details:
          error instanceof Error
            ? error.message
            : String(error),
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