
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

function GradeSubmissions() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  async function fetchSubmissions() {
    setLoading(true)

    const { data, error } = await supabase
      .from("submissions")
      .select(`
        id,
        assignment_id,
        student_id,
        file_url,
        submitted_at,
        grade,
        feedback,
        assignments (
          title,
          course_code,
          level
        )
      `)
      .order("submitted_at", {
        ascending: false,
      })

    if (error) {
      console.error(error)
      alert(error.message)
      setLoading(false)
      return
    }

    const submissionData = data || []

    const studentIds = [
      ...new Set(
        submissionData
          .map((item) => item.student_id)
          .filter(Boolean)
      ),
    ]

    let profiles = []

    if (studentIds.length > 0) {
      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("id, full_name, email, level, department")
        .in("id", studentIds)

      if (profileError) {
        console.error(profileError)
        alert(profileError.message)
        setLoading(false)
        return
      }

      profiles = profileData || []
    }

    const profileMap = {}

    profiles.forEach((profile) => {
      profileMap[profile.id] = profile
    })

    const finalData = submissionData.map((submission) => ({
      ...submission,
      student: profileMap[submission.student_id] || null,
    }))

    setSubmissions(finalData)
    setLoading(false)
  }

  async function updateSubmission(id, grade, feedback) {
    if (grade === "") {
      alert("Please enter a grade.")
      return
    }

    setSavingId(id)

    const { error } = await supabase
      .from("submissions")
      .update({
        grade: grade,
        feedback: feedback,
      })
      .eq("id", id)

    if (error) {
      console.error(error)
      alert(error.message)
      setSavingId(null)
      return
    }

    alert("Grade and feedback saved successfully.")

    await fetchSubmissions()

    setSavingId(null)
  }

  function formatDate(date) {
    if (!date) {
      return "Unknown"
    }

    const formatted = new Date(date)

    if (Number.isNaN(formatted.getTime())) {
      return "Invalid date"
    }

    return formatted.toLocaleString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl font-bold text-blue-900">
          Loading submissions...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900">
            Grade Submissions
          </h1>

          <p className="text-gray-600 mt-2">
            Review student assignments, grades and feedback.
          </p>
        </div>

        {submissions.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <h2 className="text-xl font-bold text-gray-700">
              No submissions yet.
            </h2>

            <p className="text-gray-500 mt-2">
              Student submissions will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">

            {submissions.map((submission) => (
              <SubmissionCard
                key={submission.id}
                submission={submission}
                updateSubmission={updateSubmission}
                saving={savingId === submission.id}
                formatDate={formatDate}
              />
            ))}

          </div>
        )}

      </div>
    </div>
  )
}

function SubmissionCard({
  submission,
  updateSubmission,
  saving,
  formatDate,
}) {
  const [grade, setGrade] = useState(
    submission.grade ?? ""
  )

  const [feedback, setFeedback] = useState(
    submission.feedback ?? ""
  )

  const student = submission.student
  const assignment = submission.assignments

  return (
    <div className="bg-white rounded-xl shadow p-6">

      {/* Assignment information */}
      <div className="border-b pb-5">

        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">

          <div>
            <p className="text-sm font-bold text-blue-700">
              {assignment?.course_code || "Course"}
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-1">
              {assignment?.title || "Assignment"}
            </h2>
          </div>

          <div>
            {submission.grade !== null &&
            submission.grade !== "" ? (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                Graded
              </span>
            ) : (
              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold">
                Awaiting Grade
              </span>
            )}
          </div>

        </div>

      </div>

      {/* Student information */}
      <div className="grid md:grid-cols-2 gap-4 mt-5">

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">
            Student
          </p>

          <p className="font-bold text-gray-900 mt-1">
            {student?.full_name || "Unknown student"}
          </p>

          {student?.email && (
            <p className="text-sm text-gray-500 mt-1">
              {student.email}
            </p>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">
            Level
          </p>

          <p className="font-bold text-gray-900 mt-1">
            {student?.level ||
              assignment?.level ||
              "Unknown"}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">
            Department
          </p>

          <p className="font-bold text-gray-900 mt-1">
            {student?.department ||
              "Quantity Surveying"}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">
            Submitted
          </p>

          <p className="font-bold text-gray-900 mt-1">
            {formatDate(submission.submitted_at)}
          </p>
        </div>

      </div>

      {/* Submitted file */}
      <div className="mt-5">

        <p className="text-sm text-gray-500 mb-2">
          Submitted File
        </p>

        {submission.file_url ? (
          <a
            href={submission.file_url}
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold hover:bg-blue-200"
          >
            📄 View Submitted File
          </a>
        ) : (
          <p className="text-red-600">
            No submission file found.
          </p>
        )}

      </div>

      {/* Grade */}
      <div className="mt-6">

        <label className="block font-semibold text-gray-700 mb-2">
          Grade
        </label>

        <input
          type="text"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          placeholder="Enter grade e.g. 85 or A"
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />

      </div>

      {/* Feedback */}
      <div className="mt-4">

        <label className="block font-semibold text-gray-700 mb-2">
          Feedback
        </label>

        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Write feedback for the student..."
          rows="5"
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />

      </div>

      {/* Save */}
      <button
        onClick={() =>
          updateSubmission(
            submission.id,
            grade,
            feedback
          )
        }
        disabled={saving}
        className="mt-5 bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 disabled:bg-gray-400"
      >
        {saving ? "Saving..." : "Save Grade & Feedback"}
      </button>

    </div>
  )
}

export default GradeSubmissions

