import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { useNavigate } from "react-router-dom"

function UploadResource() {
  const navigate = useNavigate()

  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    title: "",
    description: "",
    course_code: "",
    level: "",
    department: "",
  })

  const [file, setFile] = useState(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    const { data } = await supabase
      .from("courses")
      .select("*")
      .order("course_code")

    if (data) setCourses(data)
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleCourseChange = (e) => {
    const selected = courses.find(
      (course) => course.course_code === e.target.value
    )

    if (!selected) return

    setForm({
      ...form,
      course_code: selected.course_code,
      level: selected.level,
      department: selected.department,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!file) {
      alert("Please select a file.")
      return
    }

    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert("You must be logged in.")
      setLoading(false)
      return
    }

    const fileName = `${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from("resources")
      .upload(fileName, file)

    if (uploadError) {
      alert(uploadError.message)
      setLoading(false)
      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("resources")
      .getPublicUrl(fileName)

    const { error: insertError } = await supabase
      .from("resources")
      .insert({
        title: form.title,
        description: form.description,
        file_url: publicUrl,
        course_code: form.course_code,
        level: form.level,
        department: form.department,
        uploaded_by: user.id,
      })

    if (insertError) {
      alert(insertError.message)
      setLoading(false)
      return
    }

    alert("Resource uploaded successfully!")

    navigate("/lecturer-dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-blue-900 mb-6">
          Upload Resource
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            type="text"
            name="title"
            placeholder="Resource Title"
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            rows="4"
            required
          />

          <select
            onChange={handleCourseChange}
            className="w-full border rounded-lg p-3"
            required
          >
            <option value="">Select Course</option>

            {courses.map((course) => (
              <option
                key={course.id}
                value={course.course_code}
              >
                {course.course_code} - {course.course_title}
              </option>
            ))}

          </select>

          <input
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800"
          >
            {loading ? "Uploading..." : "Upload Resource"}
          </button>

        </form>

      </div>
    </div>
  )
}

export default UploadResource