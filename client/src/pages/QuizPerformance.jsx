import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

function QuizPerformance() {
  const navigate = useNavigate()

  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState("")

  useEffect(() => {
    loadPerformance()
  }, [])

  async function loadPerformance() {
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
          "id, course_code, course_title, question_count, score, percentage, time_taken_seconds, questions, answers, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        })

      if (attemptsError) {
        throw attemptsError
      }

      const attemptData = data || []

      setAttempts(attemptData)

      if (attemptData.length > 0) {
        generateAIAnalysis(attemptData)
      }
    } catch (err) {
      console.error(
        "PERFORMANCE ERROR:",
        err
      )

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load performance data."
      )
    } finally {
      setLoading(false)
    }
  }

  async function generateAIAnalysis(
    attemptData
  ) {
    if (
      !attemptData ||
      attemptData.length === 0
    ) {
      return
    }

    setAnalyzing(true)
    setAnalysisError("")

    try {
      const { data, error } =
        await supabase.functions.invoke(
          "analyze-performance",
          {
            body: {
              attempts:
                attemptData.slice(0, 10),
            },
          }
        )

      console.log(
        "AI PERFORMANCE ANALYSIS:",
        data
      )

      console.log(
        "AI PERFORMANCE ERROR:",
        error
      )

      if (error) {
        let details =
          error.message ||
          "Unable to generate AI analysis."

        if (error.context) {
          try {
            const responseText =
              await error.context.text()

            if (responseText) {
              details = responseText
            }
          } catch {
            console.log(
              "Could not read AI error response."
            )
          }
        }

        throw new Error(details)
      }

      if (!data?.analysis) {
        throw new Error(
          data?.error ||
            "AI returned no performance analysis."
        )
      }

      setAiAnalysis(data.analysis)
    } catch (err) {
      console.error(
        "AI ANALYSIS ERROR:",
        err
      )

      setAnalysisError(
        err instanceof Error
          ? err.message
          : "Unable to generate AI analysis."
      )
    } finally {
      setAnalyzing(false)
    }
  }

  const statistics = useMemo(() => {
    if (attempts.length === 0) {
      return {
        quizzes: 0,
        questions: 0,
        correct: 0,
        accuracy: 0,
        average: 0,
        best: 0,
      }
    }

    const quizzes = attempts.length

    const questions = attempts.reduce(
      (total, attempt) =>
        total +
        Number(
          attempt.question_count || 0
        ),
      0
    )

    const correct = attempts.reduce(
      (total, attempt) =>
        total +
        Number(attempt.score || 0),
      0
    )

    const accuracy =
      questions > 0
        ? Math.round(
            (correct / questions) * 100
          )
        : 0

    const average = Math.round(
      attempts.reduce(
        (total, attempt) =>
          total +
          Number(
            attempt.percentage || 0
          ),
        0
      ) / quizzes
    )

    const best = Math.max(
      ...attempts.map((attempt) =>
        Number(
          attempt.percentage || 0
        )
      )
    )

    return {
      quizzes,
      questions,
      correct,
      accuracy,
      average,
      best,
    }
  }, [attempts])

  const coursePerformance =
    useMemo(() => {
      const grouped = {}

      attempts.forEach((attempt) => {
        const code =
          attempt.course_code ||
          "Unknown"

        const title =
          attempt.course_title ||
          "Unknown Course"

        if (!grouped[code]) {
          grouped[code] = {
            course_code: code,
            course_title: title,
            attempts: 0,
            totalPercentage: 0,
            best: 0,
          }
        }

        grouped[code].attempts += 1

        grouped[
          code
        ].totalPercentage += Number(
          attempt.percentage || 0
        )

        grouped[code].best =
          Math.max(
            grouped[code].best,
            Number(
              attempt.percentage || 0
            )
          )
      })

      return Object.values(grouped)
        .map((course) => ({
          ...course,
          average: Math.round(
            course.totalPercentage /
              course.attempts
          ),
        }))
        .sort(
          (a, b) =>
            a.average - b.average
        )
    }, [attempts])

  const weakestCourses =
    coursePerformance.slice(0, 3)

  const strongestCourses =
    [...coursePerformance]
      .sort(
        (a, b) =>
          b.average - a.average
      )
      .slice(0, 3)

  function getPerformanceLabel(
    score
  ) {
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

  function getScoreColor(score) {
    if (score >= 70) {
      return "text-green-600 dark:text-green-400"
    }

    if (score >= 50) {
      return "text-yellow-600 dark:text-yellow-400"
    }

    return "text-red-600 dark:text-red-400"
  }

  function getProgressColor(score) {
    if (score >= 70) {
      return "bg-green-500"
    }

    if (score >= 50) {
      return "bg-yellow-500"
    }

    return "bg-red-500"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-5">
            📈
          </div>

          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
            Loading Your Performance...
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Calculating your quiz statistics.
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
            Performance Error
          </h1>

          <p className="mt-4 text-gray-600 dark:text-gray-300 break-words">
            {error}
          </p>

          <button
            onClick={loadPerformance}
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
              📈
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                My Learning Performance
              </h1>

              <p className="text-blue-100 mt-1">
                Track your quiz performance and identify areas that need more attention.
              </p>
            </div>

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">

        {/* NO ATTEMPTS */}

        {attempts.length === 0 ? (

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-10 text-center">

            <div className="text-6xl mb-5">
              📚
            </div>

            <h2 className="text-2xl font-bold">
              No Performance Data Yet
            </h2>

            <p className="mt-3 text-gray-500 dark:text-gray-400">
              Complete some AI quizzes and your performance analysis will appear here.
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

            {/* STATISTICS */}

            <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-5">

              <StatCard
                title="Quizzes"
                value={
                  statistics.quizzes
                }
                icon="📝"
              />

              <StatCard
                title="Questions"
                value={
                  statistics.questions
                }
                icon="❓"
              />

              <StatCard
                title="Correct"
                value={
                  statistics.correct
                }
                icon="✅"
              />

              <StatCard
                title="Accuracy"
                value={`${statistics.accuracy}%`}
                icon="🎯"
              />

              <StatCard
                title="Average"
                value={`${statistics.average}%`}
                icon="📊"
              />

              <StatCard
                title="Best Score"
                value={`${statistics.best}%`}
                icon="🏆"
              />

            </div>


            {/* OVERALL PERFORMANCE */}

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-6 mt-8">

              <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
                Overall Performance
              </h2>

              <div className="mt-6">

                <div className="flex justify-between mb-2">

                  <span className="font-semibold">
                    Average Quiz Score
                  </span>

                  <span
                    className={`font-bold ${getScoreColor(
                      statistics.average
                    )}`}
                  >
                    {statistics.average}%
                  </span>

                </div>

                <div className="w-full h-4 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">

                  <div
                    className={`h-full ${getProgressColor(
                      statistics.average
                    )} transition-all duration-500`}
                    style={{
                      width: `${Math.min(
                        statistics.average,
                        100
                      )}%`,
                    }}
                  />

                </div>

                <p
                  className={`mt-4 font-semibold ${getScoreColor(
                    statistics.average
                  )}`}
                >
                  {getPerformanceLabel(
                    statistics.average
                  )}
                </p>

              </div>

            </div>


            {/* AI PERFORMANCE ANALYSIS */}

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-6 mt-8">

              <div className="flex items-center gap-4">

                <div className="text-4xl">
                  🤖
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
                    AI Performance Analysis
                  </h2>

                  <p className="text-gray-500 dark:text-gray-400">
                    Personalized feedback based on your actual quiz answers.
                  </p>
                </div>

              </div>


              {/* AI LOADING */}

              {analyzing && (

                <div className="mt-8 text-center py-8">

                  <div className="text-5xl mb-4">
                    🧠
                  </div>

                  <p className="font-semibold text-blue-900 dark:text-blue-400">
                    AI is analyzing your performance...
                  </p>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Looking for patterns in your answers and identifying areas to improve.
                  </p>

                </div>

              )}


              {/* AI ERROR */}

              {analysisError &&
                !analyzing && (

                  <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5">

                    <p className="font-semibold text-red-700 dark:text-red-400">
                      Unable to generate AI analysis
                    </p>

                    <p className="text-sm mt-2 text-red-600 dark:text-red-300 break-words">
                      {analysisError}
                    </p>

                    <button
                      onClick={() =>
                        generateAIAnalysis(
                          attempts
                        )
                      }
                      className="mt-4 bg-blue-900 hover:bg-blue-800 text-white px-5 py-2 rounded-lg font-semibold"
                    >
                      Try Again
                    </button>

                  </div>

                )}


              {/* AI RESULTS */}

              {aiAnalysis &&
                !analyzing && (

                  <div className="mt-8 space-y-6">

                    {/* SUMMARY */}

                    {aiAnalysis.summary && (

                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5">

                        <h3 className="font-bold text-blue-900 dark:text-blue-400 text-lg">
                          📋 Summary
                        </h3>

                        <p className="mt-2 text-gray-700 dark:text-gray-300">
                          {
                            aiAnalysis.summary
                          }
                        </p>

                      </div>

                    )}


                    {/* ASSESSMENT */}

                    {aiAnalysis.overallAssessment && (

                      <div>

                        <h3 className="text-lg font-bold">
                          🎯 Overall Assessment
                        </h3>

                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                          {
                            aiAnalysis.overallAssessment
                          }
                        </p>

                      </div>

                    )}


                    {/* STRENGTHS */}

                    {aiAnalysis.strengths?.length > 0 && (

                      <div>

                        <h3 className="text-lg font-bold text-green-600 dark:text-green-400">
                          💪 Your Strengths
                        </h3>

                        <div className="mt-3 space-y-2">

                          {aiAnalysis.strengths.map(
                            (
                              strength,
                              index
                            ) => (

                              <div
                                key={index}
                                className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
                              >
                                ✅{" "}
                                {strength}
                              </div>

                            )
                          )}

                        </div>

                      </div>

                    )}


                    {/* WEAK AREAS */}

                    {aiAnalysis.weakAreas?.length > 0 && (

                      <div>

                        <h3 className="text-lg font-bold text-red-600 dark:text-red-400">
                          🎯 Areas to Improve
                        </h3>

                        <div className="mt-4 space-y-4">

                          {aiAnalysis.weakAreas.map(
                            (
                              area,
                              index
                            ) => (

                              <div
                                key={index}
                                className="border border-red-200 dark:border-red-800 rounded-xl p-5"
                              >

                                <h4 className="font-bold text-lg">
                                  {
                                    area.topic
                                  }
                                </h4>

                                <p className="mt-2 text-gray-600 dark:text-gray-300">
                                  <strong>
                                    Why:
                                  </strong>{" "}
                                  {
                                    area.reason
                                  }
                                </p>

                                <p className="mt-2 text-gray-600 dark:text-gray-300">
                                  <strong>
                                    Recommendation:
                                  </strong>{" "}
                                  {
                                    area.recommendation
                                  }
                                </p>

                              </div>

                            )
                          )}

                        </div>

                      </div>

                    )}


                    {/* COMMON MISTAKES */}

                    {aiAnalysis.commonMistakes?.length > 0 && (

                      <div>

                        <h3 className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                          ⚠️ Common Mistakes
                        </h3>

                        <div className="mt-3 space-y-2">

                          {aiAnalysis.commonMistakes.map(
                            (
                              mistake,
                              index
                            ) => (

                              <div
                                key={index}
                                className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
                              >
                                •{" "}
                                {mistake}
                              </div>

                            )
                          )}

                        </div>

                      </div>

                    )}


                    {/* STUDY PLAN */}

                    {aiAnalysis.studyPlan?.length > 0 && (

                      <div>

                        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-400">
                          📚 Recommended Study Plan
                        </h3>

                        <div className="mt-4 space-y-3">

                          {aiAnalysis.studyPlan.map(
                            (
                              item,
                              index
                            ) => (

                              <div
                                key={index}
                                className="border border-gray-200 dark:border-slate-700 rounded-xl p-4"
                              >

                                <span className="font-bold">
                                  {
                                    item.priority
                                  }
                                </span>

                                <p className="mt-1 text-gray-600 dark:text-gray-300">
                                  {
                                    item.action
                                  }
                                </p>

                              </div>

                            )
                          )}

                        </div>

                      </div>

                    )}


                    {/* RECOMMENDED FOCUS */}

                    {aiAnalysis.recommendedFocus && (

                      <div className="bg-blue-900 dark:bg-blue-800 text-white rounded-xl p-6">

                        <h3 className="text-xl font-bold">
                          🧠 What You Should Focus On
                        </h3>

                        <p className="mt-3 text-blue-100">
                          {
                            aiAnalysis.recommendedFocus
                          }
                        </p>

                      </div>

                    )}

                  </div>

                )}

            </div>


            {/* WEAK AREAS */}

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-6 mt-8">

              <div className="flex items-center gap-3">

                <span className="text-3xl">
                  🎯
                </span>

                <div>

                  <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
                    Areas Needing Attention
                  </h2>

                  <p className="text-gray-500 dark:text-gray-400">
                    Courses where your current quiz performance is lowest.
                  </p>

                </div>

              </div>

              <div className="mt-6 space-y-5">

                {weakestCourses.map(
                  (course) => (

                    <div
                      key={
                        course.course_code
                      }
                      className="border border-gray-200 dark:border-slate-700 rounded-xl p-5"
                    >

                      <div className="flex justify-between gap-4">

                        <div>

                          <p className="font-bold text-blue-900 dark:text-blue-400">
                            {
                              course.course_code
                            }
                          </p>

                          <h3 className="font-semibold">
                            {
                              course.course_title
                            }
                          </h3>

                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {
                              course.attempts
                            }{" "}
                            quiz{" "}
                            {course.attempts ===
                            1
                              ? "attempt"
                              : "attempts"}
                          </p>

                        </div>

                        <div className="text-right">

                          <p
                            className={`text-2xl font-bold ${getScoreColor(
                              course.average
                            )}`}
                          >
                            {
                              course.average
                            }%
                          </p>

                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Average
                          </p>

                        </div>

                      </div>

                      <div className="w-full h-3 bg-gray-200 dark:bg-slate-700 rounded-full mt-4 overflow-hidden">

                        <div
                          className={`h-full ${getProgressColor(
                            course.average
                          )}`}
                          style={{
                            width: `${Math.min(
                              course.average,
                              100
                            )}%`,
                          }}
                        />

                      </div>

                      <button
                        onClick={() =>
                          navigate(
                            `/course-quiz/${course.course_code}`
                          )
                        }
                        className="mt-4 bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-semibold"
                      >
                        🧠 Practice This Course
                      </button>

                    </div>

                  )
                )}

              </div>

            </div>


            {/* STRONG AREAS */}

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-6 mt-8">

              <div className="flex items-center gap-3">

                <span className="text-3xl">
                  🏆
                </span>

                <div>

                  <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
                    Strongest Courses
                  </h2>

                  <p className="text-gray-500 dark:text-gray-400">
                    Courses where you currently perform best.
                  </p>

                </div>

              </div>

              <div className="mt-6 grid md:grid-cols-3 gap-5">

                {strongestCourses.map(
                  (course) => (

                    <div
                      key={
                        course.course_code
                      }
                      className="border border-gray-200 dark:border-slate-700 rounded-xl p-5"
                    >

                      <p className="font-bold text-blue-900 dark:text-blue-400">
                        {
                          course.course_code
                        }
                      </p>

                      <h3 className="font-semibold mt-1">
                        {
                          course.course_title
                        }
                      </h3>

                      <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-4">
                        {
                          course.average
                        }%
                      </p>

                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Average performance
                      </p>

                    </div>

                  )
                )}

              </div>

            </div>


            {/* RECENT ATTEMPTS */}

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-6 mt-8">

              <div className="flex justify-between items-center gap-4">

                <div>

                  <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
                    Recent Performance
                  </h2>

                  <p className="text-gray-500 dark:text-gray-400">
                    Your latest quiz results.
                  </p>

                </div>

                <button
                  onClick={() =>
                    navigate(
                      "/quiz-history"
                    )
                  }
                  className="text-blue-700 dark:text-blue-400 font-semibold hover:underline"
                >
                  View All →
                </button>

              </div>

              <div className="mt-6 space-y-4">

                {attempts
                  .slice(0, 5)
                  .map((attempt) => (

                    <div
                      key={attempt.id}
                      className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >

                      <div>

                        <p className="font-bold text-blue-900 dark:text-blue-400">
                          {
                            attempt.course_code
                          }
                        </p>

                        <p>
                          {
                            attempt.course_title
                          }
                        </p>

                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(
                            attempt.created_at
                          ).toLocaleString()}
                        </p>

                      </div>

                      <div className="flex items-center gap-5">

                        <div className="text-right">

                          <p
                            className={`text-2xl font-bold ${getScoreColor(
                              Number(
                                attempt.percentage
                              )
                            )}`}
                          >
                            {
                              attempt.percentage
                            }%
                          </p>

                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {
                              attempt.score
                            }
                            /
                            {
                              attempt.question_count
                            }
                          </p>

                        </div>

                        <button
                          onClick={() =>
                            navigate(
                              `/quiz-review/${attempt.id}`
                            )
                          }
                          className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg"
                        >
                          Review
                        </button>

                      </div>

                    </div>

                  ))}

              </div>

            </div>


            {/* RECOMMENDATION */}

            <div className="bg-blue-900 dark:bg-slate-900 rounded-2xl shadow p-8 mt-8 text-white">

              <div className="flex items-start gap-4">

                <div className="text-4xl">
                  🤖
                </div>

                <div>

                  <h2 className="text-2xl font-bold">
                    QS Nexus Recommendation
                  </h2>

                  {weakestCourses.length >
                  0 ? (

                    <p className="mt-3 text-blue-100">

                      Your current area needing the most attention is{" "}

                      <strong>
                        {
                          weakestCourses[0]
                            .course_code
                        }
                      </strong>

                      {" "}(
                      {
                        weakestCourses[0]
                          .average
                      }%
                      average).

                      Consider reviewing your course materials and taking another practice quiz to improve your understanding.

                    </p>

                  ) : (

                    <p className="mt-3 text-blue-100">
                      Keep completing quizzes to build enough performance data for personalized recommendations.
                    </p>

                  )}

                </div>

              </div>

            </div>

          </>

        )}

      </div>

    </div>
  )
}

function StatCard({
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

export default QuizPerformance