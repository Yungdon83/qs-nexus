import { useEffect, useMemo, useState } from "react"
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
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        throw userError
      }

      if (!user) {
        setError("You must be logged in.")
        return
      }

      if (!attemptId) {
        setError("No quiz attempt was specified.")
        return
      }

      const { data, error: attemptError } =
        await supabase
          .from("quiz_attempts")
          .select(
            "id, user_id, course_code, course_title, question_count, score, percentage, time_taken_seconds, questions, answers, created_at"
          )
          .eq("id", attemptId)
          .eq("user_id", user.id)
          .single()

      if (attemptError) {
        throw attemptError
      }

      if (!data) {
        setError("Quiz attempt not found.")
        return
      }

      setAttempt(data)
    } catch (err) {
      console.error("QUIZ REVIEW ERROR:", err)

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load quiz review."
      )
    } finally {
      setLoading(false)
    }
  }

  const questions = useMemo(() => {
    if (!attempt) {
      return []
    }

    if (!Array.isArray(attempt.questions)) {
      return []
    }

    return attempt.questions
  }, [attempt])

  const answers = useMemo(() => {
    if (!attempt?.answers) {
      return {}
    }

    if (
      typeof attempt.answers === "object" &&
      !Array.isArray(attempt.answers)
    ) {
      return attempt.answers
    }

    return {}
  }, [attempt])

  const reviewStats = useMemo(() => {
    let correct = 0
    let unanswered = 0

    questions.forEach((question, index) => {
      const selected = answers[String(index)]

      if (!selected) {
        unanswered++
        return
      }

      if (selected === question.answer) {
        correct++
      }
    })

    const incorrect =
      questions.length - correct - unanswered

    const percentage =
      questions.length > 0
        ? Math.round(
            (correct / questions.length) * 100
          )
        : 0

    return {
      correct,
      incorrect,
      unanswered,
      percentage,
    }
  }, [questions, answers])

  function formatTime(seconds) {
    const totalSeconds = Number(seconds || 0)

    const minutes = Math.floor(
      totalSeconds / 60
    )

    const remainingSeconds =
      totalSeconds % 60

    if (minutes === 0) {
      return `${remainingSeconds}s`
    }

    return `${minutes}m ${remainingSeconds}s`
  }

  function getScoreColor(score) {
    if (score >= 70) {
      return "text-green-600 dark:text-green-400"
    }

    if (score >= 50) {
      return "text-yellow-600 dark:text-yellow-400"
    }

    return "text-red-600 dark:text-red-400"
  }

  function getResultLabel(score) {
    if (score >= 80) {
      return "Excellent"
    }

    if (score >= 70) {
      return "Good"
    }

    if (score >= 50) {
      return "Needs Improvement"
    }

    return "Needs Attention"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-5">
            🔍
          </div>

          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
            Loading Quiz Review...
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Retrieving your quiz answers.
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">
          <div className="text-5xl mb-5">
            ⚠️
          </div>

          <h1 className="text-2xl font-bold text-red-600">
            Quiz Review Error
          </h1>

          <p className="mt-4 text-gray-600 dark:text-gray-300 break-words">
            {error}
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <button
              onClick={loadAttempt}
              className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Try Again
            </button>

            <button
              onClick={() =>
                navigate("/quiz-history")
              }
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Quiz History
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!attempt) {
    return null
  }

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

          <div className="flex items-center gap-4">

            <div className="text-5xl">
              🔍
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                Quiz Review
              </h1>

              <p className="text-blue-100 mt-1">
                {attempt.course_code} -{" "}
                {attempt.course_title}
              </p>
            </div>

          </div>

        </div>
      </div>

      <main className="max-w-5xl mx-auto p-6">

        {/* QUIZ SUMMARY */}

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Completed
              </p>

              <p className="font-semibold mt-1">
                {new Date(
                  attempt.created_at
                ).toLocaleString()}
              </p>
            </div>

            <div className="text-center">

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Final Score
              </p>

              <p
                className={`text-4xl font-bold ${getScoreColor(
                  Number(attempt.percentage || 0)
                )}`}
              >
                {attempt.percentage}%
              </p>

              <p
                className={`font-semibold ${getScoreColor(
                  Number(attempt.percentage || 0)
                )}`}
              >
                {getResultLabel(
                  Number(attempt.percentage || 0)
                )}
              </p>

            </div>

            <div className="text-center">

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Time Taken
              </p>

              <p className="text-xl font-bold mt-1">
                {formatTime(
                  attempt.time_taken_seconds
                )}
              </p>

            </div>

          </div>

          {/* STATISTICS */}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">

            <ReviewStat
              title="Questions"
              value={questions.length}
              icon="❓"
            />

            <ReviewStat
              title="Correct"
              value={reviewStats.correct}
              icon="✅"
            />

            <ReviewStat
              title="Incorrect"
              value={reviewStats.incorrect}
              icon="❌"
            />

            <ReviewStat
              title="Unanswered"
              value={reviewStats.unanswered}
              icon="⚪"
            />

          </div>

        </div>

        {/* QUICK ACTIONS */}

        <div className="flex flex-wrap gap-3 mt-6">

          <button
            onClick={() =>
              navigate("/quiz-history")
            }
            className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-3 rounded-lg font-semibold"
          >
            📚 Quiz History
          </button>

          <button
            onClick={() =>
              navigate("/quiz-performance")
            }
            className="bg-purple-700 hover:bg-purple-800 text-white px-5 py-3 rounded-lg font-semibold"
          >
            📈 Performance
          </button>

          <button
            onClick={() =>
              navigate(
                `/course-quiz/${attempt.course_code}`
              )
            }
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-semibold"
          >
            🧠 Practice Again
          </button>

        </div>

        {/* QUESTIONS */}

        <div className="mt-8">

          <div className="mb-5">

            <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
              Question-by-Question Review
            </h2>

            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Compare your answers with the correct answers and explanations.
            </p>

          </div>

          <div className="space-y-6">

            {questions.map(
              (question, index) => {

                const selected =
                  answers[String(index)]

                const isAnswered =
                  Boolean(selected)

                const isCorrect =
                  isAnswered &&
                  selected ===
                    question.answer

                return (
                  <div
                    key={index}
                    className={`bg-white dark:bg-slate-900 rounded-2xl shadow border-2 overflow-hidden ${
                      isCorrect
                        ? "border-green-300 dark:border-green-800"
                        : isAnswered
                        ? "border-red-300 dark:border-red-800"
                        : "border-gray-300 dark:border-slate-700"
                    }`}
                  >

                    {/* QUESTION HEADER */}

                    <div
                      className={`px-6 py-4 ${
                        isCorrect
                          ? "bg-green-50 dark:bg-green-950/40"
                          : isAnswered
                          ? "bg-red-50 dark:bg-red-950/40"
                          : "bg-gray-50 dark:bg-slate-800"
                      }`}
                    >

                      <div className="flex items-center justify-between gap-4">

                        <div className="flex items-center gap-3">

                          <span
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                              isCorrect
                                ? "bg-green-600 text-white"
                                : isAnswered
                                ? "bg-red-600 text-white"
                                : "bg-gray-500 text-white"
                            }`}
                          >
                            {index + 1}
                          </span>

                          <span className="font-bold">
                            Question{" "}
                            {index + 1}
                          </span>

                        </div>

                        <span
                          className={`font-bold text-sm ${
                            isCorrect
                              ? "text-green-700 dark:text-green-400"
                              : isAnswered
                              ? "text-red-700 dark:text-red-400"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {isCorrect
                            ? "✓ Correct"
                            : isAnswered
                            ? "✕ Incorrect"
                            : "○ Unanswered"}
                        </span>

                      </div>

                    </div>

                    {/* QUESTION BODY */}

                    <div className="p-6">

                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {question.question}
                      </h3>

                      {/* OPTIONS */}

                      {Array.isArray(
                        question.options
                      ) &&
                        question.options.length >
                          0 && (

                        <div className="mt-6 space-y-3">

                          {question.options.map(
                            (
                              option,
                              optionIndex
                            ) => {

                              const isSelected =
                                selected ===
                                option

                              const isCorrectOption =
                                question.answer ===
                                option

                              let optionClass =
                                "border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800"

                              if (
                                isCorrectOption
                              ) {
                                optionClass =
                                  "border-green-500 bg-green-50 dark:bg-green-950/40"
                              } else if (
                                isSelected
                              ) {
                                optionClass =
                                  "border-red-500 bg-red-50 dark:bg-red-950/40"
                              }

                              return (
                                <div
                                  key={
                                    optionIndex
                                  }
                                  className={`border-2 rounded-xl p-4 ${optionClass}`}
                                >

                                  <div className="flex items-start gap-3">

                                    <span className="font-bold min-w-[28px]">
                                      {String.fromCharCode(
                                        65 +
                                          optionIndex
                                      )}
                                      .
                                    </span>

                                    <div className="flex-1">

                                      <p className="font-medium">
                                        {
                                          option
                                        }
                                      </p>

                                      <div className="flex flex-wrap gap-2 mt-2">

                                        {isCorrectOption && (
                                          <span className="text-xs font-bold text-green-700 dark:text-green-400">
                                            ✓ Correct Answer
                                          </span>
                                        )}

                                        {isSelected &&
                                          !isCorrectOption && (
                                            <span className="text-xs font-bold text-red-700 dark:text-red-400">
                                              Your Answer
                                            </span>
                                          )}

                                      </div>

                                    </div>

                                  </div>

                                </div>
                              )
                            }
                          )}

                        </div>

                      )}

                      {/* ANSWER SUMMARY */}

                      <div className="grid md:grid-cols-2 gap-4 mt-6">

                        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4">

                          <p className="text-sm text-blue-700 dark:text-blue-400 font-bold">
                            👤 Your Answer
                          </p>

                          <p className="mt-2 font-semibold">
                            {selected ||
                              "Not answered"}
                          </p>

                        </div>

                        <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4">

                          <p className="text-sm text-green-700 dark:text-green-400 font-bold">
                            ✓ Correct Answer
                          </p>

                          <p className="mt-2 font-semibold">
                            {question.answer ||
                              "Not available"}
                          </p>

                        </div>

                      </div>

                      {/* EXPLANATION */}

                      {question.explanation && (

                        <div className="mt-6 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl p-5">

                          <p className="font-bold text-purple-800 dark:text-purple-400">
                            💡 Explanation
                          </p>

                          <p className="mt-2 text-gray-700 dark:text-gray-300 leading-relaxed">
                            {
                              question.explanation
                            }
                          </p>

                        </div>

                      )}

                    </div>

                  </div>
                )
              }
            )}

          </div>

        </div>

        {/* BOTTOM ACTIONS */}

        <div className="flex flex-wrap justify-center gap-3 mt-10 pb-8">

          <button
            onClick={() =>
              navigate("/quiz-history")
            }
            className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold"
          >
            ← Back to Quiz History
          </button>

          <button
            onClick={() =>
              navigate("/quiz-performance")
            }
            className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-lg font-semibold"
          >
            📈 View Performance
          </button>

        </div>

      </main>

    </div>
  )
}

function ReviewStat({
  title,
  value,
  icon,
}) {
  return (
    <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 text-center">

      <div className="text-2xl">
        {icon}
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {title}
      </p>

      <p className="text-2xl font-bold text-blue-900 dark:text-blue-400 mt-1">
        {value}
      </p>

    </div>
  )
}

export default QuizReview