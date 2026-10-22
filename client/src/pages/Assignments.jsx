import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

function Assignments() {
  const navigate = useNavigate()

  const [assignments, setAssignments] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [courseFilter, setCourseFilter] = useState("all")

  useEffect(() => {
    loadAssignments()
  }, [])

  async function loadAssignments() {
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
        setError("You must be logged in to view assignments.")
        return
      }

      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("level, department")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) {
        throw profileError
      }

      if (!profileData) {
        setError("Your student profile could not be found.")
        return
      }

      setProfile(profileData)

      const {
        data,
        error: assignmentError,
      } = await supabase
        .from("assignments")
        .select("*")
        .eq("level", profileData.level)
        .order("created_at", {
          ascending: false,
        })

      if (assignmentError) {
        throw assignmentError
      }

      setAssignments(data || [])
    } catch (err) {
      console.error("ASSIGNMENTS ERROR:", err)

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load assignments."
      )
    } finally {
      setLoading(false)
    }
  }

  const courses = useMemo(() => {
    const uniqueCourses = [
      ...new Set(
        assignments
          .map((assignment) => assignment.course_code)
          .filter(Boolean)
      ),
    ]

    return uniqueCourses.sort()
  }, [assignments])

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const searchText = search.toLowerCase().trim()

      const matchesSearch =
        !searchText ||
        String(assignment.title || "")
          .toLowerCase()
          .includes(searchText) ||
        String(assignment.description || "")
          .toLowerCase()
          .includes(searchText) ||
        String(assignment.course_code || "")
          .toLowerCase()
          .includes(searchText)

      const matchesCourse =
        courseFilter === "all" ||
        assignment.course_code === courseFilter

      return matchesSearch && matchesCourse
    })
  }, [
    assignments,
    search,
    courseFilter,
  ])

  function formatDate(date) {
    if (!date) return "Unknown date"

    return new Date(date).toLocaleDateString(
      "en-NG",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    )
  }

  function formatDateTime(date) {
    if (!date) return ""

    return new Date(date).toLocaleString(
      "en-NG",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-5">
            📝
          </div>

          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
            Loading Assignments...
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Finding assignments for your level.
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
            Assignment Error
          </h1>

          <p className="mt-4 text-gray-600 dark:text-gray-300 break-words">
            {error}
          </p>

          <button
            onClick={loadAssignments}
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
        <div className="max-w-7xl mx-auto px-6 py-7">
          <button
            onClick={() =>
              navigate("/student-dashboard")
            }
            className="text-blue-100 hover:text-white mb-5 font-medium"
          >
            ← Back to Dashboard
          </button>

          <div className="flex items-center gap-4">
            <div className="text-5xl">
              📝
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                Assignments
              </h1>

              <p className="text-blue-100 mt-1">
                View assignments and course tasks for your level.
              </p>

              {profile && (
                <p className="text-blue-200 text-sm mt-2">
                  {profile.level} •{" "}
                  {profile.department}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* STATS */}

        <div className="grid sm:grid-cols-3 gap-5 mb-8">
          <AssignmentStat
            icon="📝"
            title="Total Assignments"
            value={assignments.length}
          />

          <AssignmentStat
            icon="📚"
            title="Courses"
            value={courses.length}
          />

          <AssignmentStat
            icon="📅"
            title="Latest"
            value={
              assignments.length > 0
                ? formatDate(
                    assignments[0].created_at
                  )
                : "None"
            }
          />
        </div>

        {/* FILTERS */}

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-5 mb-7">
          <div className="grid md:grid-cols-2 gap-4">
            {/* SEARCH */}

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2">
                🔎
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search assignments..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* COURSE FILTER */}

            <select
              value={courseFilter}
              onChange={(event) =>
                setCourseFilter(
                  event.target.value
                )
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">
                All Courses
              </option>

              {courses.map((course) => (
                <option
                  key={course}
                  value={course}
                >
                  {course}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* RESULT COUNT */}

        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
              Available Assignments
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Showing{" "}
              {filteredAssignments.length}{" "}
              of {assignments.length} assignments
            </p>
          </div>

          {(search ||
            courseFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("")
                setCourseFilter("all")
              }}
              className="text-blue-700 dark:text-blue-400 font-semibold hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* ASSIGNMENTS */}

        {filteredAssignments.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-10 text-center">
            <div className="text-6xl mb-5">
              📭
            </div>

            <h2 className="text-2xl font-bold">
              No Assignments Found
            </h2>

            <p className="mt-3 text-gray-500 dark:text-gray-400">
              {assignments.length === 0
                ? "No assignments have been uploaded for your level yet."
                : "No assignments match your current search or course filter."}
            </p>

            {(search ||
              courseFilter !== "all") && (
              <button
                onClick={() => {
                  setSearch("")
                  setCourseFilter("all")
                }}
                className="mt-5 bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {filteredAssignments.map(
              (assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  formatDate={formatDate}
                  formatDateTime={formatDateTime}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function AssignmentCard({
  assignment,
  formatDate,
  formatDateTime,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow hover:shadow-xl transition overflow-hidden">
      <div className="h-2 bg-orange-500" />

      <div className="p-6">
        {/* COURSE + TYPE */}

        <div className="flex flex-wrap items-center gap-2">
          {assignment.course_code && (
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold">
              {assignment.course_code}
            </span>
          )}

          <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-xs font-bold">
            📝 Assignment
          </span>
        </div>

        {/* TITLE */}

        <h3 className="text-xl font-bold text-blue-900 dark:text-blue-400 mt-4">
          {assignment.title}
        </h3>

        {/* DESCRIPTION */}

        {assignment.description && (
          <p className="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed">
            {assignment.description}
          </p>
        )}

        {/* INFORMATION */}

        <div className="mt-5 space-y-2 text-sm text-gray-500 dark:text-gray-400">
          <p>
            📅 Added:{" "}
            {formatDate(
              assignment.created_at
            )}
          </p>

          <p>
            🕒 Uploaded:{" "}
            {formatDateTime(
              assignment.created_at
            )}
          </p>
        </div>

        <Link
          to={`/submit-assignment/${assignment.id}`}
          className="block mt-6 text-center bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold transition"
        >
          📄 View Assignment
        </Link>
      </div>
    </div>
  )
}

function AssignmentStat({
  icon,
  title,
  value,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-5">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 dark:text-gray-400">
          {title}
        </p>

        <span className="text-3xl">
          {icon}
        </span>
      </div>

      <p className="text-2xl font-bold text-blue-900 dark:text-blue-400 mt-3">
        {value}
      </p>
    </div>
  )
}

export default Assignments