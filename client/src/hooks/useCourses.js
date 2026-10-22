import { useState } from "react"
import courseService from "../services/courseService"


export default function useCourses() {


  const [courses, setCourses] = useState([])

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState(null)





  async function fetchCourses() {

    try {

      setLoading(true)

      setError(null)


      const data = await courseService.getCourses()


      setCourses(data)


    } catch (err) {

      setError(err.message)

    } finally {

      setLoading(false)

    }

  }






  async function fetchCoursesByLevel(level) {

    try {

      setLoading(true)

      setError(null)


      const data = await courseService.getCoursesByLevel(level)


      setCourses(data)


    } catch (err) {

      setError(err.message)

    } finally {

      setLoading(false)

    }

  }






  async function createCourse(course) {

    try {

      setLoading(true)


      const data = await courseService.createCourse(course)


      setCourses([
        data,
        ...courses
      ])


      return data


    } catch (err) {

      setError(err.message)

      throw err


    } finally {

      setLoading(false)

    }

  }






  async function deleteCourse(id) {

    try {

      await courseService.deleteCourse(id)


      setCourses(
        courses.filter(
          (course) => course.id !== id
        )
      )


    } catch (err) {

      setError(err.message)

    }

  }






  return {

    courses,

    loading,

    error,

    fetchCourses,

    fetchCoursesByLevel,

    createCourse,

    deleteCourse

  }


}