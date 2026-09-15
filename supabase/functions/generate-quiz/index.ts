import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

type QuizQuestion = {
  question: string
  options: string[]
  answer: string
  explanation: string
}

type QuizResponse = {
  questions: QuizQuestion[]
}

Deno.serve(async (req) => {
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

    const courseCode =
      typeof body.courseCode === "string"
        ? body.courseCode
        : "General Course"

    const courseTitle =
      typeof body.courseTitle === "string"
        ? body.courseTitle
        : "General Topic"

    const topic =
      typeof body.topic === "string"
        ? body.topic
        : "General course knowledge"

    const requestedCount = Number(body.questionCount)

    const allowedCounts = [5, 10, 20, 30]

    const questionCount =
      allowedCounts.includes(requestedCount)
        ? requestedCount
        : 10

    const prompt = `
Create a university-level multiple-choice quiz.

Course:
${courseCode} - ${courseTitle}

Topic:
${topic}

Generate EXACTLY ${questionCount} questions.

STRICT REQUIREMENTS:

1. Generate exactly ${questionCount} questions.
2. Every question must have exactly 4 options.
3. Every question must have exactly one correct answer.
4. The answer field must exactly match one of the options.
5. Every question must have an explanation.
6. Explanations should clearly explain why the correct answer is correct.
7. Questions must be academically useful.
8. Questions should be appropriate for Quantity Surveying students.
9. Questions should test understanding and application.
10. Avoid duplicate questions.
11. Do not include markdown.
12. Do not include code fences.
13. Do not include extra fields.
14. Return only the JSON object required by the schema.
15. Never return fewer than ${questionCount} questions.
16. Never return more than ${questionCount} questions.
`

    const schema = {
      type: "object",
      properties: {
        questions: {
          type: "array",
          minItems: questionCount,
          maxItems: questionCount,
          items: {
            type: "object",
            properties: {
              question: {
                type: "string",
              },

              options: {
                type: "array",
                minItems: 4,
                maxItems: 4,
                items: {
                  type: "string",
                },
              },

              answer: {
                type: "string",
              },

              explanation: {
                type: "string",
              },
            },

            required: [
              "question",
              "options",
              "answer",
              "explanation",
            ],
          },
        },
      },

      required: ["questions"],
    }

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
            responseMimeType: "application/json",
            responseJsonSchema: schema,
            maxOutputTokens: 16000,
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

    let geminiData: unknown

    try {
      geminiData = JSON.parse(responseText)
    } catch {
      return new Response(
        JSON.stringify({
          error: "Invalid Gemini API response",
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

    if (
      typeof geminiData !== "object" ||
      geminiData === null ||
      !("candidates" in geminiData)
    ) {
      return new Response(
        JSON.stringify({
          error: "Gemini returned an invalid response.",
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

    const candidates = geminiData.candidates

    if (
      !Array.isArray(candidates) ||
      candidates.length === 0
    ) {
      return new Response(
        JSON.stringify({
          error: "Gemini returned no quiz.",
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

    const candidate = candidates[0]

    let generatedText = ""

    if (
      typeof candidate === "object" &&
      candidate !== null &&
      "content" in candidate
    ) {
      const content = candidate.content

      if (
        typeof content === "object" &&
        content !== null &&
        "parts" in content &&
        Array.isArray(content.parts)
      ) {
        const firstPart = content.parts[0]

        if (
          typeof firstPart === "object" &&
          firstPart !== null &&
          "text" in firstPart &&
          typeof firstPart.text === "string"
        ) {
          generatedText = firstPart.text
        }
      }
    }

    if (!generatedText) {
      return new Response(
        JSON.stringify({
          error: "Gemini returned no quiz text.",
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

    let quiz: QuizResponse

    try {
      quiz = JSON.parse(
        generatedText
      ) as QuizResponse
    } catch {
      console.error(
        "INVALID QUIZ JSON:",
        generatedText
      )

      return new Response(
        JSON.stringify({
          error:
            "Gemini returned invalid quiz JSON",
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

    if (
      !quiz.questions ||
      !Array.isArray(quiz.questions)
    ) {
      return new Response(
        JSON.stringify({
          error: "Quiz format is invalid.",
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

    if (
      quiz.questions.length !==
      questionCount
    ) {
      return new Response(
        JSON.stringify({
          error:
            `Expected ${questionCount} questions but received ${quiz.questions.length}.`,
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

    const validQuestions: QuizQuestion[] = []

    for (const item of quiz.questions) {
      if (
        !item ||
        typeof item.question !== "string" ||
        !Array.isArray(item.options) ||
        item.options.length !== 4 ||
        typeof item.answer !== "string" ||
        typeof item.explanation !== "string"
      ) {
        continue
      }

      const optionsAreValid =
        item.options.every(
          (option) =>
            typeof option === "string" &&
            option.trim().length > 0
        )

      if (!optionsAreValid) {
        continue
      }

      const answerExists =
        item.options.some(
          (option) =>
            option === item.answer
        )

      if (!answerExists) {
        continue
      }

      validQuestions.push({
        question: item.question,
        options: item.options,
        answer: item.answer,
        explanation: item.explanation,
      })
    }

    if (
      validQuestions.length !==
      questionCount
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Gemini generated invalid quiz questions.",
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
        questions: validQuestions,
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
      "GENERATE QUIZ ERROR:",
      error
    )

    return new Response(
      JSON.stringify({
        error: "Unable to generate quiz",
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