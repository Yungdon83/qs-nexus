import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import LogoutButton from "../components/LogoutButton"

function StudentDashboard() {
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [courses, setCourses] = useState([])
  const [resources, setResources] = useState([])
  const [assignments, setAssignments] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [events, setEvents] = useState([])
  const [timetable, setTimetable] = useState([])
  const [quizAttempts, setQuizAttempts] = useState([])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

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

      // ==========================================
      // PROFILE
      // ==========================================

      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) {
        throw profileError
      }

      setProfile(profileData)

      // ==========================================
      // LOAD MAIN DASHBOARD DATA
      // ==========================================

      const [
        coursesResult,
        resourcesResult,
        assignmentsResult,
        announcementsResult,
        eventsResult,
        timetableResult,
        quizResult,
      ] = await Promise.all([
        supabase
          .from("courses")
          .select("*")
          .order("course_code", {
            ascending: true,
          }),

        supabase
          .from("resources")
          .select("*")
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("announcements")
.select("*")
.in("audience", ["students", "all"])
.order("created_at", {
  ascending: false,
}),

        supabase
          .from("announcements")
          .select("*")
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("events")
          .select("*")
          .order("event_date", {
            ascending: true,
          }),

        supabase
          .from("timetable")
          .select("*")
          .order("day", {
            ascending: true,
          }),

        supabase
          .from("quiz_attempts")
          .select(
            "id, course_code, course_title, score, question_count, percentage, created_at"
          )
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          }),
      ])

      // ==========================================
      // COURSES
      // ==========================================

      if (coursesResult.error) {
        console.error(
          "COURSES ERROR:",
          coursesResult.error
        )
      }

      setCourses(
        coursesResult.data || []
      )

      // ==========================================
      // RESOURCES
      // ==========================================

      if (resourcesResult.error) {
        console.error(
          "RESOURCES ERROR:",
          resourcesResult.error
        )
      }

      const allResources =
        resourcesResult.data || []

      const filteredResources =
        profileData
          ? allResources.filter(
              (resource) => {
                const levelMatch =
                  !resource.level ||
                  !profileData.level ||
                  resource.level ===
                    profileData.level

                const departmentMatch =
                  !resource.department ||
                  !profileData.department ||
                  resource.department ===
                    profileData.department

                return (
                  levelMatch &&
                  departmentMatch
                )
              }
            )
          : allResources

      setResources(
        filteredResources
      )

      // ==========================================
      // ASSIGNMENTS
      // ==========================================

      if (assignmentsResult.error) {
        console.error(
          "ASSIGNMENTS ERROR:",
          assignmentsResult.error
        )
      }

      const allAssignments =
        assignmentsResult.data || []

      const filteredAssignments =
        profileData
          ? allAssignments.filter(
              (assignment) => {
                const levelMatch =
                  !assignment.level ||
                  !profileData.level ||
                  assignment.level ===
                    profileData.level

                const departmentMatch =
                  !assignment.department ||
                  !profileData.department ||
                  assignment.department ===
                    profileData.department

                return (
                  levelMatch &&
                  departmentMatch
                )
              }
            )
          : allAssignments

      setAssignments(
        filteredAssignments
      )

      // ==========================================
      // ANNOUNCEMENTS
      // ==========================================

      if (announcementsResult.error) {
        console.error(
          "ANNOUNCEMENTS ERROR:",
          announcementsResult.error
        )
      }

      setAnnouncements(
        announcementsResult.data || []
      )

      // ==========================================
      // EVENTS
      // ==========================================

      if (eventsResult.error) {
        console.error(
          "EVENTS ERROR:",
          eventsResult.error
        )
      }

      setEvents(
        eventsResult.data || []
      )

      // ==========================================
      // TIMETABLE
      // ==========================================

      if (timetableResult.error) {
        console.error(
          "TIMETABLE ERROR:",
          timetableResult.error
        )
      }

      setTimetable(
        timetableResult.data || []
      )

      // ==========================================
      // QUIZ ATTEMPTS
      // ==========================================

      if (quizResult.error) {
        console.error(
          "QUIZ STATISTICS ERROR:",
          quizResult.error
        )

        setQuizAttempts([])
      } else {
        setQuizAttempts(
          quizResult.data || []
        )
      }
    } catch (err) {
      console.error(
        "DASHBOARD ERROR:",
        err
      )

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard."
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // ==========================================
  // FILTER TIMETABLE
  // ==========================================

  const myTimetable = useMemo(() => {
    if (!profile) {
      return []
    }

    return timetable.filter(
      (item) =>
        !item.level ||
        item.level === profile.level
    )
  }, [timetable, profile])

  // ==========================================
  // OVERALL QUIZ STATISTICS
  // ==========================================

  const totalQuizzes =
    quizAttempts.length

  const totalCorrect =
    quizAttempts.reduce(
      (total, attempt) =>
        total +
        Number(attempt.score || 0),
      0
    )

  const totalQuestions =
    quizAttempts.reduce(
      (total, attempt) =>
        total +
        Number(
          attempt.question_count || 0
        ),
      0
    )

  const averageScore =
    totalQuestions > 0
      ? Math.round(
          (totalCorrect /
            totalQuestions) *
            100
        )
      : 0

  const bestScore =
    totalQuizzes > 0
      ? Math.max(
          ...quizAttempts.map(
            (attempt) =>
              Number(
                attempt.percentage || 0
              )
          )
        )
      : 0

  // ==========================================
  // COURSE PERFORMANCE
  // ==========================================

  const coursePerformanceList =
    useMemo(() => {
      const performance = {}

      quizAttempts.forEach(
        (attempt) => {
          const code =
            attempt.course_code ||
            "General"

          if (!performance[code]) {
            performance[code] = {
              course_code: code,
              course_title:
                attempt.course_title ||
                code,
              attempts: 0,
              totalScore: 0,
              totalQuestions: 0,
              bestScore: 0,
            }
          }

          const course =
            performance[code]

          course.attempts += 1

          course.totalScore +=
            Number(
              attempt.score || 0
            )

          course.totalQuestions +=
            Number(
              attempt.question_count ||
                0
            )

          course.bestScore =
            Math.max(
              course.bestScore,
              Number(
                attempt.percentage || 0
              )
            )
        }
      )

      return Object.values(
        performance
      )
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
          (a, b) =>
            a.average - b.average
        )
    }, [quizAttempts])

  // ==========================================
  // RECOMMENDED COURSE
  // ==========================================

  const recommendedCourse =
    coursePerformanceList.length > 0
      ? coursePerformanceList[0]
      : null

  // ==========================================
  // RECENT ITEMS
  // ==========================================

  const recentResources =
    resources.slice(0, 3)

  const recentAssignments =
    assignments.slice(0, 3)

  const recentAnnouncements =
    announcements.slice(0, 3)

  const upcomingEvents =
    events.slice(0, 3)

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

  // ==========================================
  // DATE FORMATTER
  // ==========================================

  function formatDate(date) {
    if (!date) {
      return ""
    }

    const parsedDate =
      new Date(date)

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return String(date)
    }

    return parsedDate.toLocaleDateString(
      "en-NG",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    )
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-950">
        <div className="text-center">
          <div className="text-6xl mb-5">
            🎓
          </div>

          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
            Loading Dashboard...
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Preparing your QS Nexus experience.
          </p>
        </div>
      </div>
    )
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-950 p-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">
          <div className="text-5xl mb-5">
            ⚠️
          </div>

          <h1 className="text-2xl font-bold text-red-600">
            Dashboard Error
          </h1>

          <p className="mt-4 text-gray-600 dark:text-gray-300 break-words">
            {error}
          </p>

          <button
            onClick={() =>
              loadDashboard()
            }
            className="mt-6 bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // ==========================================
  // DASHBOARD
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 text-gray-800 dark:text-gray-100 transition-colors duration-300">

      {/* HEADER */}

      <div className="bg-blue-900 dark:bg-slate-900 text-white shadow-lg">

        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                QS Nexus Student Dashboard
              </h1>

              <p className="text-blue-100 mt-2">
                Welcome,{" "}
                {profile?.full_name ||
                  "Student"}{" "}
                👋
              </p>

              <p className="text-blue-200 text-sm mt-1">
                {profile?.department ||
                  "Department"}{" "}
                •{" "}
                {profile?.level ||
                  "Level"}
              </p>
            </div>

            <div className="flex items-center gap-3">

              <button
                onClick={() =>
                  loadDashboard(true)
                }
                disabled={refreshing}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2.5 rounded-lg font-semibold disabled:opacity-50"
              >
                {refreshing
                  ? "Refreshing..."
                  : "↻ Refresh"}
              </button>

              <LogoutButton />

            </div>

          </div>

        </div>

      </div>

      <div className="max-w-7xl mx-auto p-6 sm:p-8">

        {/* ======================================
            BASIC STATISTICS
        ====================================== */}

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">

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
            title="Assignments"
            value={assignments.length}
          />

          <Card
            title="Events"
            value={events.length}
          />

          <Card
            title="Classes"
            value={myTimetable.length}
          />

          <Card
            title="Quizzes"
            value={totalQuizzes}
          />

        </div>

        {/* ======================================
            QUICK ACCESS
        ====================================== */}

        <Section title="⚡ Quick Access">

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">

            <QuickAction
              icon="📝"
              title="Assignments"
              onClick={() =>
                navigate(
                  "/student-assignments"
                )
              }
            />

            <QuickAction
              icon="📚"
              title="Resources"
              onClick={() =>
                navigate("/resources")
              }
            />

            <QuickAction
              icon="🧠"
              title="Take Quiz"
              onClick={() => {
                if (
                  courses.length > 0
                ) {
                  navigate(
                    `/course-quiz/${courses[0].course_code}`
                  )
                } else {
                  navigate(
                    "/student-dashboard"
                  )
                }
              }}
            />

            <QuickAction
              icon="📈"
              title="My Progress"
              onClick={() =>
                navigate(
                  "/course-progress"
                )
              }
            />

            <QuickAction
              icon="🤖"
              title="AI Assistant"
              onClick={() =>
                navigate(
                  "/study-assistant"
                )
              }
            />

            <QuickAction
              icon="📊"
              title="Quiz History"
              onClick={() =>
                navigate(
                  "/quiz-history"
                )
              }
            />

          </div>

        </Section>

        {/* ======================================
            QUIZ PERFORMANCE
        ====================================== */}

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
                    .getElementById(
                      "my-courses"
                    )
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

              <div className="flex flex-wrap gap-3 mt-6">

                <button
                  onClick={() =>
                    navigate(
                      "/quiz-history"
                    )
                  }
                  className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-3 rounded-lg font-semibold"
                >
                  📊 Quiz History
                </button>

                <button
                  onClick={() =>
                    navigate(
                      "/quiz-leaderboard"
                    )
                  }
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-5 py-3 rounded-lg font-semibold"
                >
                  🏆 Leaderboard
                </button>

                <button
                  onClick={() =>
                    navigate(
                      "/course-progress"
                    )
                  }
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-semibold"
                >
                  📈 Course Progress
                </button>

              </div>
            </>

          )}

        </Section>

        {/* ======================================
            COURSE PERFORMANCE
        ====================================== */}

        {coursePerformanceList.length >
          0 && (

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

                        <div className="text-center min-w-[100px]">

                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Attempts
                          </p>

                          <p className="text-xl font-bold dark:text-white">
                            {course.attempts}
                          </p>

                        </div>

                        <div className="text-center min-w-[100px]">

                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Average
                          </p>

                          <p className="text-xl font-bold text-blue-900 dark:text-blue-400">
                            {course.average}%
                          </p>

                        </div>

                        <div className="text-center min-w-[100px]">

                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Best
                          </p>

                          <p className="text-xl font-bold text-green-600 dark:text-green-400">
                            {course.bestScore}%
                          </p>

                        </div>

                      </div>

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
                              course.average >=
                              80
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

                      <button
                        onClick={() =>
                          navigate(
                            `/course-quiz/${course.course_code}`
                          )
                        }
                        className="mt-4 bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                      >
                        Practice Quiz →
                      </button>

                    </div>
                  )
                }
              )}

            </div>

          </Section>

        )}

        {/* ======================================
            RECOMMENDATION
        ====================================== */}

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
                  Current average:{" "}
                  <strong>
                    {
                      recommendedCourse.average
                    }%
                  </strong>
                  .
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

        {/* ======================================
            RECENT ASSIGNMENTS
        ====================================== */}

        <Section title="📝 Recent Assignments">

          {recentAssignments.length ===
          0 ? (

            <div className="text-center py-6">

              <div className="text-4xl">
                📝
              </div>

              <p className="mt-3 text-gray-500 dark:text-gray-400">
                No assignments available yet.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {recentAssignments.map(
                (assignment) => (

                  <div
                    key={assignment.id}
                    className="border border-gray-200 dark:border-slate-700 rounded-xl p-4"
                  >

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                      <div>

                        <h3 className="font-bold text-blue-900 dark:text-blue-400">
                          {assignment.title ||
                            "Assignment"}
                        </h3>

                        {assignment.course_code && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {assignment.course_code}
                          </p>
                        )}

                        {assignment.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                            {
                              assignment.description
                            }
                          </p>
                        )}

                      </div>

                      <div className="text-sm text-gray-500 dark:text-gray-400">

                        {assignment.due_date
                          ? `Due: ${formatDate(
                              assignment.due_date
                            )}`
                          : assignment.created_at
                          ? formatDate(
                              assignment.created_at
                            )
                          : ""}

                      </div>

                    </div>

                  </div>

                )
              )}

              <button
                onClick={() =>
                  navigate(
                    "/student-assignments"
                  )
                }
                className="mt-2 text-blue-700 dark:text-blue-400 font-semibold hover:underline"
              >
                View all assignments →
              </button>

            </div>

          )}

        </Section>

        {/* ======================================
            RECENT RESOURCES
        ====================================== */}

        <Section title="📚 Recent Learning Resources">

          {recentResources.length ===
          0 ? (

            <div className="text-center py-6">

              <div className="text-4xl">
                📚
              </div>

              <p className="mt-3 text-gray-500 dark:text-gray-400">
                No learning resources available yet.
              </p>

            </div>

          ) : (

            <div className="grid md:grid-cols-3 gap-4">

              {recentResources.map(
                (resource) => (

                  <div
                    key={resource.id}
                    className="border border-gray-200 dark:border-slate-700 rounded-xl p-5"
                  >

                    <div className="text-3xl">
                      📄
                    </div>

                    <h3 className="font-bold text-blue-900 dark:text-blue-400 mt-3">
                      {resource.title}
                    </h3>

                    {resource.course_code && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {resource.course_code}
                      </p>
                    )}

                    {resource.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                        {
                          resource.description
                        }
                      </p>
                    )}

                    {resource.file_url && (
                      <a
                        href={
                          resource.file_url
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-4 text-blue-700 dark:text-blue-400 font-semibold hover:underline"
                      >
                        Open Resource →
                      </a>
                    )}

                  </div>

                )
              )}

            </div>

          )}

          {resources.length > 3 && (
            <button
              onClick={() =>
                navigate(
                  "/resources"
                )
              }
              className="mt-5 text-blue-700 dark:text-blue-400 font-semibold hover:underline"
            >
              View all resources →
            </button>
          )}

        </Section>

        {/* ======================================
            ANNOUNCEMENTS + EVENTS
        ====================================== */}

        <div className="grid lg:grid-cols-2 gap-6">

          <Section title="📢 Latest Announcements">

            {recentAnnouncements.length ===
            0 ? (

              <p className="text-gray-500 dark:text-gray-400">
                No announcements available.
              </p>

            ) : (

              <div className="space-y-4">

                {recentAnnouncements.map(
                  (announcement) => (

                    <div
                      key={
                        announcement.id
                      }
                      className="border border-gray-200 dark:border-slate-700 rounded-xl p-4"
                    >

                      <h3 className="font-bold text-blue-900 dark:text-blue-400">
                        {announcement.title ||
                          "Announcement"}
                      </h3>

                      {announcement.content && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">
                          {
                            announcement.content
                          }
                        </p>
                      )}

                      {announcement.created_at && (
                        <p className="text-xs text-gray-400 mt-3">
                          {formatDate(
                            announcement.created_at
                          )}
                        </p>
                      )}

                    </div>

                  )
                )}

                <button
                  onClick={() =>
                    navigate(
                      "/student-announcements"
                    )
                  }
                  className="text-blue-700 dark:text-blue-400 font-semibold hover:underline"
                >
                  View all announcements →
                </button>

              </div>

            )}

          </Section>

          <Section title="📅 Upcoming Events">

            {upcomingEvents.length ===
            0 ? (

              <p className="text-gray-500 dark:text-gray-400">
                No upcoming events.
              </p>

            ) : (

              <div className="space-y-4">

                {upcomingEvents.map(
                  (event) => (

                    <div
                      key={event.id}
                      className="border border-gray-200 dark:border-slate-700 rounded-xl p-4"
                    >

                      <h3 className="font-bold text-blue-900 dark:text-blue-400">
                        {event.title ||
                          "Event"}
                      </h3>

                      {event.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                          {
                            event.description
                          }
                        </p>
                      )}

                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-3">

                        {event.event_date && (
                          <p>
                            📅{" "}
                            {formatDate(
                              event.event_date
                            )}
                          </p>
                        )}

                        {event.venue && (
                          <p className="mt-1">
                            📍{" "}
                            {event.venue}
                          </p>
                        )}

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </Section>

        </div>

        {/* ======================================
            STUDENT ACTIONS
        ====================================== */}

        <Section title="🎯 Student Actions">

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

            <ActionButton
              title="📝 Assignments"
              click={() =>
                navigate(
                  "/student-assignments"
                )
              }
            />

            <ActionButton
              title="📤 My Submissions"
              click={() =>
                navigate(
                  "/student-submissions"
                )
              }
            />

            <ActionButton
              title="📚 Resources"
              click={() =>
                navigate("/resources")
              }
            />

            <ActionButton
              title="🧮 GPA Calculator"
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
              click={() =>
                navigate(
                  "/quiz-performance"
                )
              }
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
              title="📢 Announcements"
              click={() =>
                navigate(
                  "/student-announcements"
                )
              }
            />

            <ActionButton
              title="📈 Course Progress"
              click={() =>
                navigate(
                  "/course-progress"
                )
              }
            />

          </div>

        </Section>

        {/* ======================================
            COURSES
        ====================================== */}

        <div id="my-courses">

          <Section title="📘 My Courses">

            {courses.length === 0 ? (

              <p className="text-gray-500 dark:text-gray-400">
                No courses available.
              </p>

            ) : (

              <div className="grid md:grid-cols-2 gap-4">

                {courses.map(
                  (course) => (

                    <div
                      key={course.id}
                      className="border border-gray-200 dark:border-slate-700 rounded-xl p-5"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <h3 className="font-bold text-blue-900 dark:text-blue-400">
                            {
                              course.course_code
                            }
                          </h3>

                          <p className="text-gray-700 dark:text-gray-200 mt-1">
                            {
                              course.course_title
                            }
                          </p>

                          {course.unit && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                              Unit:{" "}
                              {course.unit}
                            </p>
                          )}

                        </div>

                        <span className="text-2xl">
                          📘
                        </span>

                      </div>

                      <button
                        onClick={() =>
                          navigate(
                            `/course-quiz/${course.course_code}`
                          )
                        }
                        className="mt-4 w-full bg-blue-900 dark:bg-blue-700 text-white px-4 py-2.5 rounded-lg hover:bg-blue-800 font-semibold"
                      >
                        🧠 Take Course Quiz
                      </button>

                    </div>

                  )
                )}

              </div>

            )}

          </Section>

        </div>

        {/* ======================================
            TIMETABLE
        ====================================== */}

        <Section title="🗓️ My Timetable">

          {myTimetable.length === 0 ? (

            <p className="text-gray-500 dark:text-gray-400">
              No timetable available.
            </p>

          ) : (

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

              {myTimetable.map(
                (item) => (

                  <div
                    key={item.id}
                    className="border border-gray-200 dark:border-slate-700 rounded-xl p-5"
                  >

                    <h3 className="font-bold text-blue-900 dark:text-blue-400">
                      {item.course_code}
                    </h3>

                    <p className="text-gray-700 dark:text-gray-200 mt-1">
                      {
                        item.course_title
                      }
                    </p>

                    <div className="mt-4 space-y-1 text-sm text-gray-600 dark:text-gray-400">

                      <p>
                        👨‍🏫{" "}
                        {item.lecturer ||
                          "Lecturer TBA"}
                      </p>

                      <p>
                        📅{" "}
                        {item.day ||
                          "Day TBA"}
                      </p>

                      <p>
                        ⏰{" "}
                        {item.start_time ||
                          "--"}{" "}
                        -{" "}
                        {item.end_time ||
                          "--"}
                      </p>

                      <p>
                        📍{" "}
                        {item.venue ||
                          "Venue TBA"}
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </Section>

      </div>

    </div>
  )
}

// ==========================================
// BASIC CARD
// ==========================================

function Card({
  title,
  value,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-4">

      <p className="text-xs text-gray-500 dark:text-gray-400">
        {title}
      </p>

      <h2 className="text-lg sm:text-xl font-bold text-blue-900 dark:text-blue-400 mt-1 truncate">
        {value || "—"}
      </h2>

    </div>
  )
}

// ==========================================
// PERFORMANCE CARD
// ==========================================

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

// ==========================================
// QUICK ACTION
// ==========================================

function QuickAction({
  icon,
  title,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-xl p-5 text-center hover:bg-blue-100 dark:hover:bg-slate-700 transition"
    >

      <div className="text-3xl">
        {icon}
      </div>

      <p className="font-semibold text-blue-900 dark:text-blue-400 mt-2">
        {title}
      </p>

    </button>
  )
}

// ==========================================
// ACTION BUTTON
// ==========================================

function ActionButton({
  title,
  click,
}) {
  return (
    <button
      onClick={click}
      className="bg-blue-900 dark:bg-blue-700 text-white p-4 rounded-lg hover:bg-blue-800 dark:hover:bg-blue-600 transition font-semibold"
    >
      {title}
    </button>
  )
}

// ==========================================
// SECTION
// ==========================================

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