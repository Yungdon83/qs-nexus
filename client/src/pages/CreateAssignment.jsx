import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

function CreateAssignment() {
  const [courses, setCourses] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    title: "",
    description: "",
    course_code: "",
    due_date: "",
  })

  useEffect(() => {
    loadCourses()
  }, [])

  async function loadCourses() {
    setLoadingCourses(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert("You must be logged in.")
      setLoadingCourses(false)
      return
    }

    const { data, error } = await supabase
      .from("courses")
      .select("id, course_code, course_title, level")
      .eq("lecturer_id", user.id)
      .order("course_code", { ascending: true })

    if (error) {
      console.error(error)
      alert(error.message)
      setLoadingCourses(false)
      return
    }

    setCourses(data || [])
    setLoadingCourses(false)
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  async function createAssignment(e) {
    e.preventDefault()

    if (!form.course_code) {
      alert("Please select a course.")
      return
    }

    if (!form.title.trim()) {
      alert("Please enter an assignment title.")
      return
    }

    if (!form.due_date) {
      alert("Please select a due date.")
      return
    }

    setSaving(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert("You must be logged in.")
      setSaving(false)
      return
    }

    const selectedCourse = courses.find(
      (course) => course.course_code === form.course_code
    )

    if (!selectedCourse) {
      alert("Selected course could not be found.")
      setSaving(false)
      return
    }

    const { error } = await supabase
      .from("assignments")
      .insert({
        title: form.title.trim(),
        description: form.description.trim(),
        course_code: selectedCourse.course_code,
        level: selectedCourse.level,
        due_date: form.due_date,
        created_by: user.id,
      })

    if (error) {
      console.error(error)
      alert(error.message)
      setSaving(false)
      return
    }

    alert("Assignment created successfully.")

    setForm({
      title: "",
      description: "",
      course_code: "",
      due_date: "",
    })

    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">

        <div className="bg-white rounded-xl shadow p-8">

          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Create Assignment
          </h1>

          <p className="text-gray-600 mb-8">
            Create an assignment for one of your assigned courses.
          </p>

          <form
            onSubmit={createAssignment}
            className="space-y-5"
          >

            {/* Course */}

            <div>
              <label className="block font-semibold mb-2">
                Course
              </label>

              {loadingCourses ? (
                <p className="text-gray-500">
                  Loading your courses...
                </p>
              ) : courses.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 text-yellow-800">
                  You have no courses assigned to you yet.
                </div>
              ) : (
                <select
                  name="course_code"
                  value={form.course_code}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3"
                  required
                >
                  <option value="">
                    Select course
                  </option>

                  {courses.map((course) => (
                    <option
                      key={course.id}
                      value={course.course_code}
                    >
                      {course.course_code} - {course.course_title}
                    </option>
                  ))}
                </select>
              )}
            </div>


            {/* Title */}

            <div>
              <label className="block font-semibold mb-2">
                Assignment Title
              </label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Week 3 Assignment"
                className="w-full border rounded-lg p-3"
                required
              />
            </div>


            {/* Description */}

            <div>
              <label className="block font-semibold mb-2">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter assignment instructions..."
                rows="6"
                className="w-full border rounded-lg p-3"
              />
            </div>


            {/* Due Date */}

            <div>
              <label className="block font-semibold mb-2">
                Due Date
              </label>

              <input
                type="datetime-local"
                name="due_date"
                value={form.due_date}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
                required
              />
            </div>


            {/* Submit */}

            <button
              type="submit"
              disabled={saving || loadingCourses || courses.length === 0}
              className="w-full bg-blue-900 text-white font-semibold p-3 rounded-lg hover:bg-blue-800 disabled:bg-gray-400"
            >
              {saving
                ? "Creating Assignment..."
                : "Create Assignment"}
            </button>

          </form>

        </div>

      </div>
    </div>
  )
}

export default CreateAssignment