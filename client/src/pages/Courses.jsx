import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import courseService from "../services/courseService"

function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadCourses() {
      try {
        setCourses(await courseService.getCourses())
      } catch (loadError) {
        console.error("COURSES ERROR:", loadError)
        setError("Unable to load courses. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [])

  return (
    <div className="min-h-screen qs-page p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
      <p className="text-sm font-semibold uppercase tracking-wide text-yellow-600">QS Nexus / Academics</p>
      <h1 className="text-4xl md:text-5xl font-bold text-blue-900 dark:text-blue-300 mt-2 mb-4">
        Courses
      </h1>

      <p className="text-gray-600 mb-10">
        Browse Quantity Surveying courses and open their academic materials.
      </p>

      <div className="mb-8">
        <Link
          to="/library"
          className="qs-button inline-block bg-yellow-500 text-white px-5 py-3 font-semibold"
        >
          View QS Nexus Library
        </Link>
      </div>

      {loading && <p>Loading courses...</p>}
      {error && <p className="text-red-700">{error}</p>}
      {!loading && !error && courses.length === 0 && (
        <p className="text-gray-600">No courses are currently available.</p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 qs-stagger">
        {courses.map((course) => (
          <div
            key={course.id}
            className="qs-card p-6 text-center"
          >
            <h2 className="text-xl font-bold text-blue-900">
              {course.course_code}
            </h2>

            <p className="mt-2 text-gray-600">{course.course_title}</p>
            <p className="mt-1 text-sm text-gray-500">
              {course.level} {course.unit ? `• ${course.unit} units` : ""}
            </p>

            <Link
              to={`/course/${encodeURIComponent(course.course_code)}`}
              className="qs-button mt-4 inline-block bg-blue-900 text-white px-4 py-2"
            >
              Open Course
            </Link>
          </div>
        ))}
      </div>
      </div>
    </div>
  )
}

export default Courses