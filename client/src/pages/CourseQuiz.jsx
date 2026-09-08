import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { supabase } from "../lib/supabase"

const QUESTION_COUNTS = [5, 10, 20, 30]

const TIME_PER_QUESTION = 60

function CourseQuiz() {
  const { courseCode } = useParams()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [score, setScore] = useState(null)

  const [questionCount, setQuestionCount] = useState(10)

  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState("")

  const [quizStarted, setQuizStarted] = useState(false)

  const [timeLeft, setTimeLeft] = useState(0)
  const [timeTaken, setTimeTaken] = useState(0)

  const [reviewMode, setReviewMode] = useState(false)

  const [quizStartTime, setQuizStartTime] = useState(null)

  useEffect(() => {
    loadCourse()
  }, [courseCode])

  useEffect(() => {
    if (!quizStarted || score !== null) {
      return
    }

    if (timeLeft <= 0) {
      if (questions.length > 0) {
        submitQuiz(true)
      }

      return
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => previous - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [
    quizStarted,
    score,
    timeLeft,
    questions.length,
  ])

  async function loadCourse() {
    setLoading(true)
    setError("")

    const {
      data,
      error: courseError,
    } = await supabase
      .from("courses")
      .select("*")
      .eq("course_code", courseCode)
      .maybeSingle()

    if (courseError) {
      console.error(
        "COURSE ERROR:",
        courseError
      )

      setError(courseError.message)
      setLoading(false)
      return
    }

    if (!data) {
      setError("Course not found.")
      setLoading(false)
      return
    }

    setCourse(data)
    setLoading(false)
  }

  async function generateQuiz() {
    if (!course) return

    setGenerating(true)
    setError("")
    setQuestions([])
    setAnswers({})
    setCurrentQuestion(0)
    setScore(null)
    setReviewMode(false)
    setQuizStarted(false)
    setTimeLeft(0)
    setTimeTaken(0)
    setQuizStartTime(null)

    try {
      const {
        data,
        error: functionError,
      } = await supabase.functions.invoke(
        "generate-quiz",
        {
          body: {
            courseCode:
              course.course_code,

            courseTitle:
              course.course_title,

            topic:
              "General course knowledge",

            questionCount,
          },
        }
      )

      console.log(
        "QUIZ DATA:",
        data
      )

      console.log(
        "QUIZ ERROR:",
        functionError
      )

      if (functionError) {
        let details =
          functionError.message ||
          "Unknown function error"

        if (functionError.context) {
          try {
            const responseText =
              await functionError.context.text()

            if (responseText) {
              details =
                responseText
            }
          } catch {
            console.log(
              "Could not read error response"
            )
          }
        }

        setError(details)
        setGenerating(false)
        return
      }

      if (!data) {
        setError(
          "The quiz function returned no data."
        )

        setGenerating(false)
        return
      }

      if (
        !Array.isArray(
          data.questions
        )
      ) {
        setError(
          data.error ||
            "The AI returned an invalid quiz format."
        )

        setGenerating(false)
        return
      }

      if (
        data.questions.length !==
        questionCount
      ) {
        setError(
          `Expected ${questionCount} questions but received ${data.questions.length}.`
        )

        setGenerating(false)
        return
      }

      setQuestions(
        data.questions
      )

      setGenerating(false)

      startQuiz(
        data.questions.length
      )
    } catch (err) {
      console.error(
        "QUIZ REQUEST ERROR:",
        err
      )

      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred."
      )

      setGenerating(false)
    }
  }

  function startQuiz(numberOfQuestions) {
    const totalSeconds =
      numberOfQuestions *
      TIME_PER_QUESTION

    setTimeLeft(totalSeconds)

    setTimeTaken(0)

    setQuizStartTime(
      Date.now()
    )

    setQuizStarted(true)
  }

  function selectAnswer(option) {
    setAnswers(
      (previous) => ({
        ...previous,
        [currentQuestion]:
          option,
      })
    )
  }

  function nextQuestion() {
    if (
      currentQuestion <
      questions.length - 1
    ) {
      setCurrentQuestion(
        (previous) =>
          previous + 1
      )
    }
  }

  function previousQuestion() {
    if (currentQuestion > 0) {
      setCurrentQuestion(
        (previous) =>
          previous - 1
      )
    }
  }

  function jumpToQuestion(index) {
    setCurrentQuestion(index)
    setReviewMode(false)
  }

  async function submitQuiz(
    automatic = false
  ) {
    if (
      score !== null ||
      saving
    ) {
      return
    }

    const endTime = Date.now()

    let calculatedTimeTaken =
      timeTaken

    if (quizStartTime) {
      calculatedTimeTaken =
        Math.max(
          0,
          Math.floor(
            (endTime -
              quizStartTime) /
              1000
          )
        )
    }

    setTimeTaken(
      calculatedTimeTaken
    )

    let correctAnswers = 0

    questions.forEach(
      (question, index) => {
        if (
          answers[index] ===
          question.answer
        ) {
          correctAnswers++
        }
      }
    )

    setScore(correctAnswers)

    setQuizStarted(false)

    await saveQuizAttempt(
      correctAnswers,
      calculatedTimeTaken,
      automatic
    )
  }

  async function saveQuizAttempt(
    correctAnswers,
    calculatedTimeTaken,
    automatic
  ) {
    setSaving(true)

    try {
      const {
        data: {
          user,
        },
      } =
        await supabase.auth.getUser()

      if (!user) {
        console.error(
          "No authenticated user."
        )

        return
      }

      const percentage =
        Math.round(
          (correctAnswers /
            questions.length) *
            100
        )

      const {
        error: saveError,
      } =
        await supabase
          .from(
            "quiz_attempts"
          )
          .insert({
            user_id: user.id,

            course_code:
              course?.course_code ||
              courseCode,

            course_title:
              course?.course_title ||
              "",

            question_count:
              questions.length,

            score:
              correctAnswers,

            percentage,

            time_taken_seconds:
              calculatedTimeTaken,

            questions,

            answers,
          })

      if (saveError) {
        console.error(
          "SAVE QUIZ ERROR:",
          saveError
        )
      } else {
        console.log(
          automatic
            ? "Quiz auto-submitted and saved."
            : "Quiz saved successfully."
        )
      }
    } catch (err) {
      console.error(
        "SAVE ATTEMPT ERROR:",
        err
      )
    } finally {
      setSaving(false)
    }
  }

  function restartQuiz() {
    generateQuiz()
  }

  function formatTime(seconds) {
    const minutes =
      Math.floor(
        seconds / 60
      )

    const remainingSeconds =
      seconds % 60

    return `${String(
      minutes
    ).padStart(
      2,
      "0"
    )}:${String(
      remainingSeconds
    ).padStart(
      2,
      "0"
    )}`
  }

  const answeredCount =
    Object.keys(answers)
      .length

  const progress =
    questions.length > 0
      ? Math.round(
          ((currentQuestion +
            1) /
            questions.length) *
            100
        )
      : 0

  const unansweredCount =
    Math.max(
      0,
      questions.length -
        answeredCount
    )

  const percentage =
    score !== null &&
    questions.length > 0
      ? Math.round(
          (score /
            questions.length) *
            100
        )
      : 0

  const grade = useMemo(() => {
    if (percentage >= 70)
      return "Excellent"

    if (percentage >= 60)
      return "Very Good"

    if (percentage >= 50)
      return "Good"

    if (percentage >= 40)
      return "Pass"

    return "Keep Practising"
  }, [percentage])

  if (loading) {
    return (
      <Page>
        <div className="text-center">
          <div className="text-5xl mb-5">
            📚
          </div>

          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
            Loading course...
          </h1>
        </div>
      </Page>
    )
  }

  if (error) {
    return (
      <Page>
        <div className="max-w-2xl mx-auto">
          <BackButton
            navigate={navigate}
          />

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8">
            <div className="text-center">
              <div className="text-5xl mb-4">
                ⚠️
              </div>

              <h1 className="text-2xl font-bold text-red-600">
                Quiz Error
              </h1>

              <p className="mt-5 text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap">
                {error}
              </p>
            </div>

            <button
              onClick={() => {
                setError("")
                generateQuiz()
              }}
              className="w-full mt-6 bg-blue-900 hover:bg-blue-800 text-white py-3 rounded-lg font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      </Page>
    )
  }

  if (
    questions.length === 0 &&
    !generating
  ) {
    return (
      <Page>
        <div className="max-w-2xl mx-auto">
          <BackButton
            navigate={navigate}
          />

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8">
            <div className="text-center">
              <div className="text-6xl mb-5">
                🧠
              </div>

              <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-400">
                AI Course Quiz
              </h1>

              <p className="mt-3 text-gray-600 dark:text-gray-400">
                {course?.course_code} -{" "}
                {course?.course_title}
              </p>
            </div>

            <div className="mt-8">
              <h2 className="font-bold text-lg dark:text-white mb-4">
                Choose number of questions
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {QUESTION_COUNTS.map(
                  (count) => (
                    <button
                      key={count}
                      onClick={() =>
                        setQuestionCount(
                          count
                        )
                      }
                      className={`p-4 rounded-xl border-2 font-bold transition ${
                        questionCount ===
                        count
                          ? "bg-blue-900 text-white border-blue-900"
                          : "bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-slate-600 hover:border-blue-600"
                      }`}
                    >
                      {count}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="mt-6 bg-blue-50 dark:bg-slate-800 rounded-xl p-5">
              <p className="font-semibold text-blue-900 dark:text-blue-400">
                ⏱️ Time Limit
              </p>

              <p className="mt-1 text-gray-700 dark:text-gray-300">
                {questionCount} minutes
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                You have 1 minute per question.
              </p>
            </div>

            <button
              onClick={generateQuiz}
              className="w-full mt-7 bg-blue-900 hover:bg-blue-800 text-white py-4 rounded-xl font-bold text-lg"
            >
              🧠 Generate {questionCount}-Question Quiz
            </button>

            <button
              onClick={() =>
                navigate(
                  "/quiz-history"
                )
              }
              className="w-full mt-3 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold"
            >
              📊 Quiz History
            </button>
          </div>
        </div>
      </Page>
    )
  }

  if (generating) {
    return (
      <Page>
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-6">
            🧠
          </div>

          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
            AI is generating your quiz...
          </h1>

          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Creating{" "}
            {questionCount} questions for{" "}
            {course?.course_code}.
          </p>

          <div className="mt-6 h-2 bg-gray-300 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-900 animate-pulse w-2/3" />
          </div>
        </div>
      </Page>
    )
  }

  if (score !== null) {
    return (
      <Page>
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-4 sm:p-8 md:p-10">
            <div className="text-center">
              <div className="text-6xl mb-5">
                {percentage >= 70
                  ? "🏆"
                  : percentage >= 50
                  ? "🎓"
                  : "📚"}
              </div>

              <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-400">
                Quiz Complete
              </h1>

              <p className="mt-3 text-gray-600 dark:text-gray-400">
                {course?.course_code} -{" "}
                {course?.course_title}
              </p>

              <div className="my-8">
                <p className="text-gray-500 dark:text-gray-400">
                  Your Score
                </p>

                <h2 className="text-6xl font-bold text-blue-900 dark:text-blue-400 mt-2">
                  {score}/
                  {questions.length}
                </h2>

                <p className="text-3xl font-semibold mt-3 dark:text-white">
                  {percentage}%
                </p>

                <p className="mt-2 font-semibold text-blue-700 dark:text-blue-400">
                  {grade}
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 text-left">
                <ResultCard
                  title="Correct"
                  value={score}
                  icon="✅"
                />

                <ResultCard
                  title="Incorrect"
                  value={
                    questions.length -
                    score
                  }
                  icon="❌"
                />

                <ResultCard
                  title="Time"
                  value={`${Math.floor(
                    timeTaken / 60
                  )}m ${
                    timeTaken % 60
                  }s`}
                  icon="⏱️"
                />
              </div>

              {saving && (
                <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">
                  Saving your result...
                </p>
              )}
            </div>

            {!reviewMode ? (
              <div className="mt-8 space-y-3">
                <button
                  onClick={() =>
                    setReviewMode(
                      true
                    )
                  }
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 rounded-xl font-semibold"
                >
                  📖 Review Answers & Explanations
                </button>

                <button
                  onClick={restartQuiz}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
                >
                  🔄 Generate Another Quiz
                </button>

                <button
                  onClick={() =>
                    navigate(
                      "/quiz-history"
                    )
                  }
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 rounded-xl font-semibold"
                >
                  📊 View Quiz History
                </button>

                <button
                  onClick={() =>
                    navigate(
                      "/student-dashboard"
                    )
                  }
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold"
                >
                  Dashboard
                </button>
              </div>
            ) : (
              <ReviewAnswers
                questions={
                  questions
                }
                answers={answers}
              />
            )}
          </div>
        </div>
      </Page>
    )
  }

  const question =
    questions[currentQuestion]

  if (!question) {
    return null
  }

  return (
    <Page>
      <div className="max-w-5xl mx-auto">
        <BackButton
          navigate={navigate}
        />

        {/* TOP BAR */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-5 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
                🧠 AI Course Quiz
              </h1>

              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {course?.course_code} -{" "}
                {course?.course_title}
              </p>
            </div>

            <div
              className={`text-xl font-bold px-5 py-3 rounded-xl ${
                timeLeft <= 60
                  ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                  : "bg-blue-100 text-blue-900 dark:bg-slate-800 dark:text-blue-400"
              }`}
            >
              ⏱️{" "}
              {formatTime(
                timeLeft
              )}
            </div>
          </div>

          <div className="mt-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold dark:text-gray-200">
                Progress
              </span>

              <span className="text-gray-500 dark:text-gray-400">
                {progress}%
              </span>
            </div>

            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-900 dark:bg-blue-600 transition-all"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Answered
              </p>

              <p className="font-bold text-green-700 dark:text-green-300">
                {answeredCount}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Unanswered
              </p>

              <p className="font-bold text-gray-700 dark:text-gray-300">
                {unansweredCount}
              </p>
            </div>
          </div>
        </div>

        {/* QUESTION NAVIGATION */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-5 mb-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">
            Questions
          </h2>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {questions.map(
              (_, index) => (
                <button
                  key={index}
                  onClick={() =>
                    jumpToQuestion(
                      index
                    )
                  }
                  className={`h-10 rounded-lg font-bold text-sm ${
                    currentQuestion ===
                    index
                      ? "bg-blue-900 text-white"
                      : answers[index]
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200"
                  }`}
                >
                  {index + 1}
                </button>
              )
            )}
          </div>
        </div>

        {/* QUESTION */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-bold text-blue-900 dark:text-blue-400">
              Question{" "}
              {currentQuestion + 1}{" "}
              of {questions.length}
            </span>

            {answers[
              currentQuestion
            ] && (
              <span className="text-sm font-semibold text-green-600">
                ✓ Answered
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-8">
            {question.question}
          </h2>

          <div className="space-y-4">
            {question.options.map(
              (
                option,
                index
              ) => {
                const selected =
                  answers[
                    currentQuestion
                  ] === option

                return (
                  <button
                    key={index}
                    onClick={() =>
                      selectAnswer(
                        option
                      )
                    }
                    className={`w-full text-left p-4 rounded-xl border-2 transition ${
                      selected
                        ? "bg-blue-900 text-white border-blue-900"
                        : "bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-slate-600 hover:border-blue-600"
                    }`}
                  >
                    <span className="font-bold mr-3">
                      {String.fromCharCode(
                        65 + index
                      )}
                      .
                    </span>

                    {option}
                  </button>
                )
              }
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8">
            <button
              onClick={
                previousQuestion
              }
              disabled={
                currentQuestion ===
                0
              }
              className="px-5 py-3 rounded-lg bg-gray-600 text-white disabled:opacity-40"
            >
              ← Previous
            </button>

            {currentQuestion ===
            questions.length - 1 ? (
              <button
                onClick={() =>
                  submitQuiz(
                    false
                  )
                }
                disabled={
                  answers[
                    currentQuestion
                  ] ===
                  undefined
                }
                className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-40 font-semibold"
              >
                Submit Quiz ✓
              </button>
            ) : (
              <button
                onClick={
                  nextQuestion
                }
                disabled={
                  answers[
                    currentQuestion
                  ] ===
                  undefined
                }
                className="px-6 py-3 rounded-lg bg-blue-900 hover:bg-blue-800 text-white disabled:opacity-40 font-semibold"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </Page>
  )
}

function ReviewAnswers({
  questions,
  answers,
}) {
  return (
    <div className="mt-10">
      <div className="border-t dark:border-slate-700 pt-8">
        <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-400 mb-6">
          📖 Answer Review
        </h2>

        <div className="space-y-6">
          {questions.map(
            (
              question,
              index
            ) => {
              const selected =
                answers[index]

              const correct =
                selected ===
                question.answer

              return (
                <div
                  key={index}
                  className={`rounded-xl p-5 border-2 ${
                    correct
                      ? "border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-800"
                      : "border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-800"
                  }`}
                >
                  <div className="flex gap-3">
                    <span className="font-bold">
                      {index + 1}.
                    </span>

                    <p className="font-bold text-gray-900 dark:text-white">
                      {question.question}
                    </p>
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="text-sm">
                      <strong>
                        Your answer:
                      </strong>{" "}
                      {selected ||
                        "Not answered"}
                    </p>

                    <p className="text-sm">
                      <strong>
                        Correct answer:
                      </strong>{" "}
                      {question.answer}
                    </p>

                    <div className="mt-4 bg-white dark:bg-slate-900 rounded-lg p-4">
                      <p className="font-bold text-blue-900 dark:text-blue-400 mb-1">
                        💡 Explanation
                      </p>

                      <p className="text-gray-700 dark:text-gray-300">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )
            }
          )}
        </div>
      </div>
    </div>
  )
}

function ResultCard({
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

      <p className="text-xl font-bold dark:text-white">
        {value}
      </p>
    </div>
  )
}

function BackButton({
  navigate,
}) {
  return (
    <button
      onClick={() =>
        navigate(
          "/student-dashboard"
        )
      }
      className="mb-6 text-blue-900 dark:text-blue-400 font-semibold hover:underline"
    >
      ← Back to Dashboard
    </button>
  )
}

function Page({
  children,
}) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 p-5 sm:p-8 transition-colors duration-300">
      {children}
    </div>
  )
}

export default CourseQuiz