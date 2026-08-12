import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { supabase } from "../lib/supabase"

function CourseQuiz() {
  const { courseCode } = useParams()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [score, setScore] = useState(null)

  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    loadCourse()
  }, [courseCode])

  async function loadCourse() {
    setLoading(true)
    setError("")

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("course_code", courseCode)
      .maybeSingle()

    if (error) {
      console.error("COURSE ERROR:", error)
      setError(error.message)
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

    generateQuiz(data)
  }

  async function generateQuiz(courseData) {
    setGenerating(true)
    setError("")
    setQuestions([])
    setAnswers({})
    setCurrentQuestion(0)
    setScore(null)

    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-quiz",
        {
          body: {
            courseCode: courseData.course_code,
            courseTitle: courseData.course_title,
            topic: "General course knowledge",
          },
        }
      )

      console.log("QUIZ DATA:", data)
      console.log("QUIZ ERROR:", error)

      if (error) {
        let details = error.message || "Unknown function error"

        if (error.context) {
          try {
            const responseText = await error.context.text()

            if (responseText) {
              details = responseText
            }
          } catch {
            console.log("Could not read error response")
          }
        }

        setError(details)
        setGenerating(false)
        return
      }

      if (!data) {
        setError("The quiz function returned no data.")
        setGenerating(false)
        return
      }

      if (!data.questions) {
        setError(
          data.error ||
            "The AI function did not return quiz questions."
        )
        setGenerating(false)
        return
      }

      if (!Array.isArray(data.questions)) {
        setError("The AI returned an invalid quiz format.")
        setGenerating(false)
        return
      }

      setQuestions(data.questions)
      setGenerating(false)
    } catch (err) {
      console.error("QUIZ REQUEST ERROR:", err)

      setError(
        err.message ||
          "An unexpected error occurred while generating the quiz."
      )

      setGenerating(false)
    }
  }

  function selectAnswer(option) {
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion]: option,
    }))
  }

  function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((previous) => previous + 1)
    }
  }

  function previousQuestion() {
    if (currentQuestion > 0) {
      setCurrentQuestion((previous) => previous - 1)
    }
  }

  function submitQuiz() {
    let correctAnswers = 0

    questions.forEach((question, index) => {
      if (answers[index] === question.answer) {
        correctAnswers++
      }
    })

    setScore(correctAnswers)
  }

  function restartQuiz() {
    if (course) {
      generateQuiz(course)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-950 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-5xl mb-5">
            📚
          </div>

          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
            Loading course...
          </h1>
        </div>
      </div>
    )
  }

  if (generating) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-950 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">
            🧠
          </div>

          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
            AI is generating your quiz...
          </h1>

          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Creating questions for {course?.course_code}.
            Please wait.
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-950 p-8">
        <div className="max-w-2xl mx-auto">

          <button
            onClick={() => navigate("/student-dashboard")}
            className="mb-6 text-blue-900 dark:text-blue-400 font-semibold"
          >
            ← Back to Dashboard
          </button>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8">

            <div className="text-center">
              <div className="text-5xl mb-4">
                ⚠️
              </div>

              <h1 className="text-2xl font-bold text-red-600">
                Quiz Error
              </h1>

              <p className="mt-5 text-gray-700 dark:text-gray-300 break-words">
                {error}
              </p>
            </div>

            <button
              onClick={() => course && generateQuiz(course)}
              className="w-full mt-6 bg-blue-900 hover:bg-blue-800 text-white py-3 rounded-lg font-semibold"
            >
              Try Again
            </button>

          </div>

        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-950 p-8">
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow p-8 text-center">

          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
            No Questions
          </h1>

          <p className="mt-3 text-gray-600 dark:text-gray-400">
            No quiz questions were generated.
          </p>

          <button
            onClick={() => course && generateQuiz(course)}
            className="mt-6 bg-blue-900 text-white px-6 py-3 rounded-lg"
          >
            Generate Quiz
          </button>

        </div>
      </div>
    )
  }

  if (score !== null) {
    const percentage = Math.round(
      (score / questions.length) * 100
    )

    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-950 p-8">
        <div className="max-w-2xl mx-auto">

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-10 text-center">

            <div className="text-6xl mb-5">
              🎓
            </div>

            <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-400">
              Quiz Complete
            </h1>

            <p className="mt-3 text-gray-600 dark:text-gray-400">
              {course?.course_code} - {course?.course_title}
            </p>

            <div className="my-8">

              <p className="text-gray-500 dark:text-gray-400">
                Your Score
              </p>

              <h2 className="text-6xl font-bold text-blue-900 dark:text-blue-400 mt-2">
                {score}/{questions.length}
              </h2>

              <p className="text-2xl font-semibold mt-3 dark:text-white">
                {percentage}%
              </p>

            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">

              <button
                onClick={restartQuiz}
                className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg"
              >
                Generate Another Quiz
              </button>

              <button
                onClick={() => navigate("/student-dashboard")}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg"
              >
                Dashboard
              </button>

            </div>

          </div>

        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 p-8">
      <div className="max-w-3xl mx-auto">

        <button
          onClick={() => navigate("/student-dashboard")}
          className="mb-6 text-blue-900 dark:text-blue-400 font-semibold"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8">

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-8">

            <div>

              <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
                🧠 AI Course Quiz
              </h1>

              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {course?.course_title}
              </p>

            </div>

            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Question {currentQuestion + 1} / {questions.length}
            </span>

          </div>

          <h2 className="text-xl font-semibold dark:text-white mb-8">
            {question.question}
          </h2>

          <div className="space-y-4">

            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => selectAnswer(option)}
                className={`w-full text-left p-4 rounded-xl border transition ${
                  answers[currentQuestion] === option
                    ? "bg-blue-900 text-white border-blue-900"
                    : "bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-slate-600 hover:border-blue-600"
                }`}
              >
                <span className="font-semibold mr-3">
                  {String.fromCharCode(65 + index)}.
                </span>

                {option}
              </button>
            ))}

          </div>

          <div className="flex justify-between mt-8">

            <button
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
              className="px-5 py-3 rounded-lg bg-gray-600 text-white disabled:opacity-40"
            >
              Previous
            </button>

            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={submitQuiz}
                disabled={
                  answers[currentQuestion] === undefined
                }
                className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-40"
              >
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                disabled={
                  answers[currentQuestion] === undefined
                }
                className="px-6 py-3 rounded-lg bg-blue-900 hover:bg-blue-800 text-white disabled:opacity-40"
              >
                Next
              </button>
            )}

          </div>

        </div>

      </div>
    </div>
  )
}

export default CourseQuiz