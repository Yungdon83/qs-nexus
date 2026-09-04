import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
}

type HistoryMessage = {
  role: "user" | "model"
  text: string
}

type RequestBody = {
  question?: string
  courseCode?: string
  courseTitle?: string
  studyMode?: string
  history?: HistoryMessage[]
}

type GeminiPart = {
  text?: string
}

type GeminiContent = {
  parts?: GeminiPart[]
}

type GeminiCandidate = {
  content?: GeminiContent
}

type GeminiResponse = {
  candidates?: GeminiCandidate[]
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    })
  }

  try {
    const authHeader = req.headers.get("Authorization")
    const token = authHeader?.replace(/^Bearer\s+/i, "")

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      )
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase environment variables are missing.")
    }

    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey
    )
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      )
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY")

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY is not configured",
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

    const body: RequestBody = await req.json()

    const question =
      typeof body.question === "string"
        ? body.question.trim()
        : ""

    const courseCode =
      typeof body.courseCode === "string"
        ? body.courseCode
        : ""

    const courseTitle =
      typeof body.courseTitle === "string"
        ? body.courseTitle
        : ""

    const studyMode =
      typeof body.studyMode === "string"
        ? body.studyMode
        : "explain"

    const history: HistoryMessage[] =
      Array.isArray(body.history)
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

    const modeInstructions = {
      explain: `
Explain the topic clearly and simply.

Start from the basic idea.
Break difficult concepts into smaller parts.
Use examples where useful.
Make the explanation appropriate for a university student.
`,

      solve: `
Help the student solve the problem step by step.

Show the relevant formula when applicable.
Define the variables.
Substitute values carefully.
Show the calculations clearly.
Give the final answer.
For conceptual questions, provide logical step-by-step reasoning.
`,

      summarize: `
Create concise but useful study notes.

Include:
- Important definitions
- Key concepts
- Important formulas
- Important facts
- Useful examples

Use headings and bullet points where appropriate.
Make the result easy to revise.
`,

      exam: `
Act as an examination revision assistant.

Identify the most important concepts.
Highlight definitions and formulas students should remember.
Point out common mistakes.
Explain topics likely to be tested.
Finish with several practice questions.
Do not immediately provide answers to the practice questions.
`,
    }

    const selectedMode =
      modeInstructions[
        studyMode as keyof typeof modeInstructions
      ] || modeInstructions.explain

    const previousConversation =
      history.length > 0
        ? history
            .filter(
              (message: HistoryMessage) =>
                typeof message.text === "string" &&
                message.text.trim() !== ""
            )
            .slice(-12)
            .map(
              (message: HistoryMessage) =>
                `${
                  message.role === "user"
                    ? "Student"
                    : "AI Assistant"
                }: ${message.text}`
            )
            .join("\n\n")
        : "No previous conversation."

    const prompt = `
You are the QS Nexus AI Study Assistant.

QS Nexus is an academic learning platform for Quantity Surveying students.

COURSE

Course code:
${courseCode || "Not specified"}

Course title:
${courseTitle || "Not specified"}


STUDY MODE

${selectedMode}


GENERAL INSTRUCTIONS

- Give accurate academic answers.
- Explain concepts clearly.
- Do not invent facts.
- Use appropriate examples.
- For numerical problems, show the working.
- Explain formulas and define variables.
- Keep the response organized.
- If the student asks a follow-up question, use the previous conversation.
- Do not claim to be a human lecturer.
- If information is uncertain, say so clearly.


PREVIOUS CONVERSATION

${previousConversation}


CURRENT STUDENT QUESTION

${question}


Now answer the student's question according to the selected study mode.
`

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },

        body: JSON.stringify({
          contents: [
            {
              role: "user",

              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],

          generationConfig: {
            maxOutputTokens: 2500,
          },
        }),
      }
    )

    const responseText = await response.text()

    if (!response.ok) {
      console.error(
        "GEMINI API ERROR:",
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

    let geminiData: GeminiResponse

    try {
      geminiData =
        JSON.parse(responseText) as GeminiResponse
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
      geminiData.candidates?.[0]?.content?.parts
        ?.map(
          (part: GeminiPart) =>
            part.text || ""
        )
        .join("")
        .trim()

    if (!answer) {
      console.error(
        "GEMINI RETURNED NO ANSWER:",
        JSON.stringify(geminiData)
      )

      return new Response(
        JSON.stringify({
          error: "Gemini returned no answer",
          details: geminiData,
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