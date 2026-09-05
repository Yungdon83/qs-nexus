import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

type QuizQuestion = {
  question?: string
  
  options?: string[]
  answer?: string
  explanation?: string
}

type QuizAttempt = {
  id?: string
  course_code?: string
  course_title?: string
  question_count?: number
  score?: number
  percentage?: number
  questions?: QuizQuestion[] | string
  answers?: Record<string, string> | string[] | string
}

type AnalysisInput = {
  attempts?: QuizAttempt[]
}

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  })
}

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
}

function parseQuestions(
  questions: QuizQuestion[] | string | undefined
): QuizQuestion[] {
  if (!questions) {
    return []
  }

  if (Array.isArray(questions)) {
    return questions
  }

  try {
    const parsed: unknown = JSON.parse(questions)

    return Array.isArray(parsed)
      ? parsed as QuizQuestion[]
      : []
  } catch {
    return []
  }
}

function parseAnswers(
  answers:
    | Record<string, string>
    | string[]
    | string
    | undefined
): Record<string, string> {
  if (!answers) {
    return {}
  }

  if (
    typeof answers === "object" &&
    !Array.isArray(answers)
  ) {
    return answers
  }

  if (Array.isArray(answers)) {
    const result: Record<string, string> = {}

    answers.forEach((answer, index) => {
      result[String(index)] = answer
    })

    return result
  }

  try {
    const parsed: unknown = JSON.parse(answers)

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed)
    ) {
      return parsed as Record<string, string>
    }

    if (Array.isArray(parsed)) {
      const result: Record<string, string> = {}

      parsed.forEach((answer, index) => {
        result[String(index)] = String(answer)
      })

      return result
    }
  } catch {
    return {}
  }

  return {}
}

function buildAnalysisData(
  attempts: QuizAttempt[]
) {
  return attempts.map((attempt) => {
    const questions = parseQuestions(
      attempt.questions
    )

    const answers = parseAnswers(
      attempt.answers
    )

    const wrongQuestions = questions
      .map((question, index) => {
        const studentAnswer =
          answers[String(index)] ?? ""

        const correctAnswer =
          question.answer ?? ""

        return {
          question:
            question.question ?? "",
          studentAnswer,
          correctAnswer,
          explanation:
            question.explanation ?? "",
          correct:
            studentAnswer === correctAnswer,
        }
      })
      .filter((item) => !item.correct)

    return {
      courseCode:
        attempt.course_code ?? "Unknown",

      courseTitle:
        attempt.course_title ??
        "Unknown Course",

      score: Number(
        attempt.score ?? 0
      ),

      questionCount: Number(
        attempt.question_count ?? 0
      ),

      percentage: Number(
        attempt.percentage ?? 0
      ),

      wrongQuestions,
    }
  })
}

function sleep(
  milliseconds: number
): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

async function callGemini(
  apiKey: string,
  prompt: string,
  schema: Record<string, unknown>
): Promise<Response> {
  const maxAttempts = 3

  let lastResponse: Response | null = null

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ) {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
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
            responseMimeType:
              "application/json",

            responseJsonSchema:
              schema,

            maxOutputTokens: 4000,
          },
        }),
      }
    )

    lastResponse = response

    if (response.ok) {
      return response
    }

    const responseText =
      await response.text()

    console.error(
      `GEMINI ATTEMPT ${attempt}/${maxAttempts}:`,
      response.status,
      responseText
    )

    /*
     * Retry temporary Gemini failures.
     *
     * 429 = rate limit
     * 500 = server error
     * 502 = bad gateway
     * 503 = temporarily unavailable
     * 504 = gateway timeout
     */

    const retryableStatuses = [
      429,
      500,
      502,
      503,
      504,
    ]

    if (
      !retryableStatuses.includes(
        response.status
      ) ||
      attempt === maxAttempts
    ) {
      return new Response(
        responseText,
        {
          status: response.status,
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      )
    }

    /*
     * Wait longer after each failed attempt.
     *
     * Attempt 1 → 1.5 seconds
     * Attempt 2 → 3 seconds
     */

    const delay =
      1500 * attempt

    await sleep(delay)
  }

  return (
    lastResponse ??
    new Response(
      JSON.stringify({
        error:
          "Gemini request failed",
      }),
      {
        status: 503,
      }
    )
  )
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    })
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405)
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

    const apiKey =
      Deno.env.get(
        "GEMINI_API_KEY"
      )

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            "GEMINI_API_KEY is missing",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      )
    }

    const body =
      (await req.json()) as AnalysisInput

    const submittedAttempts =
      Array.isArray(body.attempts)
        ? body.attempts
        : []

    const attemptIds = submittedAttempts
      .map((attempt) => attempt.id)
      .filter((id): id is string => typeof id === "string" && id.length > 0)

    if (attemptIds.length === 0) {
      return new Response(
        JSON.stringify({
          error:
            "No quiz attempts were provided.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      )
    }

    const { data: attempts, error: attemptsError } = await supabaseClient
      .from("quiz_attempts")
      .select("*")
      .in("id", attemptIds)
      .eq("user_id", user.id)

    if (attemptsError || !attempts || attempts.length === 0) {
      return jsonResponse({ error: "No accessible quiz attempts were found." }, 404)
    }

    const analysisData =
      buildAnalysisData(attempts)

    const prompt = `
You are the AI academic performance analyst for QS Nexus, a university learning platform for Quantity Surveying students.

Analyze the student's recent quiz performance.

IMPORTANT:
- Base your analysis ONLY on the supplied quiz data.
- Do not invent topics that are not supported by the questions.
- Identify patterns in the questions the student got wrong.
- Give practical academic advice.
- Keep the language clear and useful for a university student.
- Do not mention that you are an AI unless necessary.
- Focus especially on repeated weaknesses across courses and questions.
- Keep recommendations practical and specific.

Student quiz data:

${JSON.stringify(
  analysisData,
  null,
  2
)}

Return a concise but useful academic performance analysis.
`

    const schema = {
      type: "object",

      properties: {
        summary: {
          type: "string",
        },

        overallAssessment: {
          type: "string",
        },

        strengths: {
          type: "array",
          items: {
            type: "string",
          },
        },

        weakAreas: {
          type: "array",
          items: {
            type: "object",

            properties: {
              topic: {
                type: "string",
              },

              reason: {
                type: "string",
              },

              recommendation: {
                type: "string",
              },
            },

            required: [
              "topic",
              "reason",
              "recommendation",
            ],
          },
        },

        commonMistakes: {
          type: "array",
          items: {
            type: "string",
          },
        },

        studyPlan: {
          type: "array",
          items: {
            type: "object",

            properties: {
              priority: {
                type: "string",
              },

              action: {
                type: "string",
              },
            },

            required: [
              "priority",
              "action",
            ],
          },
        },

        recommendedFocus: {
          type: "string",
        },
      },

      required: [
        "summary",
        "overallAssessment",
        "strengths",
        "weakAreas",
        "commonMistakes",
        "studyPlan",
        "recommendedFocus",
      ],
    }

    console.log(
      "Starting Gemini performance analysis..."
    )

    const response =
      await callGemini(
        apiKey,
        prompt,
        schema
      )

    const responseText =
      await response.text()

    if (!response.ok) {
      console.error(
        "GEMINI ANALYSIS FAILED:",
        response.status,
        responseText
      )

      return new Response(
        JSON.stringify({
          error:
            response.status === 503
              ? "Gemini is temporarily unavailable. Please try the analysis again in a moment."
              : "Gemini performance analysis failed",
        }),
        {
          status: response.status,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      )
    }

    let geminiData: GeminiResponse

    try {
      geminiData =
        JSON.parse(
          responseText
        ) as GeminiResponse
    } catch {
      console.error(
        "INVALID GEMINI RESPONSE:",
        responseText
      )

      return new Response(
        JSON.stringify({
          error:
            "Invalid Gemini API response",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      )
    }

    const generatedText =
      geminiData
        ?.candidates?.[0]
        ?.content
        ?.parts?.[0]
        ?.text

    if (!generatedText) {
      console.error(
        "NO GENERATED ANALYSIS:",
        JSON.stringify(
          geminiData
        )
      )

      return new Response(
        JSON.stringify({
          error:
            "Gemini returned no analysis",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      )
    }

    let analysis: unknown

    try {
      analysis =
        JSON.parse(
          generatedText
        )
    } catch {
      console.error(
        "INVALID ANALYSIS JSON:",
        generatedText
      )

      return new Response(
        JSON.stringify({
          error:
            "Gemini returned invalid analysis JSON",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      )
    }

    console.log(
      "Gemini performance analysis completed successfully."
    )

    return new Response(
      JSON.stringify({
        analysis,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    )
  } catch (error) {
    console.error(
      "PERFORMANCE ANALYSIS ERROR:",
      error
    )

    return new Response(
      JSON.stringify({
        error:
          "Unable to analyze performance",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    )
  }
})