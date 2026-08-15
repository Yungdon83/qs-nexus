import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import LogoutButton from "../components/LogoutButton"

function StudentDashboard() {
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [courses, setCourses] = useState([])
  const [resources, setResources] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [events, setEvents] = useState([])
  const [timetable, setTimetable] = useState([])
  const [quizAttempts, setQuizAttempts] = useState([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    setProfile(profileData)

    const { data: coursesData } = await supabase
      .from("courses")
      .select("*")

    setCourses(coursesData || [])

    const { data: resourcesData } = await supabase
      .from("resources")
      .select("*")

    setResources(resourcesData || [])

    const { data: announcementsData } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", {
        ascending: false,
      })

    setAnnouncements(announcementsData || [])

    const { data: eventsData } = await supabase
      .from("events")
      .select("*")
      .order("event_date", {
        ascending: true,
      })

    setEvents(eventsData || [])

    const { data: timetableData } = await supabase
      .from("timetable")
      .select("*")
      .order("day", {
        ascending: true,
      })

    setTimetable(timetableData || [])

    const {
      data: quizData,
      error: quizError,
    } = await supabase
      .from("quiz_attempts")
      .select(
        "id, course_code, course_title, score, question_count, percentage, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      })

    if (quizError) {
      console.error(
        "QUIZ STATISTICS ERROR:",
        quizError
      )

      setQuizAttempts([])
    } else {
      setQuizAttempts(quizData || [])
    }

    setLoading(false)
  }

  const myTimetable = timetable.filter(
    (item) => item.level === profile?.level
  )

  // ==========================================
  // OVERALL QUIZ STATISTICS
  // ==========================================

  const totalQuizzes = quizAttempts.length

  const totalCorrect = quizAttempts.reduce(
    (total, attempt) =>
      total + Number(attempt.score || 0),
    0
  )

  const totalQuestions = quizAttempts.reduce(
    (total, attempt) =>
      total +
      Number(attempt.question_count || 0),
    0
  )

  const averageScore =
    totalQuestions > 0
      ? Math.round(
          (totalCorrect / totalQuestions) * 100
        )
      : 0

  const bestScore =
    totalQuizzes > 0
      ? Math.max(
          ...quizAttempts.map((attempt) =>
            Number(attempt.percentage || 0)
          )
        )
      : 0

  // ==========================================
  // COURSE PERFORMANCE
  // ==========================================

  const coursePerformance = {}

  quizAttempts.forEach((attempt) => {
    const code =
      attempt.course_code || "General"

    if (!coursePerformance[code]) {
      coursePerformance[code] = {
        course_code: code,
        course_title:
          attempt.course_title || code,
        attempts: 0,
        totalScore: 0,
        totalQuestions: 0,
        bestScore: 0,
      }
    }

    const course =
      coursePerformance[code]

    course.attempts += 1

    course.totalScore += Number(
      attempt.score || 0
    )

    course.totalQuestions += Number(
      attempt.question_count || 0
    )

    course.bestScore = Math.max(
      course.bestScore,
      Number(attempt.percentage || 0)
    )
  })

  const coursePerformanceList =
    Object.values(coursePerformance)
      .map((course) => ({
        ...course,

        average:
          course.totalQuestions > 0
            ? Math.round(
                (course.totalScore /
                  course.totalQuestions) *
                  100
              )
            : 0,
      }))
      .sort(
        (a, b) => a.average - b.average
      )

  // ==========================================
  // RECOMMENDED COURSE
  // ==========================================

  const recommendedCourse =
    coursePerformanceList.length > 0
      ? coursePerformanceList[0]
      : null

  // ==========================================
  // PERFORMANCE LABEL
  // ==========================================

  function getPerformanceLabel(score) {
    if (score >= 80) {
      return {
        text: "Excellent",
        className:
          "text-green-600 dark:text-green-400",
      }
    }

    if (score >= 70) {
      return {
        text: "Good",
        className:
          "text-blue-600 dark:text-blue-400",
      }
    }

    if (score >= 50) {
      return {
        text: "Needs Practice",
        className:
          "text-yellow-600 dark:text-yellow-400",
      }
    }

    return {
      text: "Needs Attention",
      className:
        "text-red-600 dark:text-red-400",
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-950 text-2xl font-bold text-gray-800 dark:text-white">
        Loading Dashboard...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 text-gray-800 dark:text-gray-100 transition-colors duration-300">

      {/* HEADER */}

      <div className="bg-blue-900 dark:bg-slate-900 text-white px-10 py-6 flex justify-between items-center shadow-lg">

        <div>
          <h1 className="text-3xl font-bold">
            QS Nexus Student Dashboard
          </h1>

          <p className="text-blue-100 mt-2">
            Welcome, {profile?.full_name}
          </p>
        </div>

        <LogoutButton />

      </div>

      <div className="max-w-7xl mx-auto p-8">

        {/* BASIC STATISTICS */}

        <div className="grid md:grid-cols-6 gap-6">

          <Card
            title="Department"
            value={profile?.department}
          />

          <Card
            title="Level"
            value={profile?.level}
          />

          <Card
            title="Courses"
            value={courses.length}
          />

          <Card
            title="Resources"
            value={resources.length}
          />

          <Card
            title="Events"
            value={events.length}
          />

          <Card
            title="Classes"
            value={myTimetable.length}
          />

        </div>

        {/* QUIZ PERFORMANCE */}

        <Section title="🧠 Quiz Performance">

          {totalQuizzes === 0 ? (

            <div className="text-center py-8">

              <div className="text-5xl mb-4">
                📚
              </div>

              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                No quiz attempts yet
              </h3>

              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Take a course quiz to start tracking your performance.
              </p>

              <button
                onClick={() =>
                  document
                    .getElementById("my-courses")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
                className="mt-5 bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Take a Quiz
              </button>

            </div>

          ) : (

            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">

                <PerformanceCard
                  icon="🧠"
                  title="Quizzes Completed"
                  value={totalQuizzes}
                />

                <PerformanceCard
                  icon="📈"
                  title="Average Score"
                  value={`${averageScore}%`}
                />

                <PerformanceCard
                  icon="🏆"
                  title="Best Score"
                  value={`${bestScore}%`}
                />

                <PerformanceCard
                  icon="✅"
                  title="Correct Answers"
                  value={`${totalCorrect}/${totalQuestions}`}
                />

              </div>

              <div className="flex flex-wrap gap-4 mt-6">

                <button
                  onClick={() =>
                    navigate("/quiz-history")
                  }
                  className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-3 rounded-lg font-semibold"
                >
                  📊 View Quiz History
                </button>

                <button
                  onClick={() =>
                    navigate("/quiz-leaderboard")
                  }
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-5 py-3 rounded-lg font-semibold"
                >
                  🏆 View Leaderboard
                </button>

              </div>
            </>
          )}

        </Section>

        {/* COURSE PERFORMANCE */}

        {coursePerformanceList.length > 0 && (

          <Section title="📚 Course Performance">

            <div className="space-y-4">

              {coursePerformanceList.map(
                (course) => {

                  const performance =
                    getPerformanceLabel(
                      course.average
                    )

                  return (
                    <div
                      key={
                        course.course_code
                      }
                      className="border border-gray-200 dark:border-slate-700 rounded-xl p-5"
                    >

                      <div className="flex flex-col lg:flex-row lg:items-center gap-5">

                        {/* COURSE */}

                        <div className="flex-1">

                          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-400">
                            {course.course_code}
                          </h3>

                          <p className="text-gray-600 dark:text-gray-300">
                            {course.course_title}
                          </p>

                          <p
                            className={`font-semibold mt-2 ${performance.className}`}
                          >
                            {performance.text}
                          </p>

                        </div>

                        {/* ATTEMPTS */}

                        <div className="text-center min-w-[100px]">

                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Attempts
                          </p>

                          <p className="text-xl font-bold dark:text-white">
                            {course.attempts}
                          </p>

                        </div>

                        {/* AVERAGE */}

                        <div className="text-center min-w-[100px]">

                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Average
                          </p>

                          <p className="text-xl font-bold text-blue-900 dark:text-blue-400">
                            {course.average}%
                          </p>

                        </div>

                        {/* BEST */}

                        <div className="text-center min-w-[100px]">

                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Best
                          </p>

                          <p className="text-xl font-bold text-green-600 dark:text-green-400">
                            {course.bestScore}%
                          </p>

                        </div>

                      </div>

                      {/* PROGRESS BAR */}

                      <div className="mt-5">

                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">

                          <span>
                            Performance
                          </span>

                          <span>
                            {course.average}%
                          </span>

                        </div>

                        <div className="w-full h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">

                          <div
                            className={`h-full rounded-full ${
                              course.average >= 80
                                ? "bg-green-500"
                                : course.average >=
                                  70
                                ? "bg-blue-500"
                                : course.average >=
                                  50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                course.average,
                                100
                              )}%`,
                            }}
                          />

                        </div>

                      </div>

                    </div>
                  )
                }
              )}

            </div>

          </Section>
        )}

        {/* RECOMMENDATION */}

        {recommendedCourse && (

          <div className="mt-8 bg-gradient-to-r from-blue-900 to-blue-700 dark:from-slate-900 dark:to-blue-950 text-white rounded-2xl shadow-lg p-6">

            <div className="flex flex-col md:flex-row md:items-center gap-5">

              <div className="text-5xl">
                💡
              </div>

              <div className="flex-1">

                <h2 className="text-xl font-bold">
                  Personalized Study Recommendation
                </h2>

                <p className="mt-2 text-blue-100">
                  Your current lowest quiz
                  performance is in{" "}
                  <strong>
                    {
                      recommendedCourse.course_code
                    }
                  </strong>
                  .
                </p>

                <p className="mt-1 text-blue-100">
                  Your average is{" "}
                  <strong>
                    {
                      recommendedCourse.average
                    }%
                  </strong>
                  . Consider spending some extra study time on this course.
                </p>

              </div>

              <button
                onClick={() =>
                  navigate(
                    `/course-quiz/${recommendedCourse.course_code}`
                  )
                }
                className="bg-white text-blue-900 hover:bg-blue-50 px-5 py-3 rounded-lg font-bold whitespace-nowrap"
              >
                Practice Now
              </button>

            </div>

          </div>
        )}

        {/* STUDENT ACTIONS */}

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-6 mt-8">

          <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-400 mb-5">
            Student Actions
          </h2>

          <div className="grid md:grid-cols-4 gap-4">

            <ActionButton
              title="View Assignments"
              click={() =>
                navigate(
                  "/student-assignments"
                )
              }
            />

            <ActionButton
              title="My Submissions"
              click={() =>
                navigate(
                  "/student-submissions"
                )
              }
            />

            <ActionButton
              title="Learning Resources"
              click={() =>
                navigate("/resources")
              }
            />

            <ActionButton
              title="GPA Calculator"
              click={() =>
                navigate(
                  "/gpa-calculator"
                )
              }
            />

            <ActionButton
              title="🤖 AI Study Assistant"
              click={() =>
                navigate(
                  "/study-assistant"
                )
              }
            />
            <ActionButton
  title="📈 My Performance"
  click={() => navigate("/quiz-performance")}
/>

            <ActionButton
              title="📊 Quiz History"
              click={() =>
                navigate(
                  "/quiz-history"
                )
              }
            />

            <ActionButton
              title="🏆 Quiz Leaderboard"
              click={() =>
                navigate(
                  "/quiz-leaderboard"
                )
              }
            />

            <ActionButton
              title="Announcements"
              click={() =>
                navigate(
                  "/student-announcements"
                )
              }
            />

          </div>

        </div>

        {/* COURSES */}

        <div id="my-courses">

          <Section title="My Courses">

            {courses.length === 0 ? (

              <p className="text-gray-500 dark:text-gray-400">
                No courses available.
              </p>

            ) : (

              courses.map(
                (course) => (

                  <div
                    key={course.id}
                    className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 mb-4"
                  >

                    <h3 className="font-bold text-blue-900 dark:text-blue-400">
                      {course.course_code}
                    </h3>

                    <p className="text-gray-700 dark:text-gray-200">
                      {
                        course.course_title
                      }
                    </p>

                    <p className="text-gray-600 dark:text-gray-400">
                      Unit: {course.unit}
                    </p>

                    <button
                      onClick={() =>
                        navigate(
                          `/course-quiz/${course.course_code}`
                        )
                      }
                      className="mt-4 bg-blue-900 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
                    >
                      🧠 Take Course Quiz
                    </button>

                  </div>

                )
              )

            )}

          </Section>

        </div>

        {/* TIMETABLE */}

        <Section title="My Timetable">

          {myTimetable.length === 0 ? (

            <p className="text-gray-500 dark:text-gray-400">
              No timetable available.
            </p>

          ) : (

            myTimetable.map(
              (item) => (

                <div
                  key={item.id}
                  className="border border-gray-200 dark:border-slate-700 rounded-lg p-5 mb-4"
                >

                  <h3 className="font-bold text-blue-900 dark:text-blue-400">
                    {item.course_code}
                  </h3>

                  <p className="text-gray-700 dark:text-gray-200">
                    {item.course_title}
                  </p>

                  <p className="text-gray-600 dark:text-gray-400">
                    👨‍🏫 {item.lecturer}
                  </p>

                  <p className="text-gray-600 dark:text-gray-400">
                    📅 {item.day}
                  </p>

                  <p className="text-gray-600 dark:text-gray-400">
                    ⏰ {item.start_time} -{" "}
                    {item.end_time}
                  </p>

                  <p className="text-gray-600 dark:text-gray-400">
                    📍 {item.venue}
                  </p>

                </div>

              )
            )

          )}

        </Section>

        {/* RESOURCES */}

        <Section title="Learning Resources">

          {resources.length === 0 ? (

            <p className="text-gray-500 dark:text-gray-400">
              No resources available.
            </p>

          ) : (

            resources.map(
              (resource) => (

                <div
                  key={resource.id}
                  className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 mb-4"
                >

                  <h3 className="font-bold text-gray-800 dark:text-white">
                    {resource.title}
                  </h3>

                  <a
                    href={
                      resource.file_url
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 dark:text-blue-400 hover:underline"
                  >
                    Open Resource →
                  </a>

                </div>

              )
            )

          )}

        </Section>

      </div>

    </div>
  )
}

function Card({
  title,
  value,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-5">

      <p className="text-gray-500 dark:text-gray-400">
        {title}
      </p>

      <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
        {value || "—"}
      </h2>

    </div>
  )
}

function PerformanceCard({
  icon,
  title,
  value,
}) {
  return (
    <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-5">

      <div className="text-3xl mb-3">
        {icon}
      </div>

      <p className="text-gray-500 dark:text-gray-400">
        {title}
      </p>

      <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-400 mt-1">
        {value}
      </h3>

    </div>
  )
}

function ActionButton({
  title,
  click,
}) {
  return (
    <button
      onClick={click}
      className="bg-blue-900 dark:bg-blue-700 text-white p-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
    >
      {title}
    </button>
  )
}

function Section({
  title,
  children,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-6 mt-8">

      <h2 className="text-2xl font-bold mb-5 text-gray-900 dark:text-white">
        {title}
      </h2>

      {children}

    </div>
  )
}

export default StudentDashboard