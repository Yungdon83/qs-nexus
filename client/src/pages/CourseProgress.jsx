import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

function CourseProgress() {
  const navigate = useNavigate()

  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadProgress()
  }, [])

  async function loadProgress() {
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
          ascending: true,
        })

      if (attemptsError) {
        throw attemptsError
      }

      setAttempts(data || [])
    } catch (err) {
      console.error("COURSE PROGRESS ERROR:", err)

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load course progress."
      )
    } finally {
      setLoading(false)
    }
  }

  const courses = useMemo(() => {
    const grouped = {}

    attempts.forEach((attempt) => {
      const code =
        attempt.course_code || "UNKNOWN"

      const title =
        attempt.course_title ||
        "Unknown Course"

      if (!grouped[code]) {
        grouped[code] = {
          course_code: code,
          course_title: title,
          attempts: [],
        }
      }

      grouped[code].attempts.push(attempt)
    })

    return Object.values(grouped).map(
      (course) => {
        const courseAttempts =
          course.attempts

        const totalQuestions =
          courseAttempts.reduce(
            (sum, attempt) =>
              sum +
              Number(
                attempt.question_count ||
                  0
              ),
            0
          )

        const totalCorrect =
          courseAttempts.reduce(
            (sum, attempt) =>
              sum +
              Number(
                attempt.score || 0
              ),
            0
          )

        const average = Math.round(
          courseAttempts.reduce(
            (sum, attempt) =>
              sum +
              Number(
                attempt.percentage ||
                  0
              ),
            0
          ) / courseAttempts.length
        )

        const best = Math.max(
          ...courseAttempts.map(
            (attempt) =>
              Number(
                attempt.percentage ||
                  0
              )
          )
        )

        const accuracy =
          totalQuestions > 0
            ? Math.round(
                (totalCorrect /
                  totalQuestions) *
                  100
              )
            : 0

        const firstScore =
          Number(
            courseAttempts[0]
              ?.percentage || 0
          )

        const latestScore =
          Number(
            courseAttempts[
              courseAttempts.length - 1
            ]?.percentage || 0
          )

        const improvement =
          latestScore - firstScore

        let level = "Needs Attention"

        if (average >= 80) {
          level = "Excellent"
        } else if (average >= 70) {
          level = "Good"
        } else if (average >= 50) {
          level = "Developing"
        }

        return {
          ...course,
          totalQuestions,
          totalCorrect,
          average,
          best,
          accuracy,
          firstScore,
          latestScore,
          improvement,
          level,
        }
      }
    )
  }, [attempts])

  const overall = useMemo(() => {
    if (attempts.length === 0) {
      return {
        quizzes: 0,
        questions: 0,
        correct: 0,
        average: 0,
        best: 0,
      }
    }

    const questions =
      attempts.reduce(
        (sum, attempt) =>
          sum +
          Number(
            attempt.question_count || 0
          ),
        0
      )

    const correct =
      attempts.reduce(
        (sum, attempt) =>
          sum +
          Number(
            attempt.score || 0
          ),
        0
      )

    const average = Math.round(
      attempts.reduce(
        (sum, attempt) =>
          sum +
          Number(
            attempt.percentage || 0
          ),
        0
      ) / attempts.length
    )

    const best = Math.max(
      ...attempts.map((attempt) =>
        Number(
          attempt.percentage || 0
        )
      )
    )

    return {
      quizzes: attempts.length,
      questions,
      correct,
      average,
      best,
    }
  }, [attempts])

  const strongestCourse = useMemo(() => {
    if (courses.length === 0) {
      return null
    }

    return [...courses].sort(
      (a, b) =>
        b.average - a.average
    )[0]
  }, [courses])

  const weakestCourse = useMemo(() => {
    if (courses.length === 0) {
      return null
    }

    return [...courses].sort(
      (a, b) =>
        a.average - b.average
    )[0]
  }, [courses])

  const improvingCourses = useMemo(() => {
    return [...courses]
      .filter(
        (course) =>
          course.improvement > 0
      )
      .sort(
        (a, b) =>
          b.improvement -
          a.improvement
      )
  }, [courses])

  function getLevelColor(level) {
    if (level === "Excellent") {
      return "text-blue-600 dark:text-blue-400"
    }

    if (level === "Good") {
      return "text-green-600 dark:text-green-400"
    }

    if (level === "Developing") {
      return "text-yellow-600 dark:text-yellow-400"
    }

    return "text-red-600 dark:text-red-400"
  }

  function getProgressColor(score) {
    if (score >= 80) {
      return "bg-blue-500"
    }

    if (score >= 70) {
      return "bg-green-500"
    }

    if (score >= 50) {
      return "bg-yellow-500"
    }

    return "bg-red-500"
  }

  function getProgressBackground(score) {
    if (score >= 80) {
      return "bg-blue-100 dark:bg-blue-900/30"
    }

    if (score >= 70) {
      return "bg-green-100 dark:bg-green-900/30"
    }

    if (score >= 50) {
      return "bg-yellow-100 dark:bg-yellow-900/30"
    }

    return "bg-red-100 dark:bg-red-900/30"
  }

  function getImprovementText(value) {
    if (value > 0) {
      return `↑ ${value}% improvement`
    }

    if (value < 0) {
      return `↓ ${Math.abs(value)}% from first attempt`
    }

    return "No change yet"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-5">
            🎓
          </div>

          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
            Loading Your Progress...
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Calculating your course mastery.
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
            Progress Error
          </h1>

          <p className="mt-4 text-gray-600 dark:text-gray-300 break-words">
            {error}
          </p>

          <button
            onClick={loadProgress}
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
              🎓
            </div>

            <div>

              <h1 className="text-3xl font-bold">
                Course Progress
              </h1>

              <p className="text-blue-100 mt-1">
                Track your learning progress and course mastery.
              </p>

            </div>

          </div>

        </div>

      </div>

      <div className="max-w-7xl mx-auto p-6">

        {attempts.length === 0 ? (

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-10 text-center">

            <div className="text-6xl mb-5">
              📚
            </div>

            <h2 className="text-2xl font-bold">
              No Progress Yet
            </h2>

            <p className="mt-3 text-gray-500 dark:text-gray-400">
              Complete some quizzes to start building your course progress.
            </p>

            <button
              onClick={() =>
                navigate(
                  "/student-dashboard"
                )
              }
              className="mt-6 bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Go to Dashboard
            </button>

          </div>

        ) : (

          <>

            {/* OVERALL STATS */}

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">

              <ProgressStat
                title="Quizzes"
                value={overall.quizzes}
                icon="📝"
              />

              <ProgressStat
                title="Questions"
                value={overall.questions}
                icon="❓"
              />

              <ProgressStat
                title="Correct"
                value={overall.correct}
                icon="✅"
              />

              <ProgressStat
                title="Average"
                value={`${overall.average}%`}
                icon="📊"
              />

              <ProgressStat
                title="Best Score"
                value={`${overall.best}%`}
                icon="🏆"
              />

            </div>

            {/* HIGHLIGHTS */}

            <div className="grid md:grid-cols-3 gap-5 mt-8">

              {strongestCourse && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-6">

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    🏆 Strongest Course
                  </p>

                  <h3 className="text-xl font-bold mt-2 text-blue-900 dark:text-blue-400">
                    {
                      strongestCourse.course_code
                    }
                  </h3>

                  <p className="text-sm mt-1">
                    {
                      strongestCourse.course_title
                    }
                  </p>

                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-4">
                    {
                      strongestCourse.average
                    }%
                  </p>

                </div>
              )}

              {weakestCourse && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-6">

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    🎯 Priority Course
                  </p>

                  <h3 className="text-xl font-bold mt-2 text-blue-900 dark:text-blue-400">
                    {
                      weakestCourse.course_code
                    }
                  </h3>

                  <p className="text-sm mt-1">
                    {
                      weakestCourse.course_title
                    }
                  </p>

                  <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-4">
                    {
                      weakestCourse.average
                    }%
                  </p>

                </div>
              )}

              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-6">

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  🚀 Courses Improving
                </p>

                <p className="text-3xl font-bold text-blue-900 dark:text-blue-400 mt-3">
                  {
                    improvingCourses.length
                  }
                </p>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Courses with a higher latest score than their first attempt.
                </p>

              </div>

            </div>

            {/* COURSE MASTERY */}

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-6 mt-8">

              <div className="flex items-center gap-3">

                <span className="text-3xl">
                  📚
                </span>

                <div>

                  <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
                    Course Mastery
                  </h2>

                  <p className="text-gray-500 dark:text-gray-400">
                    Your current performance in each course.
                  </p>

                </div>

              </div>

              <div className="mt-6 space-y-6">

                {courses
                  .sort(
                    (a, b) =>
                      a.average -
                      b.average
                  )
                  .map((course) => (

                    <div
                      key={
                        course.course_code
                      }
                      className="border border-gray-200 dark:border-slate-700 rounded-xl p-5"
                    >

                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                        <div>

                          <div className="flex items-center gap-3 flex-wrap">

                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-bold">
                              {
                                course.course_code
                              }
                            </span>

                            <span
                              className={`font-bold ${getLevelColor(
                                course.level
                              )}`}
                            >
                              {
                                course.level
                              }
                            </span>

                          </div>

                          <h3 className="text-lg font-bold mt-3">
                            {
                              course.course_title
                            }
                          </h3>

                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {
                              course.attempts
                                .length
                            } quiz{" "}
                            {
                              course.attempts
                                .length ===
                              1
                                ? "attempt"
                                : "attempts"
                            }
                          </p>

                        </div>

                        <div className="text-left md:text-right">

                          <p className="text-3xl font-bold text-blue-900 dark:text-blue-400">
                            {
                              course.average
                            }%
                          </p>

                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Average
                          </p>

                        </div>

                      </div>

                      {/* PROGRESS */}

                      <div className="mt-5">

                        <div className="flex justify-between text-sm mb-2">

                          <span className="font-semibold">
                            Mastery
                          </span>

                          <span>
                            {
                              course.average
                            }%
                          </span>

                        </div>

                        <div className="w-full h-4 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">

                          <div
                            className={`h-full ${getProgressColor(
                              course.average
                            )} transition-all duration-500`}
                            style={{
                              width: `${Math.min(
                                course.average,
                                100
                              )}%`,
                            }}
                          />

                        </div>

                      </div>

                      {/* DETAILS */}

                      <div className="grid sm:grid-cols-4 gap-4 mt-5">

                        <div
                          className={`rounded-lg p-3 ${getProgressBackground(
                            course.average
                          )}`}
                        >

                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Best
                          </p>

                          <p className="font-bold">
                            {
                              course.best
                            }%
                          </p>

                        </div>

                        <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">

                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Accuracy
                          </p>

                          <p className="font-bold">
                            {
                              course.accuracy
                            }%
                          </p>

                        </div>

                        <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">

                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Latest
                          </p>

                          <p className="font-bold">
                            {
                              course.latestScore
                            }%
                          </p>

                        </div>

                        <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">

                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Progress
                          </p>

                          <p
                            className={`font-bold ${
                              course.improvement >
                              0
                                ? "text-green-600 dark:text-green-400"
                                : course.improvement <
                                    0
                                  ? "text-red-600 dark:text-red-400"
                                  : ""
                            }`}
                          >
                            {getImprovementText(
                              course.improvement
                            )}
                          </p>

                        </div>

                      </div>

                      <button
                        onClick={() =>
                          navigate(
                            `/course-quiz/${course.course_code}`
                          )
                        }
                        className="mt-5 bg-blue-900 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-semibold"
                      >
                        🧠 Practice{" "}
                        {
                          course.course_code
                        }
                      </button>

                    </div>

                  ))}

              </div>

            </div>

            {/* IMPROVEMENT SECTION */}

            {improvingCourses.length >
              0 && (

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 mt-8">

                <div className="flex items-center gap-3">

                  <span className="text-3xl">
                    🚀
                  </span>

                  <div>

                    <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">
                      You're Improving!
                    </h2>

                    <p className="text-green-700/70 dark:text-green-300/70">
                      These courses show positive progress between your first and latest attempts.
                    </p>

                  </div>

                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-5">

                  {improvingCourses
                    .slice(0, 3)
                    .map((course) => (

                      <div
                        key={
                          course.course_code
                        }
                        className="bg-white dark:bg-slate-900 rounded-xl p-4"
                      >

                        <p className="font-bold text-blue-900 dark:text-blue-400">
                          {
                            course.course_code
                          }
                        </p>

                        <p className="text-sm mt-1">
                          {
                            course.course_title
                          }
                        </p>

                        <p className="text-green-600 dark:text-green-400 font-bold mt-3">
                          {
                            getImprovementText(
                              course.improvement
                            )
                          }
                        </p>

                      </div>

                    ))}

                </div>

              </div>

            )}

            {/* STUDY RECOMMENDATION */}

            {weakestCourse && (

              <div className="bg-blue-900 dark:bg-slate-900 rounded-2xl shadow p-8 mt-8 text-white">

                <div className="flex items-start gap-4">

                  <div className="text-4xl">
                    🤖
                  </div>

                  <div>

                    <h2 className="text-2xl font-bold">
                      Your Next Best Step
                    </h2>

                    <p className="mt-3 text-blue-100">
                      Your current priority course is{" "}
                      <strong>
                        {
                          weakestCourse.course_code
                        }
                      </strong>
                      {" "}
                      (
                      {
                        weakestCourse.average
                      }%
                      average). Spend some extra study time reviewing this course and complete another practice quiz.
                    </p>

                    <button
                      onClick={() =>
                        navigate(
                          `/course-quiz/${weakestCourse.course_code}`
                        )
                      }
                      className="mt-5 bg-white text-blue-900 hover:bg-blue-50 px-5 py-3 rounded-lg font-bold"
                    >
                      Practice Now →
                    </button>

                  </div>

                </div>

              </div>

            )}

          </>

        )}

      </div>

    </div>
  )
}

function ProgressStat({
  title,
  value,
  icon,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-5">

      <div className="flex items-center justify-between">

        <p className="text-gray-500 dark:text-gray-400">
          {title}
        </p>

        <span className="text-2xl">
          {icon}
        </span>

      </div>

      <p className="text-3xl font-bold text-blue-900 dark:text-blue-400 mt-3">
        {value}
      </p>

    </div>
  )
}

export default CourseProgress