import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

function StudyAssistant() {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState("")
  const [studyMode, setStudyMode] = useState("explain")
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loading, setLoading] = useState(false)

  const studyModes = [
    {
      id: "explain",
      icon: "📖",
      title: "Explain",
      description: "Understand a topic",
    },
    {
      id: "solve",
      icon: "🧮",
      title: "Solve",
      description: "Work through a problem",
    },
    {
      id: "summarize",
      icon: "📝",
      title: "Summarize",
      description: "Create revision notes",
    },
    {
      id: "exam",
      icon: "🎯",
      title: "Exam Revision",
      description: "Prepare for exams",
    },
  ]

  useEffect(() => {
    loadCourses()
  }, [])

  async function loadCourses() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoadingCourses(false)
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("level")
        .eq("id", user.id)
        .maybeSingle()

      let query = supabase
        .from("courses")
        .select("*")
        .order("course_code")

      if (profile?.level) {
        query = query.eq("level", profile.level)
      }

      const { data, error } = await query

      if (error) {
        console.error(error.message)
        return
      }

      setCourses(
        (data || []).map((course) => ({
          ...course,
          course_title: course.course_title ?? "",
        }))
      )

      if (data?.length > 0) {
        setSelectedCourse(String(data[0].id))
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingCourses(false)
    }
  }

  const selectedCourseData = courses.find(
    (course) =>
      String(course.id) === String(selectedCourse)
  )

  async function askAssistant(e) {
    e.preventDefault()

    if (!question.trim() || loading) {
      return
    }

    const userQuestion = question.trim()

    const history = messages.map((message) => ({
      role: message.role,
      text: message.text,
    }))

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        text: userQuestion,
      },
    ])

    setQuestion("")
    setLoading(true)

    try {
      const { data, error } =
        await supabase.functions.invoke(
          "study-assistant",
          {
            body: {
              question: userQuestion,
              courseCode:
                selectedCourseData?.course_code || "",
              courseTitle:
                selectedCourseData?.course_title || "",
              studyMode,
              history,
            },
          }
        )

      if (error) {
        console.error(error)

        setMessages((previous) => [
          ...previous,
          {
            role: "model",
            text:
              "Unable to contact the AI Study Assistant.",
          },
        ])

        return
      }

      if (data?.error) {
        console.error(data)

        setMessages((previous) => [
          ...previous,
          {
            role: "model",
            text:
              data.details ||
              data.error ||
              "Unable to generate an answer.",
          },
        ])

        return
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "model",
          text:
            data?.answer ||
            "No answer received.",
        },
      ])
    } catch (error) {
      console.error(error)

      setMessages((previous) => [
        ...previous,
        {
          role: "model",
          text:
            "Something went wrong. Please try again.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function clearConversation() {
    setMessages([])
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 px-4 md:px-6 py-8">
      <div className="max-w-5xl mx-auto">

        <div className="bg-blue-900 text-white rounded-2xl p-6 md:p-8 shadow-lg">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                🤖 AI Study Assistant
              </h1>

              <p className="mt-2 text-blue-100">
                Your personal AI study companion for QS Nexus.
              </p>
            </div>

            {messages.length > 0 && (
              <button
                type="button"
                onClick={clearConversation}
                className="bg-white text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50"
              >
                New Conversation
              </button>
            )}

          </div>

        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5 md:p-6 mt-6">

          <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Select Course
          </label>

          {loadingCourses ? (
            <div className="border rounded-lg p-3 text-gray-500">
              Loading your courses...
            </div>
          ) : courses.length === 0 ? (
            <div className="border border-yellow-300 bg-yellow-50 rounded-lg p-4 text-yellow-800">
              No courses were found for your level.
            </div>
          ) : (
            <select
              value={selectedCourse}
              onChange={(e) =>
                setSelectedCourse(e.target.value)
              }
              className="w-full border dark:border-gray-700 rounded-lg p-3 dark:bg-gray-800 dark:text-white"
            >
              {courses.map((course) => (
                <option
                  key={course.id}
                  value={course.id}
                >
                  {course.course_code} -{" "}
                  {course.course_title}
                </option>
              ))}
            </select>
          )}

        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5 md:p-6 mt-6">

          <div className="flex items-center justify-between mb-4">

            <div>
              <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400">
                Study Mode
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Choose how you want the AI to help you.
              </p>
            </div>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

            {studyModes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setStudyMode(mode.id)}
                className={`text-left p-4 rounded-xl border-2 transition ${
                  studyMode === mode.id
                    ? "border-blue-900 bg-blue-50 dark:bg-blue-950"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-400"
                }`}
              >

                <div className="text-2xl">
                  {mode.icon}
                </div>

                <h3 className="font-bold mt-2 text-gray-800 dark:text-white">
                  {mode.title}
                </h3>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {mode.description}
                </p>

              </button>
            ))}

          </div>

        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow mt-6 overflow-hidden">

          <div className="p-5 md:p-6 border-b dark:border-gray-700">

            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400">
              {selectedCourseData
                ? `${selectedCourseData.course_code} - ${selectedCourseData.course_title}`
                : "Study Assistant"}
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Mode:{" "}
              {
                studyModes.find(
                  (mode) => mode.id === studyMode
                )?.title
              }
            </p>

          </div>

          <div className="p-5 md:p-6 min-h-[350px]">

            {messages.length === 0 && (
              <div className="text-center py-16">

                <div className="text-5xl mb-5">
                  🎓
                </div>

                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  What would you like to learn?
                </h3>

                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto">
                  Select a study mode above and ask the
                  AI about your course.
                </p>

              </div>
            )}

            <div className="space-y-6">

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={
                    message.role === "user"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }
                >

                  <div
                    className={
                      message.role === "user"
                        ? "max-w-[85%] bg-blue-900 text-white rounded-2xl rounded-br-sm px-5 py-4"
                        : "max-w-[85%] bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-sm px-5 py-4"
                    }
                  >

                    <p className="text-xs font-semibold mb-2 opacity-70">
                      {message.role === "user"
                        ? "You"
                        : "🤖 QS Nexus AI"}
                    </p>

                    <div className="whitespace-pre-wrap leading-7">
                      {message.text}
                    </div>

                  </div>

                </div>
              ))}

              {loading && (
                <div className="flex justify-start">

                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-5 py-4">

                    <p className="text-gray-500 dark:text-gray-300">
                      🤖 Thinking...
                    </p>

                  </div>

                </div>
              )}

            </div>

          </div>

          <form
            onSubmit={askAssistant}
            className="border-t dark:border-gray-700 p-4 md:p-6"
          >

            <div className="flex flex-col md:flex-row gap-3">

              <textarea
                value={question}
                onChange={(e) =>
                  setQuestion(e.target.value)
                }
                placeholder="Ask a question about your course..."
                rows="3"
                className="flex-1 border dark:border-gray-700 rounded-xl p-4 resize-none dark:bg-gray-800 dark:text-white"
              />

              <button
                type="submit"
                disabled={
                  loading ||
                  loadingCourses ||
                  courses.length === 0
                }
                className="md:w-40 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-500 text-white rounded-xl font-semibold px-5 py-3"
              >
                {loading
                  ? "Thinking..."
                  : "Ask AI"}
              </button>

            </div>

          </form>

        </div>

      </div>
    </div>
  )
}

export default StudyAssistant