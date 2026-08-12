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

    const courseCode =
      body.courseCode || "General Course"

    const courseTitle =
      body.courseTitle || "General Topic"

    const topic =
      body.topic || "General course knowledge"

    const prompt = `
Create a university-level multiple-choice quiz.

Course:
${courseCode} - ${courseTitle}

Topic:
${topic}

Create exactly 10 questions.

Every question must:
- Have exactly 4 options.
- Have exactly one correct answer.
- Be academically useful.
- Be appropriate for Quantity Surveying students.
`

    const schema = {
      type: "object",
      properties: {
        questions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              question: {
                type: "string",
              },
              options: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              answer: {
                type: "string",
              },
            },
            required: [
              "question",
              "options",
              "answer",
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
            maxOutputTokens: 5000,
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

    let geminiData

    try {
      geminiData = JSON.parse(responseText)
    } catch {
      return new Response(
        JSON.stringify({
          error: "Invalid Gemini API response",
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

    const generatedText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!generatedText) {
      console.error(
        "NO GENERATED TEXT:",
        JSON.stringify(geminiData)
      )

      return new Response(
        JSON.stringify({
          error: "Gemini returned no quiz",
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

    let quiz

    try {
      quiz = JSON.parse(generatedText)
    } catch {
      console.error(
        "INVALID QUIZ JSON:",
        generatedText
      )

      return new Response(
        JSON.stringify({
          error: "Gemini returned invalid quiz JSON",
          details: generatedText,
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
          error: "Quiz format is invalid",
          details: quiz,
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

    const validQuestions =
      quiz.questions.filter(
        (item: any) =>
          item.question &&
          Array.isArray(item.options) &&
          item.options.length === 4 &&
          item.answer
      )

    if (validQuestions.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Gemini generated no valid questions",
          details: quiz,
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