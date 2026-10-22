import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

function QuizHistory() {
  const navigate = useNavigate()

  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadHistory()
  }, [])

  async function loadHistory() {
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

      const { data, error: attemptsError } =
        await supabase
          .from("quiz_attempts")
          .select(
            "id, course_code, course_title, question_count, score, percentage, time_taken_seconds, created_at"
          )
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          })

      if (attemptsError) {
        throw attemptsError
      }

      setAttempts(data || [])
    } catch (err) {
      console.error("QUIZ HISTORY ERROR:", err)

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load quiz history."
      )
    } finally {
      setLoading(false)
    }
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

  function getBadge(score) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-5">
            📚
          </div>

          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
            Loading Quiz History...
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Retrieving your previous attempts.
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
            Quiz History Error
          </h1>

          <p className="mt-4 text-gray-600 dark:text-gray-300 break-words">
            {error}
          </p>

          <button
            onClick={loadHistory}
            className="mt-6 bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 text-gray-800 dark:text-gray-100">

      {/* HEADER */}

      <div className="bg-blue-900 dark:bg-slate-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">

          <button
            onClick={() =>
              navigate("/student-dashboard")
            }
            className="text-blue-100 hover:text-white mb-5"
          >
            ← Back to Dashboard
          </button>

          <div className="flex items-center gap-4">

            <div className="text-5xl">
              📚
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                Quiz History
              </h1>

              <p className="text-blue-100 mt-1">
                View and review all your previous quiz attempts.
              </p>
            </div>

          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-6">

        {/* TOP ACTIONS */}

        <div className="flex flex-wrap gap-3 mb-6">

          <button
            onClick={() =>
              navigate("/quiz-performance")
            }
            className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-3 rounded-lg font-semibold"
          >
            📈 View Performance
          </button>

          <button
            onClick={() =>
              navigate("/student-dashboard")
            }
            className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 px-5 py-3 rounded-lg font-semibold"
          >
            🏠 Dashboard
          </button>

        </div>

        {/* EMPTY */}

        {attempts.length === 0 ? (

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-10 text-center">

            <div className="text-6xl mb-5">
              📝
            </div>

            <h2 className="text-2xl font-bold">
              No Quiz Attempts Yet
            </h2>

            <p className="mt-3 text-gray-500 dark:text-gray-400">
              Complete your first quiz and your results will appear here.
            </p>

            <button
              onClick={() =>
                navigate("/student-dashboard")
              }
              className="mt-6 bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Find a Quiz
            </button>

          </div>

        ) : (

          <div className="space-y-5">

            {attempts.map((attempt, index) => {

              const percentage =
                Number(
                  attempt.percentage || 0
                )

              return (
                <div
                  key={attempt.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl shadow p-6"
                >

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                    {/* INFO */}

                    <div className="flex items-start gap-4">

                      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl font-bold text-blue-900 dark:text-blue-400">
                        {index + 1}
                      </div>

                      <div>

                        <p className="font-bold text-blue-900 dark:text-blue-400">
                          {attempt.course_code}
                        </p>

                        <h2 className="text-xl font-bold mt-1">
                          {attempt.course_title}
                        </h2>

                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          {new Date(
                            attempt.created_at
                          ).toLocaleString()}
                        </p>

                      </div>

                    </div>

                    {/* SCORE */}

                    <div className="flex flex-wrap items-center gap-6">

                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Score
                        </p>

                        <p className="text-xl font-bold">
                          {attempt.score}/
                          {attempt.question_count}
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Percentage
                        </p>

                        <p
                          className={`text-3xl font-bold ${getScoreColor(
                            percentage
                          )}`}
                        >
                          {percentage}%
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Time
                        </p>

                        <p className="font-semibold">
                          {formatTime(
                            attempt.time_taken_seconds
                          )}
                        </p>
                      </div>

                    </div>

                  </div>

                  {/* PROGRESS */}

                  <div className="mt-6">

                    <div className="flex justify-between text-sm mb-2">

                      <span className="text-gray-500 dark:text-gray-400">
                        Performance
                      </span>

                      <span
                        className={`font-semibold ${getScoreColor(
                          percentage
                        )}`}
                      >
                        {getBadge(percentage)}
                      </span>

                    </div>

                    <div className="w-full h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">

                      <div
                        className={`h-full ${
                          percentage >= 70
                            ? "bg-green-500"
                            : percentage >= 50
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            percentage,
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="mt-5 flex flex-wrap gap-3">

                    <button
                      onClick={() =>
                        navigate(
                          `/quiz-review/${attempt.id}`
                        )
                      }
                      className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-semibold"
                    >
                      🔍 Review Quiz
                    </button>

                  </div>

                </div>
              )
            })}

          </div>

        )}

      </main>

    </div>
  )
}

export default QuizHistory