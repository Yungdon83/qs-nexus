import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import courseService from "../services/courseService"


function LevelCourses() {

  const { level } = useParams()


  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadCourses() {
      setLoading(true)
      setError("")

      try {
        setCourses(await courseService.getCoursesByLevel(level))
      } catch (loadError) {
        console.error("LEVEL COURSES ERROR:", loadError)
        setError(loadError.message || "Unable to load courses.")
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [level])


  return (

    <div className="p-10">

      <h1 className="text-4xl font-bold text-blue-900 mb-6">
        {level} Courses
      </h1>


      <p className="text-gray-600 mb-8">
        Select a course to access lecture materials and resources.
      </p>


      <div className="grid md:grid-cols-3 gap-6">


        {loading ? (
          <p>Loading courses...</p>
        ) : error ? (
          <p className="text-red-700">{error}</p>
        ) : courses.map((course) => (

          <div
            key={course.id}
            className="bg-white shadow-lg rounded-xl p-6"
          >

            <h2 className="text-2xl font-bold text-blue-900">
              {course.course_code}
            </h2>


            <Link
              to={`/course/${encodeURIComponent(course.course_code)}`}
              className="mt-4 inline-block bg-yellow-500 text-white px-5 py-2 rounded-lg"
            >
              Open Course
            </Link>


          </div>

        ))}


      </div>


    </div>

  )
}


export default LevelCourses