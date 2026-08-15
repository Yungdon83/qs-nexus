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
        setError("You must be logged in to view your quiz history.")
        setLoading(false)
        return
      }

      const {
        data,
        error: attemptsError,
      } = await supabase
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

  function formatDate(dateString) {
    if (!dateString) {
      return "Unknown date"
    }

    return new Date(dateString).toLocaleString()
  }

  function formatTime(seconds) {
    if (!seconds || seconds <= 0) {
      return "Not recorded"
    }

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (minutes === 0) {
      return `${remainingSeconds}s`
    }

    return `${minutes}m ${remainingSeconds}s`
  }

  function getScoreColor(percentage) {
    if (percentage >= 70) {
      return "text-green-600 dark:text-green-400"
    }

    if (percentage >= 50) {
      return "text-yellow-600 dark:text-yellow-400"
    }

    return "text-red-600 dark:text-red-400"
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
            Retrieving your previous quiz attempts.
          </p>

        </div>

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 text-gray-800 dark:text-gray-100">

      {/* HEADER */}

      <div className="bg-blue-900 dark:bg-slate-900 text-white shadow-lg">

        <div className="max-w-6xl mx-auto px-6 py-6">

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
              📊
            </div>

            <div>

              <h1 className="text-3xl font-bold">
                Quiz History
              </h1>

              <p className="text-blue-100 mt-1">
                Review your previous AI quiz attempts.
              </p>

            </div>

          </div>

        </div>

      </div>

      <div className="max-w-6xl mx-auto p-6">

        {/* ERROR */}

        {error && (

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-xl p-6 mb-6">

            <h2 className="text-xl font-bold text-red-700 dark:text-red-400">
              Unable to load quiz history
            </h2>

            <p className="mt-2 text-red-600 dark:text-red-300 break-words">
              {error}
            </p>

            <button
              onClick={loadHistory}
              className="mt-5 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold"
            >
              Try Again
            </button>

          </div>

        )}

        {/* EMPTY */}

        {!error && attempts.length === 0 && (

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-10 text-center">

            <div className="text-6xl mb-5">
              📝
            </div>

            <h2 className="text-2xl font-bold">
              No Quiz Attempts Yet
            </h2>

            <p className="mt-3 text-gray-500 dark:text-gray-400">
              Complete an AI course quiz and your result will appear here.
            </p>

            <button
              onClick={() =>
                navigate("/student-dashboard")
              }
              className="mt-6 bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Go to Dashboard
            </button>

          </div>

        )}

        {/* HISTORY */}

        {!error && attempts.length > 0 && (

          <div className="space-y-5">

            {attempts.map((attempt) => (

              <div
                key={attempt.id}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl shadow p-6"
              >

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                  {/* COURSE */}

                  <div className="flex-1">

                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                      {attempt.course_code}
                    </p>

                    <h2 className="text-xl font-bold mt-1">
                      {attempt.course_title}
                    </h2>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      📅 {formatDate(attempt.created_at)}
                    </p>

                  </div>

                  {/* SCORE */}

                  <div className="text-center">

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Score
                    </p>

                    <p
                      className={`text-3xl font-bold ${getScoreColor(
                        Number(attempt.percentage)
                      )}`}
                    >
                      {attempt.score}/
                      {attempt.question_count}
                    </p>

                    <p
                      className={`font-semibold ${getScoreColor(
                        Number(attempt.percentage)
                      )}`}
                    >
                      {attempt.percentage}%
                    </p>

                  </div>

                  {/* TIME */}

                  <div className="text-center">

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Time Taken
                    </p>

                    <p className="font-bold text-lg">
                      ⏱️{" "}
                      {formatTime(
                        attempt.time_taken_seconds
                      )}
                    </p>

                  </div>

                  {/* REVIEW */}

                  <div>

                    <button
                      onClick={() =>
                        navigate(
                          `/quiz-review/${attempt.id}`
                        )
                      }
                      className="bg-blue-900 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold"
                    >
                      🔍 Review Attempt
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  )
}

export default QuizHistory