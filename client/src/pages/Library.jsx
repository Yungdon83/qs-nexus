import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { openResourceFile } from "../utils/resourceStorage"
import { useAuth } from "../contexts/AuthContext"

const materialTypes = [
  "Lecture Slides",
  "Past Questions",
  "Lecture Notes",
  "Textbooks",
  "Handouts",
  "Study Materials",
  "Revision Materials",
  "Assignments",
  "Other Resources",
]

const levels = ["100L", "200L", "300L", "400L", "500L", "All Levels"]

function Library() {
  const { profile } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [materials, setMaterials] = useState([])
  const [courses, setCourses] = useState([])
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    level: searchParams.get("level") || "all",
    type: searchParams.get("type") || "all",
    semester: searchParams.get("semester") || "all",
    course: searchParams.get("course") || "all",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function handleOpenResource(fileUrl) {
    try {
      await openResourceFile(fileUrl)
    } catch (openError) {
      console.error("LIBRARY FILE ERROR:", openError)
      window.alert("This file is currently unavailable. Please try again later.")
    }
  }

  useEffect(() => {
    async function loadLibrary() {
      setLoading(true)
      setError("")

      try {
        let materialsQuery = supabase
          .from("resources")
          .select("*")
          .order("created_at", { ascending: false })
          .range(0, 99)

        if (filters.type !== "all") {
          materialsQuery = materialsQuery.eq("resource_type", filters.type)
        }

        if (filters.course !== "all") {
          materialsQuery = materialsQuery.eq("course_code", filters.course)
        }

        if (filters.search.trim()) {
          const searchText = filters.search.trim()
          materialsQuery = materialsQuery.or(
            `title.ilike.%${searchText}%,description.ilike.%${searchText}%,course_code.ilike.%${searchText}%`
          )
        }

        const [materialsResult, coursesResult] = await Promise.all([
          materialsQuery,
          supabase
            .from("courses")
            .select("id, course_code, course_title, level")
            .order("course_code"),
        ])

        if (materialsResult.error) throw materialsResult.error
        if (coursesResult.error) throw coursesResult.error

        setMaterials(materialsResult.data || [])
        setCourses(coursesResult.data || [])
      } catch (loadError) {
        console.error("LIBRARY ERROR:", loadError)
        setError("Unable to load this content. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadLibrary()
  }, [filters])

  const courseMap = useMemo(
    () => new Map(courses.map((course) => [course.course_code, course])),
    [courses]
  )

  const visibleMaterials = useMemo(() => {
    return materials.filter((material) => {
      const matchesLevel = filters.level === "all" || material.level === filters.level || material.level === "All Levels"
      const matchesSemester = filters.semester === "all" || !material.semester || material.semester === filters.semester
      return matchesLevel && matchesSemester
    })
  }, [filters.level, filters.semester, materials])

  function clearFilters() {
    const clearedFilters = {
      search: "",
      level: "all",
      type: "all",
      semester: "all",
      course: "all",
    }
    setFilters(clearedFilters)
    setSearchParams(new URLSearchParams())
  }

  function updateFilter(name, value) {
    const nextFilters = { ...filters, [name]: value }
    setFilters(nextFilters)

    const nextParams = Object.entries(nextFilters).reduce(
      (params, [key, filterValue]) => {
        if (filterValue && filterValue !== "all") params.set(key, filterValue)
        return params
      },
      new URLSearchParams()
    )
    setSearchParams(nextParams)
  }

  function formatDate(date) {
    if (!date) return ""
    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <main className="min-h-screen qs-page bg-gray-100 dark:bg-slate-950 text-gray-800 dark:text-gray-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-yellow-600">QS Nexus</p>
            <h1 className="text-4xl font-bold text-blue-900 dark:text-blue-300 mt-1">Library</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Find lecture materials, past questions, notes, and study resources.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/courses" className="qs-button border border-blue-900 text-blue-900 dark:border-blue-300 dark:text-blue-300 px-4 py-2">Courses</Link>
            {(profile?.role === "lecturer" || profile?.role === "admin") && <Link to="/upload-resource" className="qs-button bg-blue-900 text-white px-4 py-2">Add Material</Link>}
          </div>
        </div>

        <section className="qs-card p-5 mb-8">
          <details className="qs-filter-details" open>
            <summary className="md:hidden cursor-pointer list-none rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3 font-semibold">
              Search and filter materials
            </summary>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-4 md:mt-0">
            <input
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Search materials"
              className="qs-input border rounded-lg p-3 bg-transparent lg:col-span-2"
              aria-label="Search library materials"
            />
            <select value={filters.level} onChange={(event) => updateFilter("level", event.target.value)} className="qs-input border rounded-lg p-3 bg-transparent" aria-label="Filter by level">
              <option value="all">All Levels</option>
              {levels.map((level) => <option key={level} value={level}>{level}</option>)}
            </select>
            <select value={filters.type} onChange={(event) => updateFilter("type", event.target.value)} className="qs-input border rounded-lg p-3 bg-transparent" aria-label="Filter by material type">
              <option value="all">All Types</option>
              {materialTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
            <select value={filters.course} onChange={(event) => updateFilter("course", event.target.value)} className="qs-input border rounded-lg p-3 bg-transparent" aria-label="Filter by course">
              <option value="all">All Courses</option>
              {courses.map((course) => <option key={course.id} value={course.course_code}>{course.course_code}</option>)}
            </select>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm font-semibold mr-2 self-center">Semester:</span>
            {["all", "First Semester", "Second Semester"].map((semester) => (
              <button key={semester} type="button" onClick={() => updateFilter("semester", semester)} className={`px-3 py-2 rounded-lg text-sm ${filters.semester === semester ? "bg-blue-900 text-white" : "bg-gray-100 dark:bg-slate-800"}`}>
                {semester === "all" ? "All" : semester}
              </button>
            ))}
            <button type="button" onClick={clearFilters} className="px-3 py-2 rounded-lg text-sm border border-gray-300 dark:border-slate-700">Clear filters</button>
            </div>
          </details>
        </section>

        {loading && <p>Loading library materials...</p>}
        {error && <p className="text-red-700 dark:text-red-300">{error}</p>}
        {!loading && !error && visibleMaterials.length === 0 && <p className="text-gray-600 dark:text-gray-400">No materials found.</p>}

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {visibleMaterials.map((material) => {
            const course = courseMap.get(material.course_code)
            return (
              <article key={material.id} className="qs-card p-6 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-bold text-blue-900 dark:text-blue-300">{material.title}</h2>
                  <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200 px-2 py-1 rounded whitespace-nowrap">{material.resource_type || "Resource"}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">{material.course_code || "General resource"}{course?.course_title ? ` - ${course.course_title}` : ""}</p>
                <p className="text-sm text-gray-500 mt-1">{material.level || "All Levels"}{material.semester ? ` • ${material.semester}` : ""}</p>
                <p className="text-gray-700 dark:text-gray-300 mt-4 flex-1">{material.description || "No description available."}</p>
                <div className="flex items-center justify-between gap-3 mt-6 text-xs text-gray-500">
                  <span>Added {formatDate(material.created_at)}</span>
                  {material.file_url ? <button type="button" onClick={() => handleOpenResource(material.file_url)} className="qs-button bg-blue-900 text-white px-4 py-2 text-sm">Open</button> : <span className="text-red-600">File unavailable</span>}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </main>
  )
}

export default Library
