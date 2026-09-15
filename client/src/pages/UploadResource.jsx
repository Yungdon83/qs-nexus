import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../lib/supabase"

const materialTypes = [
  "Lecture Slides",
  "Past Questions",
  "Textbooks",
  "Lecture Notes",
  "Handouts",
  "Study Materials",
  "Revision Materials",
  "Assignments",
  "Other Resources",
]

const levels = ["100L", "200L", "300L", "400L", "500L", "All Levels"]
const semesters = ["First Semester", "Second Semester"]
const maxFileSize = 50 * 1024 * 1024
const allowedFileTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
]

const initialForm = {
  title: "",
  description: "",
  resource_type: "Lecture Notes",
  course_code: "",
  level: "All Levels",
  semester: "",
}

function UploadResource() {
  const [courses, setCourses] = useState([])
  const [file, setFile] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    async function loadCourses() {
      const { data, error } = await supabase
        .from("courses")
        .select("course_code, course_title, level")
        .order("course_code")

      if (error) {
        setMessage({ type: "error", text: "Unable to load courses." })
        return
      }

      setCourses(data || [])
    }

    void loadCourses()
  }, [])

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0] || null
    setMessage({ type: "", text: "" })

    if (!selectedFile) {
      setFile(null)
      return
    }

    if (selectedFile.size > maxFileSize) {
      setFile(null)
      event.target.value = ""
      setMessage({ type: "error", text: "Files must be 50 MB or smaller." })
      return
    }

    if (selectedFile.type && !allowedFileTypes.includes(selectedFile.type)) {
      setFile(null)
      event.target.value = ""
      setMessage({ type: "error", text: "Upload a PDF, document, spreadsheet, presentation, or text file." })
      return
    }

    setFile(selectedFile)
  }

  async function uploadResource(event) {
    event.preventDefault()
    setMessage({ type: "", text: "" })

    if (!file) {
      setMessage({ type: "error", text: "Select a file before uploading." })
      return
    }

    if (!form.title.trim() || !form.level) {
      setMessage({ type: "error", text: "Title and level are required." })
      return
    }

    setLoading(true)
    let storagePath = ""

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw userError || new Error("You must be signed in to upload a resource.")

      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-")
      storagePath = `library/${user.id}/${crypto.randomUUID()}-${safeFileName}`

      const { error: uploadError } = await supabase.storage
        .from("resources")
        .upload(storagePath, file, { contentType: file.type || undefined, upsert: false })

      if (uploadError) throw uploadError

      const { error: databaseError } = await supabase.from("resources").insert({
        title: form.title.trim(),
        description: form.description.trim() || null,
        resource_type: form.resource_type,
        course_code: form.course_code || null,
        level: form.level,
        semester: form.semester || null,
        file_url: storagePath,
        uploaded_by: user.id,
      })

      if (databaseError) throw databaseError

      setForm(initialForm)
      setFile(null)
      event.target.reset()
      setMessage({ type: "success", text: "Library material uploaded successfully." })
    } catch (uploadError) {
      if (storagePath) {
        await supabase.storage.from("resources").remove([storagePath])
      }
      console.error("RESOURCE UPLOAD ERROR:", uploadError)
      setMessage({ type: "error", text: "The material could not be uploaded. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen qs-page bg-gray-100 dark:bg-slate-950 p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-yellow-600">QS Nexus</p>
            <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-300 mt-1">Upload Library Material</h1>
          </div>
          <Link to="/library" className="text-blue-900 dark:text-blue-300 hover:underline">Back to Library</Link>
        </div>

        <form onSubmit={uploadResource} className="qs-card p-6 space-y-4">
          {message.text && (
            <p role="status" className={message.type === "error" ? "text-red-700 dark:text-red-300" : "text-green-700 dark:text-green-300"}>
              {message.text}
            </p>
          )}
          <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="qs-input w-full border rounded-lg p-3 bg-transparent" required />
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description (optional)" className="qs-input w-full border rounded-lg p-3 bg-transparent min-h-28" />
          <div className="grid sm:grid-cols-2 gap-4">
            <select name="resource_type" value={form.resource_type} onChange={handleChange} className="qs-input border rounded-lg p-3 bg-transparent" aria-label="Material type">
              {materialTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
            <select name="course_code" value={form.course_code} onChange={handleChange} className="qs-input border rounded-lg p-3 bg-transparent" aria-label="Course">
              <option value="">General material (no course)</option>
              {courses.map((course) => <option key={course.course_code} value={course.course_code}>{course.course_code} - {course.course_title}</option>)}
            </select>
            <select name="level" value={form.level} onChange={handleChange} className="qs-input border rounded-lg p-3 bg-transparent" aria-label="Level" required>
              {levels.map((level) => <option key={level}>{level}</option>)}
            </select>
            <select name="semester" value={form.semester} onChange={handleChange} className="qs-input border rounded-lg p-3 bg-transparent" aria-label="Semester">
              <option value="">All semesters</option>
              {semesters.map((semester) => <option key={semester}>{semester}</option>)}
            </select>
          </div>
          <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" className="w-full" required />
          <p className="text-xs text-gray-500">Maximum file size: 50 MB.</p>
          <button type="submit" disabled={loading} className="qs-button w-full bg-blue-900 text-white px-4 py-3 disabled:opacity-60">
            {loading ? "Uploading..." : "Upload Material"}
          </button>
        </form>
      </div>
    </main>
  )
}

export default UploadResource
