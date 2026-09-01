import { useEffect, useMemo, useState } from "react"
import { supabase } from "../lib/supabase"

function Resources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [activeTab, setActiveTab] = useState("all")
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadResources()
  }, [])

  async function loadResources() {
    setLoading(true)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        throw userError
      }

      if (!user) {
        setLoading(false)
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

      setProfile(profileData)

      if (!profileData) {
        setLoading(false)
        return
      }

      const {
        data: resourceData,
        error: resourceError,
      } = await supabase
        .from("resources")
        .select("*")
        .eq("level", profileData.level)
        .eq("department", profileData.department)
        .order("created_at", {
          ascending: false,
        })

      if (resourceError) {
        throw resourceError
      }

      setResources(resourceData || [])
    } catch (error) {
      console.error("RESOURCES ERROR:", error)
    } finally {
      setLoading(false)
    }
  }

  const assignments = useMemo(() => {
    return resources.filter((resource) => {
      const type = String(
        resource.resources_type || ""
      ).toLowerCase()

      return type.includes("assignment")
    })
  }, [resources])

  const learningResources = useMemo(() => {
    return resources.filter((resource) => {
      const type = String(
        resource.resources_type || ""
      ).toLowerCase()

      return !type.includes("assignment")
    })
  }, [resources])

  const filteredResources = useMemo(() => {
    let list = resources

    if (activeTab === "assignments") {
      list = assignments
    }

    if (activeTab === "resources") {
      list = learningResources
    }

    if (search.trim()) {
      const searchText = search.toLowerCase()

      list = list.filter((resource) => {
        return (
          String(resource.title || "")
            .toLowerCase()
            .includes(searchText) ||
          String(resource.description || "")
            .toLowerCase()
            .includes(searchText) ||
          String(resource.course_code || "")
            .toLowerCase()
            .includes(searchText) ||
          String(resource.resources_type || "")
            .toLowerCase()
            .includes(searchText)
        )
      })
    }

    return list
  }, [
    resources,
    assignments,
    learningResources,
    activeTab,
    search,
  ])

  function formatDate(date) {
    if (!date) return ""

    return new Date(date).toLocaleDateString(
      "en-NG",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    )
  }

  function isAssignment(resource) {
    return String(
      resource.resources_type || ""
    )
      .toLowerCase()
      .includes("assignment")
  }

  function getTypeLabel(resource) {
    if (isAssignment(resource)) {
      return "Assignment"
    }

    return resource.resources_type ||
      "Learning Resource"
  }

  function getTypeStyle(resource) {
    if (isAssignment(resource)) {
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
    }

    return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-5">
            📚
          </div>

          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
            Loading Resources...
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Finding learning materials for your level.
          </p>
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
              window.history.back()
            }
            className="text-blue-100 hover:text-white mb-5 font-medium"
          >
            ← Back
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <div className="flex items-center gap-4">
                <div className="text-5xl">
                  📚
                </div>

                <div>
                  <h1 className="text-3xl font-bold">
                    Resources & Assignments
                  </h1>

                  <p className="text-blue-100 mt-1">
                    Access your course materials and assignments.
                  </p>
                </div>
              </div>

              {profile && (
                <p className="mt-4 text-blue-100">
                  {profile.level} •{" "}
                  {profile.department}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* STAT CARDS */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <StatCard
            icon="📚"
            title="All Materials"
            value={resources.length}
          />

          <StatCard
            icon="📝"
            title="Assignments"
            value={assignments.length}
          />

          <StatCard
            icon="📖"
            title="Learning Resources"
            value={learningResources.length}
          />
        </div>

        {/* SEARCH */}

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-5 mb-6">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              🔎
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search resources, assignments or courses..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* TABS */}

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-3 mb-6">
          <div className="grid grid-cols-3 gap-2">
            <TabButton
              active={activeTab === "all"}
              onClick={() => setActiveTab("all")}
              icon="📂"
              label="All"
            />

            <TabButton
              active={
                activeTab === "resources"
              }
              onClick={() =>
                setActiveTab("resources")
              }
              icon="📖"
              label="Resources"
            />

            <TabButton
              active={
                activeTab === "assignments"
              }
              onClick={() =>
                setActiveTab("assignments")
              }
              icon="📝"
              label="Assignments"
            />
          </div>
        </div>

        {/* CONTENT */}

        {filteredResources.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-10 text-center">
            <div className="text-6xl mb-5">
              📭
            </div>

            <h2 className="text-2xl font-bold">
              No Materials Found
            </h2>

            <p className="mt-3 text-gray-500 dark:text-gray-400">
              {search
                ? "No materials match your search."
                : activeTab === "assignments"
                ? "No assignments are available yet."
                : activeTab === "resources"
                ? "No learning resources are available yet."
                : "No resources are available yet."}
            </p>

            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-5 bg-blue-900 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-semibold"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {filteredResources.map(
              (resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  formatDate={formatDate}
                  getTypeLabel={getTypeLabel}
                  getTypeStyle={getTypeStyle}
                  isAssignment={isAssignment}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ResourceCard({
  resource,
  formatDate,
  getTypeLabel,
  getTypeStyle,
  isAssignment,
}) {
  const assignment =
    isAssignment(resource)

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow hover:shadow-lg transition p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${getTypeStyle(
                resource
              )}`}
            >
              {assignment
                ? "📝 Assignment"
                : "📖 Resource"}
            </span>

            {resource.course_code && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                {resource.course_code}
              </span>
            )}
          </div>

          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400 mt-4">
            {resource.title}
          </h2>

          {resource.description && (
            <p className="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed">
              {resource.description}
            </p>
          )}

          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 text-sm text-gray-500 dark:text-gray-400">
            <span>
              📁 Type:{" "}
              {getTypeLabel(resource)}
            </span>

            {resource.course_code && (
              <span>
                📘 Course:{" "}
                {resource.course_code}
              </span>
            )}

            {resource.created_at && (
              <span>
                📅 Added:{" "}
                {formatDate(
                  resource.created_at
                )}
              </span>
            )}
          </div>
        </div>

        <div className="lg:w-48">
          {resource.file_url ? (
            <a
              href={resource.file_url}
              target="_blank"
              rel="noreferrer"
              className={`block text-center px-5 py-3 rounded-xl text-white font-bold transition ${
                assignment
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-blue-900 hover:bg-blue-800"
              }`}
            >
              {assignment
                ? "📝 Open Assignment"
                : "📖 Open Resource"}
            </a>
          ) : (
            <div className="text-center px-5 py-3 rounded-xl bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400 font-semibold">
              No File Available
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
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

      <p className="text-3xl font-bold text-blue-900 dark:text-blue-400 mt-3">
        {value}
      </p>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}) {
  return (
    <button
      onClick={onClick}
      className={`py-3 px-4 rounded-xl font-bold transition ${
        active
          ? "bg-blue-900 text-white"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
      }`}
    >
      {icon} {label}
    </button>
  )
}

export default Resources