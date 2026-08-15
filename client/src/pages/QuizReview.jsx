import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { supabase } from "../lib/supabase"

function QuizReview() {
  const { attemptId } = useParams()
  const navigate = useNavigate()

  const [attempt, setAttempt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadAttempt()
  }, [attemptId])

  async function loadAttempt() {
    setLoading(true)
    setError("")

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("You must be logged in.")
        setLoading(false)
        return
      }

      const {
        data,
        error: attemptError,
      } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("id", attemptId)
        .eq("user_id", user.id)
        .maybeSingle()

      if (attemptError) {
        throw attemptError
      }

      if (!data) {
        setError("Quiz attempt not found.")
        setLoading(false)
        return
      }

      setAttempt(data)
    } catch (err) {
      console.error("QUIZ REVIEW ERROR:", err)

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load quiz attempt."
      )
    } finally {
      setLoading(false)
    }
  }

  function getQuestions() {
    if (!attempt?.questions) {
      return []
    }

    if (Array.isArray(attempt.questions)) {
      return attempt.questions
    }

    try {
      return JSON.parse(attempt.questions)
    } catch {
      return []
    }
  }

  function getAnswers() {
    if (!attempt?.answers) {
      return {}
    }

    if (
      typeof attempt.answers === "object" &&
      !Array.isArray(attempt.answers)
    ) {
      return attempt.answers
    }

    try {
      return JSON.parse(attempt.answers)
    } catch {
      return {}
    }
  }

  function getUserAnswer(answers, index) {
    if (Array.isArray(answers)) {
      return answers[index]
    }

    return answers[index]
  }

  function isCorrect(question, userAnswer) {
    return userAnswer === question.answer
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-950 flex items-center justify-center">

        <div className="text-center">

          <div className="text-6xl mb-5">
            🔍
          </div>

          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
            Loading Review...
          </h1>

        </div>

      </div>
    )
  }

  if (error || !attempt) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-950 flex items-center justify-center p-6">

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">

          <div className="text-5xl mb-5">
            ⚠️
          </div>

          <h1 className="text-2xl font-bold text-red-600">
            Unable to Load Review
          </h1>

          <p className="mt-4 text-gray-600 dark:text-gray-300 break-words">
            {error || "Quiz attempt not found."}
          </p>

          <button
            onClick={() =>
              navigate("/quiz-history")
            }
            className="mt-6 bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold"
          >
            ← Quiz History
          </button>

        </div>

      </div>
    )
  }

  const questions = getQuestions()
  const answers = getAnswers()

  const percentage = Number(
    attempt.percentage || 0
  )

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 text-gray-800 dark:text-gray-100">

      {/* HEADER */}

      <div className="bg-blue-900 dark:bg-slate-900 text-white shadow-lg">

        <div className="max-w-5xl mx-auto px-6 py-6">

          <button
            onClick={() =>
              navigate("/quiz-history")
            }
            className="text-blue-100 hover:text-white mb-5"
          >
            ← Back to Quiz History
          </button>

          <h1 className="text-3xl font-bold">
            Quiz Review
          </h1>

          <p className="text-blue-100 mt-2">
            {attempt.course_code} —{" "}
            {attempt.course_title}
          </p>

        </div>

      </div>

      <div className="max-w-5xl mx-auto p-6">

        {/* RESULT SUMMARY */}

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-8 mb-8">

          <div className="grid sm:grid-cols-3 gap-6 text-center">

            <div>

              <p className="text-gray-500 dark:text-gray-400">
                Score
              </p>

              <p className="text-4xl font-bold text-blue-900 dark:text-blue-400 mt-2">
                {attempt.score}/
                {attempt.question_count}
              </p>

            </div>

            <div>

              <p className="text-gray-500 dark:text-gray-400">
                Percentage
              </p>

              <p
                className={`text-4xl font-bold mt-2 ${
                  percentage >= 70
                    ? "text-green-600"
                    : percentage >= 50
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {percentage}%
              </p>

            </div>

            <div>

              <p className="text-gray-500 dark:text-gray-400">
                Questions
              </p>

              <p className="text-4xl font-bold mt-2">
                {questions.length}
              </p>

            </div>

          </div>

        </div>

        {/* QUESTIONS */}

        <div className="space-y-6">

          {questions.map(
            (question, index) => {

              const userAnswer =
                getUserAnswer(
                  answers,
                  index
                )

              const correct =
                isCorrect(
                  question,
                  userAnswer
                )

              return (
                <div
                  key={index}
                  className={`rounded-2xl border-2 p-6 ${
                    correct
                      ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800"
                  }`}
                >

                  {/* QUESTION HEADER */}

                  <div className="flex items-start justify-between gap-4">

                    <h2 className="text-lg font-bold">
                      {index + 1}.{" "}
                      {question.question}
                    </h2>

                    <span className="text-2xl">
                      {correct
                        ? "✅"
                        : "❌"}
                    </span>

                  </div>

                  {/* OPTIONS */}

                  <div className="mt-5 space-y-3">

                    {question.options?.map(
                      (option, optionIndex) => {

                        const selected =
                          option ===
                          userAnswer

                        const answer =
                          option ===
                          question.answer

                        let className =
                          "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800"

                        if (answer) {
                          className =
                            "border-green-500 bg-green-100 dark:bg-green-900/40"
                        } else if (
                          selected &&
                          !answer
                        ) {
                          className =
                            "border-red-500 bg-red-100 dark:bg-red-900/40"
                        }

                        return (
                          <div
                            key={
                              optionIndex
                            }
                            className={`border rounded-xl p-4 ${className}`}
                          >

                            <span className="font-bold mr-3">
                              {String.fromCharCode(
                                65 +
                                  optionIndex
                              )}
                              .
                            </span>

                            {option}

                            {answer && (
                              <span className="ml-3 text-green-700 dark:text-green-400 font-semibold">
                                ✓ Correct Answer
                              </span>
                            )}

                            {selected &&
                              !answer && (
                                <span className="ml-3 text-red-700 dark:text-red-400 font-semibold">
                                  ✗ Your Answer
                                </span>
                              )}

                          </div>
                        )
                      }
                    )}

                  </div>

                  {/* ANSWER SUMMARY */}

                  <div className="mt-5">

                    <p className="font-semibold">
                      Your answer:
                    </p>

                    <p className="mt-1 text-gray-700 dark:text-gray-300">
                      {userAnswer ||
                        "Not answered"}
                    </p>

                    {!correct && (
                      <>
                        <p className="font-semibold mt-4">
                          Correct answer:
                        </p>

                        <p className="mt-1 text-green-700 dark:text-green-400">
                          {question.answer}
                        </p>
                      </>
                    )}

                  </div>

                  {/* EXPLANATION */}

                  {question.explanation && (
                    <div className="mt-5 bg-white/70 dark:bg-slate-900/70 rounded-xl p-4">

                      <p className="font-bold text-blue-900 dark:text-blue-400">
                        📖 Explanation
                      </p>

                      <p className="mt-2 text-gray-700 dark:text-gray-300">
                        {question.explanation}
                      </p>

                    </div>
                  )}

                </div>
              )
            }
          )}

        </div>

        {/* BOTTOM */}

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">

          <button
            onClick={() =>
              navigate("/quiz-history")
            }
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            ← Quiz History
          </button>

          <button
            onClick={() =>
              navigate("/student-dashboard")
            }
            className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Dashboard
          </button>

        </div>

      </div>

    </div>
  )
}

export default QuizReview