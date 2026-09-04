import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

function ManageLecturers() {
  const [lecturers, setLecturers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")

  useEffect(() => {
    getLecturers()
  }, [])

  async function getLecturers(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "lecturer")
      .order("full_name", { ascending: true })

    if (error) {
      alert(error.message)
      setLoading(false)
      setRefreshing(false)
      return
    }

    setLecturers(data || [])
    setLoading(false)
    setRefreshing(false)
  }

  const departments = [
    ...new Set(
      lecturers
        .map((lecturer) => lecturer.department)
        .filter(Boolean)
    ),
  ]

  const filteredLecturers = lecturers.filter((lecturer) => {
    const searchText = search.toLowerCase()

    const matchesSearch =
      lecturer.full_name
        ?.toLowerCase()
        .includes(searchText) ||
      lecturer.email
        ?.toLowerCase()
        .includes(searchText) ||
      lecturer.department
        ?.toLowerCase()
        .includes(searchText)

    const matchesDepartment =
      departmentFilter === "all" ||
      lecturer.department === departmentFilter

    return matchesSearch && matchesDepartment
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">

          <div className="h-10 w-72 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mb-8" />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-8">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-28 bg-white dark:bg-gray-900 rounded-2xl shadow animate-pulse"
              />
            ))}
          </div>

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
      <header className="bg-gradient-to-r from-purple-950 via-blue-900 to-indigo-900 text-white shadow-xl">

        <div className="max-w-7xl mx-auto px-6 md:px-8 py-7">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-3xl shadow-lg">
                👨‍🏫
              </div>

              <div>

                <p className="text-purple-200 text-sm font-medium">
                  QS NEXUS
                </p>

                <h1 className="text-2xl md:text-3xl font-bold">
                  Manage Lecturers
                </h1>

                <p className="text-blue-100 text-sm mt-1">
                  Department lecturer administration
                </p>

              </div>

            </div>

            <button
              onClick={() => getLecturers(true)}
              disabled={refreshing}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition flex items-center justify-center gap-2 font-medium disabled:opacity-60"
            >
              <span className={refreshing ? "animate-spin" : ""}>
                🔄
              </span>

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

          </div>

        </div>

      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-8 py-8">

        {/* INTRO */}
        <div className="fade-up mb-8">

          <h2 className="text-2xl md:text-3xl font-bold">
            Lecturer Directory
          </h2>

          <p className="text-gray-500 dark:text-gray-400 mt-2">
            View and search registered lecturers in the department.
          </p>

        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-8">

          <InfoCard
            icon="👨‍🏫"
            title="Total Lecturers"
            value={lecturers.length}
            description="Registered lecturers"
          />

          <InfoCard
            icon="🔎"
            title="Showing"
            value={filteredLecturers.length}
            description="Matching lecturers"
          />

          <InfoCard
            icon="🏢"
            title="Departments"
            value={departments.length}
            description="Active departments"
          />

        </div>

        {/* SEARCH + FILTER */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 mb-8">

          <div className="grid md:grid-cols-[1fr_250px] gap-4">

            <div className="relative">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                🔎
              </span>

              <input
                type="text"
                placeholder="Search by name, email or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
              />

            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            >

              <option value="all">
                All Departments
              </option>

              {departments.map((department) => (
                <option
                  key={department}
                  value={department}
                >
                  {department}
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
                Registered Lecturers
              </h3>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {filteredLecturers.length} lecturer
                {filteredLecturers.length !== 1 ? "s" : ""} found
              </p>

            </div>

            <div className="px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-sm font-semibold">
              Lecturers
            </div>

          </div>

          {filteredLecturers.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50 dark:bg-gray-800/70">

                  <tr>

                    <th className="p-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Lecturer
                    </th>

                    <th className="p-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Email
                    </th>

                    <th className="p-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Department
                    </th>

                    <th className="p-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Role
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredLecturers.map((lecturer) => (
                    <tr
                      key={lecturer.id}
                      className="border-t border-gray-100 dark:border-gray-800 hover:bg-purple-50/50 dark:hover:bg-gray-800/50 transition"
                    >

                      <td className="p-4">

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center font-bold">
                            {lecturer.full_name
                              ? lecturer.full_name
                                  .charAt(0)
                                  .toUpperCase()
                              : "L"}
                          </div>

                          <div>

                            <p className="font-semibold">
                              {lecturer.full_name || "No name"}
                            </p>

                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Lecturer
                            </p>

                          </div>

                        </div>

                      </td>

                      <td className="p-4 text-gray-600 dark:text-gray-300">
                        {lecturer.email || "No email"}
                      </td>

                      <td className="p-4 text-gray-600 dark:text-gray-300">
                        {lecturer.department || "Not specified"}
                      </td>

                      <td className="p-4">

                        <span className="inline-flex px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-sm font-semibold">
                          Lecturer
                        </span>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden space-y-4">

          <div>

            <h3 className="font-bold text-lg">
              Registered Lecturers
            </h3>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredLecturers.length} found
            </p>

          </div>

          {filteredLecturers.length === 0 ? (
            <EmptyState />
          ) : (
            filteredLecturers.map((lecturer) => (
              <div
                key={lecturer.id}
                className="fade-up bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5"
              >

                <div className="flex items-center gap-4">

                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center font-bold text-lg">
                    {lecturer.full_name
                      ? lecturer.full_name
                          .charAt(0)
                          .toUpperCase()
                      : "L"}
                  </div>

                  <div className="min-w-0">

                    <h3 className="font-bold truncate">
                      {lecturer.full_name || "No name"}
                    </h3>

                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {lecturer.email || "No email"}
                    </p>

                  </div>

                </div>

                <div className="mt-5">

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Department
                    </p>

                    <p className="font-semibold text-sm mt-1">
                      {lecturer.department || "Not specified"}
                    </p>

                  </div>

                </div>

                <div className="mt-4">

                  <span className="inline-flex px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-sm font-semibold">
                    Lecturer
                  </span>

                </div>

              </div>
            ))
          )}

        </div>

        {/* FOOTER */}
        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">

          <p className="text-sm text-gray-500 dark:text-gray-400">
            QS Nexus • Lecturer Management
          </p>

        </div>

      </main>

    </div>
  )
}

function InfoCard({
  icon,
  title,
  value,
  description,
}) {
  return (
    <div className="fade-up bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">

      <div className="flex items-center justify-between">

        <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-xl">
          {icon}
        </div>

        <span className="text-3xl font-bold text-purple-900 dark:text-purple-400">
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
    <div className="p-12 text-center">

      <div className="text-5xl mb-4">
        👨‍🏫
      </div>

      <h3 className="text-xl font-bold">
        No lecturers found
      </h3>

      <p className="text-gray-500 dark:text-gray-400 mt-2">
        Try changing your search or department filter.
      </p>

    </div>
  )
}

export default ManageLecturers