import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../lib/supabase"
import LogoutButton from "../components/LogoutButton"

function LecturerDashboard() {
  const [profile, setProfile] = useState(null)

  const [courses, setCourses] = useState([])
  const [resources, setResources] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [events, setEvents] = useState([])
  const [timetable, setTimetable] = useState([])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.log(userError.message)
      }

      if (!user) {
        setLoading(false)
        setRefreshing(false)
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
        console.log(
          "PROFILE ERROR:",
          profileError.message
        )
      }

      setProfile(profileData)

      // ==========================================
      // COURSES
      // ==========================================

      const {
        data: coursesData,
        error: coursesError,
      } = await supabase
        .from("courses")
        .select(`
          id,
          course_code,
          course_title,
          unit,
          level,
          semester,
          department
        `)
        .eq("lecturer_id", user.id)
        .order("course_code", {
          ascending: true,
        })

      if (coursesError) {
        console.log(
          "COURSE ERROR:",
          coursesError.message
        )
      }

      setCourses(coursesData || [])

      // ==========================================
      // RESOURCES
      // ==========================================

      const {
        data: resourcesData,
        error: resourcesError,
      } = await supabase
        .from("resources")
        .select("*")
        .eq("uploaded_by", user.id)
        .order("created_at", {
          ascending: false,
        })

      if (resourcesError) {
        console.log(
          "RESOURCE ERROR:",
          resourcesError.message
        )
      }

      setResources(resourcesData || [])

      // ==========================================
      // ANNOUNCEMENTS
      // ==========================================

      const {
        data: announcementData,
        error: announcementError,
      } = await supabase
        .from("announcements")
        .select("*")
        .eq("posted_by", user.id)
        .order("created_at", {
          ascending: false,
        })

      if (announcementError) {
        console.log(
          "ANNOUNCEMENT ERROR:",
          announcementError.message
        )
      }

      setAnnouncements(
        announcementData || []
      )

      // ==========================================
      // EVENTS
      // ==========================================

      const {
        data: eventData,
        error: eventError,
      } = await supabase
        .from("events")
        .select("*")
        .eq("created_by", user.id)
        .order("event_date", {
          ascending: true,
        })

      if (eventError) {
        console.log(
          "EVENT ERROR:",
          eventError.message
        )
      }

      setEvents(eventData || [])

      // ==========================================
      // TIMETABLE
      // ==========================================

      const {
        data: timetableData,
        error: timetableError,
      } = await supabase
        .from("timetable")
        .select("*")
        .eq(
          "lecturer",
          profileData?.full_name
        )

      if (timetableError) {
        console.log(
          "TIMETABLE ERROR:",
          timetableError.message
        )
      }

      setTimetable(timetableData || [])
    } catch (error) {
      console.log(
        "DASHBOARD ERROR:",
        error.message
      )
    }

    setLoading(false)
    setRefreshing(false)
  }

  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-950 flex items-center justify-center p-6">

        <div className="text-center animate-pulse">

          <div className="w-20 h-20 mx-auto rounded-2xl bg-blue-900 dark:bg-blue-700 flex items-center justify-center text-4xl shadow-xl">
            🎓
          </div>

          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400 mt-6">
            Loading Lecturer Portal...
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Preparing your QS Nexus workspace
          </p>

          <div className="w-48 h-1.5 bg-gray-200 dark:bg-slate-800 rounded-full mx-auto mt-5 overflow-hidden">
            <div className="h-full bg-blue-900 dark:bg-blue-500 rounded-full animate-pulse w-2/3" />
          </div>

        </div>

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 text-gray-800 dark:text-gray-100 transition-colors duration-300">

      {/* ==========================================
          HERO HEADER
      ========================================== */}

      <header className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 text-white">

        {/* Decorative circles */}

        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-2xl" />

        <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />

        <div className="absolute top-10 right-1/3 w-24 h-24 bg-white/5 rounded-full blur-xl" />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 py-8 md:py-10">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

            <div className="animate-[fadeIn_0.6s_ease-out]">

              <div className="flex items-center gap-3 mb-4">

                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-2xl shadow-lg">
                  🎓
                </div>

                <span className="text-blue-200 text-sm font-semibold tracking-wider uppercase">
                  QS Nexus
                </span>

              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                Lecturer Portal
              </h1>

              <p className="text-blue-100 mt-3 text-base sm:text-lg">
                Welcome back,{" "}
                <span className="font-bold text-white">
                  {profile?.full_name ||
                    "Lecturer"}
                </span>{" "}
                👋
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-4">

                <span className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm">
                  🏛️{" "}
                  {profile?.department ||
                    "Quantity Surveying"}
                </span>

                <span className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm">
                  👨‍🏫 Lecturer
                </span>

              </div>

            </div>

            <div className="flex flex-wrap items-center gap-3">

              <button
                onClick={() =>
                  loadDashboard(true)
                }
                disabled={refreshing}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50"
              >
                <span
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                >
                  ↻
                </span>

                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </button>

              <LogoutButton />

            </div>

          </div>

        </div>

      </header>

      {/* ==========================================
          MAIN CONTENT
      ========================================== */}

      <main className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8">

        {/* ==========================================
            WELCOME BANNER
        ========================================== */}

        <div className="mb-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 md:p-7 relative overflow-hidden">

          <div className="absolute right-0 top-0 w-40 h-40 bg-blue-100 dark:bg-blue-900/20 rounded-full -mr-16 -mt-16" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>

              <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                Lecturer Overview
              </p>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                Your teaching workspace
              </h2>

              <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">
                Manage your courses, assignments,
                resources, announcements and
                department activities from one place.
              </p>

            </div>

            <div className="text-6xl hidden md:block">
              👨‍🏫
            </div>

          </div>

        </div>

        {/* ==========================================
            STATISTICS
        ========================================== */}

        <section>

          <div className="flex items-center justify-between mb-4">

            <div>

              <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                Overview
              </p>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Your Statistics
              </h2>

            </div>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

            <StatCard
              icon="📘"
              title="My Courses"
              value={courses.length}
              delay="0ms"
            />

            <StatCard
              icon="📚"
              title="Resources"
              value={resources.length}
              delay="80ms"
            />

            <StatCard
              icon="📢"
              title="Announcements"
              value={announcements.length}
              delay="160ms"
            />

            <StatCard
              icon="📅"
              title="Events"
              value={events.length}
              delay="240ms"
            />

            <StatCard
              icon="🗓️"
              title="Classes"
              value={timetable.length}
              delay="320ms"
            />

          </div>

        </section>

        {/* ==========================================
            LECTURER TOOLS
        ========================================== */}

        <section className="mt-10">

          <div className="mb-5">

            <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              Workspace
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Lecturer Tools
            </h2>

            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Everything you need to manage your
              teaching activities.
            </p>

          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

            <ActionCard
              to="/create-assignment"
              icon="📝"
              title="Create Assignment"
              description="Give students new assignments"
            />

            <ActionCard
              to="/manage-assignments"
              icon="📋"
              title="Manage Assignments"
              description="View and manage your assignments"
            />

            <ActionCard
              to="/grade-submissions"
              icon="🎯"
              title="Grade Submissions"
              description="Review and grade student work"
              featured
            />

            <ActionCard
              to="/upload-resource"
              icon="📤"
              title="Upload Resource"
              description="Upload slides, PDFs and materials"
            />

            <ActionCard
              to="/manage-resources"
              icon="📚"
              title="Manage Resources"
              description="Manage your uploaded materials"
            />

            <ActionCard
              to="/create-announcement"
              icon="📢"
              title="Create Announcement"
              description="Send information to students"
            />

            <ActionCard
              to="/manage-announcements"
              icon="📣"
              title="Manage Announcements"
              description="Edit or manage announcements"
            />

            <ActionCard
              to="/create-event"
              icon="🎉"
              title="Create Event"
              description="Create a department event"
            />

            <ActionCard
              to="/manage-events"
              icon="📅"
              title="Manage Events"
              description="Manage your department events"
            />

            <ActionCard
              to="/timetable"
              icon="🗓️"
              title="View Timetable"
              description="View the department timetable"
            />

          </div>

        </section>

        {/* ==========================================
            ASSIGNED COURSES
        ========================================== */}

        <section className="mt-10">

          <SectionHeader
            eyebrow="Teaching"
            title="My Assigned Courses"
            description="Courses currently assigned to you."
            icon="📘"
          />

          {courses.length === 0 ? (

            <EmptyState
              icon="📘"
              title="No courses assigned"
              description="No courses have been assigned to you yet."
            />

          ) : (

            <div className="grid md:grid-cols-2 gap-5">

              {courses.map(
                (course, index) => (

                  <div
                    key={course.id}
                    className="group bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    style={{
                      animation: `fadeUp 0.5s ease-out ${
                        index * 80
                      }ms both`,
                    }}
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <div className="inline-flex items-center gap-2">

                          <span className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-xl">
                            📘
                          </span>

                          <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                            Course
                          </span>

                        </div>

                        <h3 className="font-extrabold text-blue-900 dark:text-blue-400 text-xl mt-4">
                          {course.course_code}
                        </h3>

                        <p className="text-gray-800 dark:text-gray-200 mt-1 font-medium">
                          {course.course_title}
                        </p>

                      </div>

                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-6">

                      <CourseInfo
                        label="Unit"
                        value={
                          course.unit || "—"
                        }
                      />

                      <CourseInfo
                        label="Level"
                        value={
                          course.level || "—"
                        }
                      />

                      <CourseInfo
                        label="Semester"
                        value={
                          course.semester || "—"
                        }
                      />

                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-800">

                      <Link
                        to={`/course-quiz/${course.course_code}`}
                        className="inline-flex items-center justify-center w-full bg-blue-900 dark:bg-blue-700 hover:bg-blue-800 dark:hover:bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 group-hover:shadow-lg"
                      >
                        View Course
                        <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </Link>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* ==========================================
            QUICK SUMMARY
        ========================================== */}

        <section className="mt-10">

          <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl overflow-hidden relative">

            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/5" />

            <div className="absolute -left-20 -bottom-20 w-56 h-56 rounded-full bg-white/5" />

            <div className="relative">

              <div className="flex items-center gap-3">

                <span className="text-3xl">
                  🚀
                </span>

                <div>

                  <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider">
                    QS Nexus
                  </p>

                  <h2 className="text-2xl font-bold">
                    Keep your students engaged
                  </h2>

                </div>

              </div>

              <p className="text-blue-100 mt-4 max-w-2xl">
                Create assignments, provide learning
                resources, communicate important
                information and keep track of student
                submissions from your lecturer workspace.
              </p>

              <div className="flex flex-wrap gap-3 mt-6">

                <Link
                  to="/create-assignment"
                  className="bg-white text-blue-900 hover:bg-blue-50 px-5 py-3 rounded-xl font-bold transition-all duration-300 hover:-translate-y-0.5"
                >
                  📝 Create Assignment
                </Link>

                <Link
                  to="/grade-submissions"
                  className="bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-3 rounded-xl font-bold transition-all duration-300"
                >
                  🎯 Grade Submissions
                </Link>

              </div>

            </div>

          </div>

        </section>

      </main>

      {/* ==========================================
          ANIMATION STYLES
      ========================================== */}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

    </div>
  )
}

// ==========================================
// STAT CARD
// ==========================================

function StatCard({
  icon,
  title,
  value,
  delay,
}) {
  return (
    <div
      className="group bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      style={{
        animation: `fadeUp 0.5s ease-out ${delay} both`,
      }}
    >

      <div className="flex items-center justify-between">

        <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>

        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
          QS
        </span>

      </div>

      <p className="text-gray-500 dark:text-gray-400 text-sm mt-5">
        {title}
      </p>

      <h2 className="text-3xl font-extrabold text-blue-900 dark:text-blue-400 mt-1">
        {value}
      </h2>

    </div>
  )
}

// ==========================================
// ACTION CARD
// ==========================================

function ActionCard({
  to,
  icon,
  title,
  description,
  featured,
}) {
  return (
    <Link
      to={to}
      className={`group relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        featured
          ? "bg-blue-900 dark:bg-blue-800 border-blue-800 dark:border-blue-700 text-white shadow-lg"
          : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800"
      }`}
    >

      {featured && (
        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-950 text-[10px] font-extrabold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
          Important
        </div>
      )}

      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110 ${
          featured
            ? "bg-white/10"
            : "bg-blue-50 dark:bg-blue-900/30"
        }`}
      >
        {icon}
      </div>

      <h3
        className={`font-bold text-lg mt-5 ${
          featured
            ? "text-white"
            : "text-blue-900 dark:text-blue-400"
        }`}
      >
        {title}
      </h3>

      <p
        className={`text-sm mt-2 leading-relaxed ${
          featured
            ? "text-blue-100"
            : "text-gray-500 dark:text-gray-400"
        }`}
      >
        {description}
      </p>

      <div
        className={`mt-5 font-semibold text-sm flex items-center ${
          featured
            ? "text-white"
            : "text-blue-700 dark:text-blue-400"
        }`}
      >
        Open tool
        <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </div>

    </Link>
  )
}

// ==========================================
// SECTION HEADER
// ==========================================

function SectionHeader({
  eyebrow,
  title,
  description,
  icon,
}) {
  return (
    <div className="mb-5">

      <div className="flex items-center gap-3">

        <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-xl">
          {icon}
        </div>

        <div>

          <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
            {eyebrow}
          </p>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>

        </div>

      </div>

      <p className="text-gray-500 dark:text-gray-400 mt-2 ml-14">
        {description}
      </p>

    </div>
  )
}

// ==========================================
// COURSE INFO
// ==========================================

function CourseInfo({
  label,
  value,
}) {
  return (
    <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3">

      <p className="text-xs text-gray-400 dark:text-gray-500">
        {label}
      </p>

      <p className="font-bold text-gray-800 dark:text-gray-200 mt-1 truncate">
        {value}
      </p>

    </div>
  )
}

// ==========================================
// EMPTY STATE
// ==========================================

function EmptyState({
  icon,
  title,
  description,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-10 text-center shadow-sm">

      <div className="text-5xl">
        {icon}
      </div>

      <h3 className="text-xl font-bold text-gray-800 dark:text-white mt-4">
        {title}
      </h3>

      <p className="text-gray-500 dark:text-gray-400 mt-2">
        {description}
      </p>

    </div>
  )
}

export default LecturerDashboard