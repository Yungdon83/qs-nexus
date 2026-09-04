import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

function ManageCourses() {
  const [courses, setCourses] = useState([])
  const [lecturers, setLecturers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [savingId, setSavingId] = useState(null)

  const [selectedLecturers, setSelectedLecturers] = useState({})
  const [search, setSearch] = useState("")
  const [levelFilter, setLevelFilter] = useState("all")
  const [lecturerFilter, setLecturerFilter] = useState("all")

  useEffect(() => {
    loadData()
  }, [])

  async function loadData(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    await Promise.all([
      fetchCourses(),
      fetchLecturers(),
    ])

    setLoading(false)
    setRefreshing(false)
  }

  async function fetchCourses() {
    const { data, error } = await supabase
      .from("courses")
      .select(`
        *,
        lecturer:profiles(
          id,
          full_name
        )
      `)
      .order("course_code")

    if (error) {
      alert(error.message)
      return
    }

    setCourses(data || [])
  }

  async function fetchLecturers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "lecturer")
      .order("full_name")

    if (error) {
      alert(error.message)
      return
    }

    setLecturers(data || [])
  }

  function handleLecturerChange(courseId, lecturerId) {
    setSelectedLecturers((prev) => ({
      ...prev,
      [courseId]: lecturerId,
    }))
  }

  async function assignLecturer(courseId) {
    const lecturerId = selectedLecturers[courseId]

    if (!lecturerId) {
      alert("Please select a lecturer")
      return
    }

    setSavingId(courseId)

    const { error } = await supabase
      .from("courses")
      .update({
        lecturer_id: lecturerId,
      })
      .eq("id", courseId)

    if (error) {
      alert(error.message)
      setSavingId(null)
      return
    }

    await fetchCourses()

    setSavingId(null)

    alert("Lecturer assigned successfully")
  }

  const levels = [
    ...new Set(
      courses
        .map((course) => course.level)
        .filter(Boolean)
    ),
  ]

  const assignedCourses = courses.filter(
    (course) => course.lecturer_id
  )

  const unassignedCourses = courses.filter(
    (course) => !course.lecturer_id
  )

  const filteredCourses = courses.filter((course) => {
    const searchText = search.toLowerCase()

    const matchesSearch =
      course.course_code
        ?.toLowerCase()
        .includes(searchText) ||
      course.course_title
        ?.toLowerCase()
        .includes(searchText) ||
      course.level
        ?.toLowerCase()
        .includes(searchText) ||
      course.lecturer?.full_name
        ?.toLowerCase()
        .includes(searchText)

    const matchesLevel =
      levelFilter === "all" ||
      course.level === levelFilter

    const matchesLecturer =
      lecturerFilter === "all" ||
      course.lecturer_id === lecturerFilter

    return (
      matchesSearch &&
      matchesLevel &&
      matchesLecturer
    )
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">

          <div className="h-12 w-72 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse mb-8" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 bg-white dark:bg-gray-900 rounded-2xl shadow animate-pulse"
              />
            ))}
          </div>

          <div className="h-24 bg-white dark:bg-gray-900 rounded-2xl shadow animate-pulse mb-6" />

          <div className="h-96 bg-white dark:bg-gray-900 rounded-2xl shadow animate-pulse" />

        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">

      <style>
        {`
          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(18px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .fade-up {
            animation: fadeUp 0.6s ease-out;
          }
        `}
      </style>

      {/* HEADER */}
      <header className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 text-white shadow-xl">

        <div className="max-w-7xl mx-auto px-6 md:px-8 py-7">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-3xl shadow-lg">
                📚
              </div>

              <div>

                <p className="text-blue-200 text-sm font-medium">
                  QS NEXUS
                </p>

                <h1 className="text-2xl md:text-3xl font-bold">
                  Manage Courses
                </h1>

                <p className="text-blue-100 text-sm mt-1">
                  Manage courses and lecturer assignments
                </p>

              </div>

            </div>

            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition flex items-center justify-center gap-2 font-medium disabled:opacity-60"
            >

              <span className={refreshing ? "animate-spin" : ""}>
                🔄
              </span>

              {refreshing
                ? "Refreshing..."
                : "Refresh"}

            </button>

          </div>

        </div>

      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-8 py-8">

        {/* INTRO */}
        <div className="fade-up mb-8">

          <h2 className="text-2xl md:text-3xl font-bold">
            Course Management
          </h2>

          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Assign lecturers to courses and manage course coverage.
          </p>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">

          <StatCard
            icon="📚"
            title="Total Courses"
            value={courses.length}
            description="Department courses"
          />

          <StatCard
            icon="👨‍🏫"
            title="Assigned"
            value={assignedCourses.length}
            description="Courses with lecturers"
            iconStyle="purple"
          />

          <StatCard
            icon="⚠️"
            title="Unassigned"
            value={unassignedCourses.length}
            description="Need lecturer assignment"
            iconStyle="orange"
          />

          <StatCard
            icon="👥"
            title="Lecturers"
            value={lecturers.length}
            description="Available lecturers"
            iconStyle="green"
          />

        </div>

        {/* SEARCH + FILTERS */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 mb-8">

          <div className="grid md:grid-cols-[1fr_200px_220px] gap-4">

            {/* SEARCH */}
            <div className="relative">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                🔎
              </span>

              <input
                type="text"
                placeholder="Search course or lecturer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
              />

            </div>

            {/* LEVEL FILTER */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            >

              <option value="all">
                All Levels
              </option>

              {levels.map((level) => (
                <option
                  key={level}
                  value={level}
                >
                  {level}
                </option>
              ))}

            </select>

            {/* LECTURER FILTER */}
            <select
              value={lecturerFilter}
              onChange={(e) => setLecturerFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            >

              <option value="all">
                All Lecturers
              </option>

              <option value="">
                Unassigned
              </option>

              {lecturers.map((lecturer) => (
                <option
                  key={lecturer.id}
                  value={lecturer.id}
                >
                  {lecturer.full_name}
                </option>
              ))}

            </select>

          </div>

        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">

          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">

            <div>

              <h3 className="font-bold text-lg">
                Department Courses
              </h3>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Showing {filteredCourses.length} of{" "}
                {courses.length} courses
              </p>

            </div>

            <div className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-sm font-semibold">
              Courses
            </div>

          </div>

          {filteredCourses.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50 dark:bg-gray-800/70">

                  <tr>

                    <th className="p-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Course
                    </th>

                    <th className="p-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Level
                    </th>

                    <th className="p-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Current Lecturer
                    </th>

                    <th className="p-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Assign Lecturer
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredCourses.map((course) => {

                    const selectedLecturer =
                      selectedLecturers[course.id] ??
                      course.lecturer_id ??
                      ""

                    const isSaving =
                      savingId === course.id

                    return (
                      <tr
                        key={course.id}
                        className="border-t border-gray-100 dark:border-gray-800 hover:bg-blue-50/40 dark:hover:bg-gray-800/50 transition"
                      >

                        {/* COURSE */}
                        <td className="p-4">

                          <div className="flex items-center gap-3">

                            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-xl">
                              📖
                            </div>

                            <div>

                              <p className="font-bold text-blue-900 dark:text-blue-300">
                                {course.course_code}
                              </p>

                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {course.course_title || "Untitled Course"}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* LEVEL */}
                        <td className="p-4">

                          <span className="inline-flex px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-sm font-semibold">
                            {course.level || "Not specified"}
                          </span>

                        </td>

                        {/* CURRENT LECTURER */}
                        <td className="p-4">

                          {course.lecturer?.full_name ? (
                            <div className="flex items-center gap-2">

                              <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                                {course.lecturer.full_name
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>

                                <p className="font-semibold">
                                  {course.lecturer.full_name}
                                </p>

                                <p className="text-xs text-green-600 dark:text-green-400">
                                  Assigned
                                </p>

                              </div>

                            </div>
                          ) : (
                            <span className="inline-flex px-3 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 text-sm font-semibold">
                              Not assigned
                            </span>
                          )}

                        </td>

                        {/* ASSIGN */}
                        <td className="p-4">

                          <div className="flex gap-2">

                            <select
                              value={selectedLecturer}
                              onChange={(e) =>
                                handleLecturerChange(
                                  course.id,
                                  e.target.value
                                )
                              }
                              className="min-w-[190px] px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            >

                              <option value="">
                                Select lecturer
                              </option>

                              {lecturers.map((lecturer) => (
                                <option
                                  key={lecturer.id}
                                  value={lecturer.id}
                                >
                                  {lecturer.full_name}
                                </option>
                              ))}

                            </select>

                            <button
                              onClick={() =>
                                assignLecturer(course.id)
                              }
                              disabled={isSaving}
                              className="px-4 py-2.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-medium transition disabled:opacity-60"
                            >

                              {isSaving
                                ? "Saving..."
                                : "Save"}

                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  })}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden space-y-4">

          <div>

            <h3 className="font-bold text-lg">
              Department Courses
            </h3>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredCourses.length} of{" "}
              {courses.length}
            </p>

          </div>

          {filteredCourses.length === 0 ? (
            <EmptyState />
          ) : (
            filteredCourses.map((course) => {

              const selectedLecturer =
                selectedLecturers[course.id] ??
                course.lecturer_id ??
                ""

              const isSaving =
                savingId === course.id

              return (
                <div
                  key={course.id}
                  className="fade-up bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5"
                >

                  {/* COURSE HEADER */}
                  <div className="flex items-center gap-4">

                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-xl">
                      📖
                    </div>

                    <div className="min-w-0">

                      <h3 className="font-bold text-blue-900 dark:text-blue-300">
                        {course.course_code}
                      </h3>

                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {course.course_title || "Untitled Course"}
                      </p>

                    </div>

                  </div>

                  {/* LEVEL */}
                  <div className="mt-4">

                    <span className="inline-flex px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-sm font-semibold">
                      {course.level || "Not specified"}
                    </span>

                  </div>

                  {/* CURRENT LECTURER */}
                  <div className="mt-5 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">

                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Current Lecturer
                    </p>

                    {course.lecturer?.full_name ? (
                      <div className="flex items-center gap-3">

                        <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                          {course.lecturer.full_name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>

                          <p className="font-semibold">
                            {course.lecturer.full_name}
                          </p>

                          <p className="text-xs text-green-600 dark:text-green-400">
                            Assigned
                          </p>

                        </div>

                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                        ⚠️ No lecturer assigned
                      </p>
                    )}

                  </div>

                  {/* ASSIGN LECTURER */}
                  <div className="mt-4">

                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Assign Lecturer
                    </label>

                    <select
                      value={selectedLecturer}
                      onChange={(e) =>
                        handleLecturerChange(
                          course.id,
                          e.target.value
                        )
                      }
                      className="w-full mt-2 px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    >

                      <option value="">
                        Select lecturer
                      </option>

                      {lecturers.map((lecturer) => (
                        <option
                          key={lecturer.id}
                          value={lecturer.id}
                        >
                          {lecturer.full_name}
                        </option>
                      ))}

                    </select>

                    <button
                      onClick={() =>
                        assignLecturer(course.id)
                      }
                      disabled={isSaving}
                      className="w-full mt-3 px-4 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold transition disabled:opacity-60"
                    >

                      {isSaving
                        ? "Saving..."
                        : "Save Lecturer Assignment"}

                    </button>

                  </div>

                </div>
              )
            })
          )}

        </div>

        {/* FOOTER */}
        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">

          <p className="text-sm text-gray-500 dark:text-gray-400">
            QS Nexus • Course Management
          </p>

        </div>

      </main>

    </div>
  )
}

function StatCard({
  icon,
  title,
  value,
  description,
  iconStyle = "blue",
}) {
  const styles = {
    blue: "bg-blue-50 dark:bg-blue-950/50",
    purple: "bg-purple-50 dark:bg-purple-950/50",
    orange: "bg-orange-50 dark:bg-orange-950/50",
    green: "bg-green-50 dark:bg-green-950/50",
  }

  return (
    <div className="fade-up bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">

      <div className="flex items-center justify-between">

        <div
          className={`w-11 h-11 rounded-xl ${styles[iconStyle]} flex items-center justify-center text-xl`}
        >
          {icon}
        </div>

        <span className="text-3xl font-bold text-blue-900 dark:text-blue-400">
          {value}
        </span>

      </div>

      <h3 className="font-bold mt-4">
        {title}
      </h3>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {description}
      </p>

    </div>
  )
}

function EmptyState() {
  return (
    <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-2xl">

      <div className="text-5xl mb-4">
        📚
      </div>

      <h3 className="text-xl font-bold">
        No courses found
      </h3>

      <p className="text-gray-500 dark:text-gray-400 mt-2">
        Try changing your search or filters.
      </p>

    </div>
  )
}

export default ManageCourses