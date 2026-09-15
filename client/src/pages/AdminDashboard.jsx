import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import LogoutButton from "../components/LogoutButton"

function AdminDashboard() {
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    students: 0,
    lecturers: 0,
    courses: 0,
    resources: 0,
    announcements: 0,
    events: 0,
  })

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    const [
      studentsResult,
      lecturersResult,
      coursesResult,
      resourcesResult,
      announcementsResult,
      eventsResult,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "student"),

      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "lecturer"),

      supabase
        .from("courses")
        .select("*", { count: "exact", head: true }),

      supabase
        .from("resources")
        .select("*", { count: "exact", head: true }),

      supabase
        .from("announcements")
        .select("*", { count: "exact", head: true }),

      supabase
        .from("events")
        .select("*", { count: "exact", head: true }),
    ])

    setStats({
      students: studentsResult.count || 0,
      lecturers: lecturersResult.count || 0,
      courses: coursesResult.count || 0,
      resources: resourcesResult.count || 0,
      announcements: announcementsResult.count || 0,
      events: eventsResult.count || 0,
    })

    setLoading(false)
    setRefreshing(false)
  }

  const statCards = [
    {
      title: "Students",
      value: stats.students,
      icon: "🎓",
      description: "Registered students",
      color: "from-blue-600 to-blue-800",
    },
    {
      title: "Lecturers",
      value: stats.lecturers,
      icon: "👨🏾‍🏫",
      description: "Department lecturers",
      color: "from-purple-600 to-purple-800",
    },
    {
      title: "Courses",
      value: stats.courses,
      icon: "📚",
      description: "Department courses",
      color: "from-emerald-600 to-emerald-800",
    },
    {
      title: "Resources",
      value: stats.resources,
      icon: "📂",
      description: "Learning materials",
      color: "from-orange-500 to-orange-700",
    },
    {
      title: "Announcements",
      value: stats.announcements,
      icon: "📢",
      description: "Department notices",
      color: "from-pink-600 to-pink-800",
    },
    {
      title: "Events",
      value: stats.events,
      icon: "📅",
      description: "Department activities",
      color: "from-cyan-600 to-cyan-800",
    },
  ]

  const actionCards = [
    {
      title: "Create Lecturer",
      icon: "👨🏾‍🏫",
      description: "Create an official lecturer account.",
      route: "/create-lecturer",
    },
    {
      title: "Manage Students",
      icon: "🎓",
      description: "View and manage student accounts.",
      route: "/manage-students",
    },
    {
      title: "Manage Lecturers",
      icon: "🧑🏾‍💼",
      description: "Manage lecturer accounts and profiles.",
      route: "/manage-lecturers",
    },
    {
      title: "Manage Courses",
      icon: "📚",
      description: "Add, edit and manage courses.",
      route: "/manage-courses",
    },
    {
      title: "Manage Timetable",
      icon: "🗓️",
      description: "Create and manage the department timetable.",
      route: "/manage-timetable",
    },
    {
      title: "Manage Resources",
      icon: "📂",
      description: "Control uploaded learning materials.",
      route: "/admin-resources",
    },
    {
      title: "Manage Announcements",
      icon: "📢",
      description: "Manage department announcements.",
      route: "/admin-announcements",
    },
    {
      title: "Manage Events",
      icon: "🎉",
      description: "Manage seminars and department activities.",
      route: "/admin-events",
    },
  ]

  return (
    <div className="min-h-screen qs-page bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-5px);
            }
          }

          .fade-in {
            animation: fadeIn 0.7s ease-out;
          }

          .fade-up {
            animation: fadeUp 0.7s ease-out;
          }

          .float-animation {
            animation: float 3s ease-in-out infinite;
          }
        `}
      </style>

      {/* HEADER */}
      <header className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center text-3xl shadow-lg float-animation">
                🏛️
              </div>

              <div>
                <p className="text-blue-200 text-sm font-medium">
                  QS NEXUS
                </p>

                <h1 className="text-2xl md:text-3xl font-bold">
                  HOD Dashboard
                </h1>

                <p className="text-blue-100 mt-1 text-sm md:text-base">
                  Department Administration Portal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => loadStats(true)}
                disabled={refreshing}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition flex items-center gap-2 font-medium disabled:opacity-60"
              >
                <span className={refreshing ? "animate-spin" : ""}>
                  🔄
                </span>

                {refreshing ? "Refreshing..." : "Refresh"}
              </button>

              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 md:px-8 py-8">

        {/* WELCOME BANNER */}
        <section className="fade-in mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-700 text-white p-7 md:p-9 shadow-xl">
            <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10" />
            <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-white/5" />

            <div className="relative z-10 max-w-3xl">
              <p className="text-blue-200 font-medium mb-2">
                Welcome back, HOD 👋🏾
              </p>

              <h2 className="text-3xl md:text-4xl font-bold">
                Department Overview
              </h2>

              <p className="mt-3 text-blue-100 leading-relaxed">
                Manage students, lecturers, courses, resources,
                announcements, events and other departmental activities
                from one central portal.
              </p>
            </div>
          </div>
        </section>

        {/* STATISTICS */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Department Statistics
              </h2>

              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Current overview of QS Nexus
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 qs-stagger">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="h-36 bg-white dark:bg-gray-900 rounded-2xl shadow animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {statCards.map((stat, index) => (
                <StatCard
                  key={stat.title}
                  {...stat}
                  delay={index}
                />
              ))}
            </div>
          )}
        </section>

        {/* QUICK ACTIONS */}
        <section className="mb-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Quick Actions
            </h2>

            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Frequently used administrative tools
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {actionCards.map((action, index) => (
              <ActionCard
                key={action.title}
                {...action}
                delay={index}
              />
            ))}
          </div>
        </section>

        {/* MANAGEMENT */}
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Management
            </h2>

            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Access all major department management areas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            <DashboardCard
              icon="🎓"
              title="Students"
              text="View and manage department students."
              link="/manage-students"
            />

            <DashboardCard
              icon="👨🏾‍🏫"
              title="Lecturers"
              text="Manage lecturer accounts and profiles."
              link="/manage-lecturers"
            />

            <DashboardCard
              icon="📚"
              title="Courses"
              text="Add and update department courses."
              link="/manage-courses"
            />

            <DashboardCard
              icon="🗓️"
              title="Timetable"
              text="Create and manage the department timetable."
              link="/manage-timetable"
            />

            <DashboardCard
              icon="📂"
              title="Resources"
              text="View and control uploaded learning materials."
              link="/admin-resources"
            />

            <DashboardCard
              icon="📢"
              title="Announcements"
              text="Control department notices and announcements."
              link="/admin-announcements"
            />

            <DashboardCard
              icon="🎉"
              title="Events"
              text="Manage seminars and departmental activities."
              link="/admin-events"
            />

            <DashboardCard
              icon="👤"
              title="Create Lecturer"
              text="Create official lecturer accounts for the department."
              link="/create-lecturer"
            />
          </div>
        </section>

        {/* FOOTER */}
        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            QS Nexus • Quantity Surveying Department
          </p>

          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Department Administration Portal
          </p>
        </div>
      </main>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  description,
  color,
  delay,
}) {
  return (
    <div
      className="fade-up group bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        animationDelay: `${delay * 70}ms`,
      }}
    >
      <div className={`h-1.5 bg-gradient-to-r ${color}`} />

      <div className="p-5">
        <div className="flex items-center justify-between">
          <div
            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-xl shadow-md`}
          >
            {icon}
          </div>

          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </span>
        </div>

        <h3 className="mt-4 font-bold text-gray-900 dark:text-white">
          {title}
        </h3>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {description}
        </p>
      </div>
    </div>
  )
}

function ActionCard({
  title,
  icon,
  description,
  route,
  delay,
}) {
  return (
    <button
      onClick={() => window.location.href = route}
      className="fade-up group text-left bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      style={{
        animationDelay: `${delay * 70}ms`,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
          {icon}
        </div>

        <span className="text-gray-300 dark:text-gray-600 group-hover:text-blue-600 transition">
          →
        </span>
      </div>

      <h3 className="font-bold text-lg text-gray-900 dark:text-white mt-4">
        {title}
      </h3>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
        {description}
      </p>
    </button>
  )
}

function DashboardCard({
  title,
  text,
  link,
  icon,
}) {
  return (
    <Link
      to={link}
      className="group bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
          {icon}
        </div>

        <span className="text-xl text-gray-300 dark:text-gray-600 group-hover:text-blue-600 group-hover:translate-x-1 transition-all">
          →
        </span>
      </div>

      <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-5">
        {title}
      </h3>

      <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm leading-relaxed">
        {text}
      </p>

      <div className="mt-5 text-sm font-semibold text-blue-700 dark:text-blue-400">
        Open Management →
      </div>
    </Link>
  )
}

export default AdminDashboard