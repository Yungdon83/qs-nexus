import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

function QuizLeaderboard() {
  const navigate = useNavigate()

  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadLeaderboard()
  }, [])

  async function loadLeaderboard() {
    setLoading(true)
    setError("")

    try {
      // Get all quiz attempts
      const {
        data: attempts,
        error: attemptsError,
      } = await supabase
        .from("quiz_attempts")
        .select(
          "id, user_id, course_code, course_title, score, question_count, percentage, created_at"
        )
        .order("percentage", {
          ascending: false,
        })

      if (attemptsError) {
        console.error(
          "ATTEMPTS ERROR:",
          attemptsError
        )

        setError(attemptsError.message)
        setLoading(false)
        return
      }

      if (!attempts || attempts.length === 0) {
        setLeaderboard([])
        setLoading(false)
        return
      }

      // Get unique user IDs
      const userIds = [
        ...new Set(
          attempts
            .map((attempt) => attempt.user_id)
            .filter(Boolean)
        ),
      ]

      // Get profiles separately
      let profiles = []

      if (userIds.length > 0) {
        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("id, full_name, level")
          .in("id", userIds)

        if (profileError) {
          console.error(
            "PROFILE ERROR:",
            profileError
          )
        } else {
          profiles = profileData || []
        }
      }

      // Create profile lookup
      const profileMap = {}

      profiles.forEach((profile) => {
        profileMap[profile.id] = profile
      })

      // Combine attempts with profiles
      const combinedAttempts =
        attempts.map((attempt) => {
          const profile =
            profileMap[attempt.user_id]

          return {
            ...attempt,
            full_name:
              profile?.full_name ||
              "Student",
            level:
              profile?.level || "—",
          }
        })

      // Calculate student statistics
      const studentStats = {}

      combinedAttempts.forEach(
        (attempt) => {
          const userId =
            attempt.user_id

          if (!studentStats[userId]) {
            studentStats[userId] = {
              user_id: userId,
              full_name:
                attempt.full_name,
              level: attempt.level,
              attempts: 0,
              totalScore: 0,
              totalQuestions: 0,
              bestScore: 0,
            }
          }

          const student =
            studentStats[userId]

          student.attempts += 1

          student.totalScore += Number(
            attempt.score || 0
          )

          student.totalQuestions += Number(
            attempt.question_count || 0
          )

          student.bestScore = Math.max(
            student.bestScore,
            Number(
              attempt.percentage || 0
            )
          )
        }
      )

      // Calculate averages
      const students = Object.values(
        studentStats
      ).map((student) => ({
        ...student,

        average:
          student.totalQuestions > 0
            ? Math.round(
                (student.totalScore /
                  student.totalQuestions) *
                  100
              )
            : 0,
      }))

      // Sort by average score
      students.sort(
        (a, b) =>
          b.average - a.average
      )

      // Add ranking
      const rankedStudents =
        students.map(
          (student, index) => ({
            ...student,
            rank: index + 1,
          })
        )

      setLeaderboard(
        rankedStudents
      )
    } catch (err) {
      console.error(
        "LEADERBOARD ERROR:",
        err
      )

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load leaderboard."
      )
    } finally {
      setLoading(false)
    }
  }

  function getRankStyle(rank) {
    if (rank === 1) {
      return "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700"
    }

    if (rank === 2) {
      return "bg-gray-100 dark:bg-slate-800 border-gray-300 dark:border-slate-600"
    }

    if (rank === 3) {
      return "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700"
    }

    return "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700"
  }

  function getRankIcon(rank) {
    if (rank === 1) return "🥇"
    if (rank === 2) return "🥈"
    if (rank === 3) return "🥉"

    return `#${rank}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-950 flex items-center justify-center">

        <div className="text-center">

          <div className="text-6xl mb-5">
            🏆
          </div>

          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
            Loading Leaderboard...
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Calculating student rankings.
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
              navigate(
                "/student-dashboard"
              )
            }
            className="text-blue-100 hover:text-white mb-5"
          >
            ← Back to Dashboard
          </button>

          <div className="flex items-center gap-4">

            <div className="text-5xl">
              🏆
            </div>

            <div>

              <h1 className="text-3xl font-bold">
                Quiz Leaderboard
              </h1>

              <p className="text-blue-100 mt-1">
                See how students are performing across QS Nexus quizzes.
              </p>

            </div>

          </div>

        </div>

      </div>

      <div className="max-w-6xl mx-auto p-6">

        {/* ERROR */}

        {error && (

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl p-5 mb-6">

            <h2 className="font-bold text-lg">
              Unable to load leaderboard
            </h2>

            <p className="mt-2 break-words">
              {error}
            </p>

            <button
              onClick={loadLeaderboard}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold"
            >
              Try Again
            </button>

          </div>

        )}

        {/* EMPTY */}

        {!error &&
          leaderboard.length === 0 && (

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-10 text-center">

              <div className="text-6xl mb-5">
                📊
              </div>

              <h2 className="text-2xl font-bold">
                No Quiz Results Yet
              </h2>

              <p className="text-gray-500 dark:text-gray-400 mt-3">
                Students need to complete quizzes before the leaderboard can be populated.
              </p>

            </div>
          )}

        {/* TOP THREE */}

        {leaderboard.length > 0 && (

          <>

            <div className="grid md:grid-cols-3 gap-5 mb-8">

              {leaderboard
                .slice(0, 3)
                .map((student) => (

                  <div
                    key={student.user_id}
                    className={`rounded-2xl border p-6 text-center shadow ${getRankStyle(
                      student.rank
                    )}`}
                  >

                    <div className="text-5xl mb-3">
                      {getRankIcon(
                        student.rank
                      )}
                    </div>

                    <h2 className="text-xl font-bold">
                      {student.full_name}
                    </h2>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {student.level}
                    </p>

                    <p className="text-4xl font-bold text-blue-900 dark:text-blue-400 mt-5">
                      {student.average}%
                    </p>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Average Score
                    </p>

                    <div className="mt-4 text-sm">

                      <p>
                        🧠{" "}
                        {student.attempts}{" "}
                        quiz{" "}
                        {student.attempts ===
                        1
                          ? "attempt"
                          : "attempts"}
                      </p>

                      <p className="mt-1">
                        🏆 Best:{" "}
                        {student.bestScore}%
                      </p>

                    </div>

                  </div>
                ))}

            </div>

            {/* FULL LEADERBOARD */}

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow overflow-hidden">

              <div className="p-6 border-b border-gray-200 dark:border-slate-700">

                <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
                  All Students
                </h2>

                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Rankings are based on average quiz performance.
                </p>

              </div>

              <div className="p-5 space-y-4">

                {leaderboard.map(
                  (student) => (

                    <div
                      key={
                        student.user_id
                      }
                      className={`border rounded-xl p-5 ${getRankStyle(
                        student.rank
                      )}`}
                    >

                      <div className="flex flex-col md:flex-row md:items-center gap-5">

                        {/* RANK */}

                        <div className="w-16 text-center">

                          <span className="text-2xl font-bold">
                            {getRankIcon(
                              student.rank
                            )}
                          </span>

                        </div>

                        {/* STUDENT */}

                        <div className="flex-1">

                          <h3 className="font-bold text-lg">
                            {
                              student.full_name
                            }
                          </h3>

                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {student.level}
                          </p>

                        </div>

                        {/* ATTEMPTS */}

                        <div className="text-center min-w-[100px]">

                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Attempts
                          </p>

                          <p className="text-xl font-bold">
                            {
                              student.attempts
                            }
                          </p>

                        </div>

                        {/* AVERAGE */}

                        <div className="text-center min-w-[110px]">

                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Average
                          </p>

                          <p className="text-2xl font-bold text-blue-900 dark:text-blue-400">
                            {
                              student.average
                            }%
                          </p>

                        </div>

                        {/* BEST */}

                        <div className="text-center min-w-[100px]">

                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Best
                          </p>

                          <p className="text-xl font-bold text-green-600 dark:text-green-400">
                            {
                              student.bestScore
                            }%
                          </p>

                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>

            </div>

          </>
        )}

      </div>

    </div>
  )
}

export default QuizLeaderboard