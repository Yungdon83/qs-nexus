
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../lib/supabase"

function StudentSubmissions() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSubmissions()
  }, [])

  async function loadSubmissions() {
    setLoading(true)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("User error:", userError)
        alert(userError.message)
        setLoading(false)
        return
      }

      if (!user) {
        alert("You must be logged in.")
        setLoading(false)
        return
      }

      const {
        data: submissionData,
        error: submissionError,
      } = await supabase
        .from("submissions")
        .select(
          "id, assignment_id, student_id, file_url, submitted_at, grade, feedback"
        )
        .eq("student_id", user.id)
        .order("submitted_at", {
          ascending: false,
        })

      if (submissionError) {
        console.error("Submission error:", submissionError)
        alert(submissionError.message)
        setLoading(false)
        return
      }

      if (!submissionData || submissionData.length === 0) {
        setSubmissions([])
        setLoading(false)
        return
      }

      const assignmentIds = [
        ...new Set(
          submissionData.map(
            (submission) => submission.assignment_id
          )
        ),
      ]

      const {
        data: assignmentData,
        error: assignmentError,
      } = await supabase
        .from("assignments")
        .select(
          "id, title, course_code, description, due_date"
        )
        .in("id", assignmentIds)

      if (assignmentError) {
        console.error(
          "Assignment error:",
          assignmentError
        )
      }

      const assignmentMap = {}

      ;(assignmentData || []).forEach((assignment) => {
        assignmentMap[assignment.id] = assignment
      })

      const combinedData = submissionData.map(
        (submission) => ({
          ...submission,
          assignment:
            assignmentMap[submission.assignment_id] || null,
        })
      )

      setSubmissions(combinedData)
    } catch (error) {
      console.error("Unexpected error:", error)
      alert("Unable to load your submissions.")
    }

    setLoading(false)
  }

  function formatDate(date) {
    if (!date) {
      return "Not available"
    }

    const formatted = new Date(date)

    if (Number.isNaN(formatted.getTime())) {
      return "Not available"
    }

    return formatted.toLocaleString()
  }

  function openSubmission(fileUrl) {
    if (!fileUrl) {
      alert("Submission file not found.")
      return
    }

    window.open(
      fileUrl,
      "_blank",
      "noopener,noreferrer"
    )
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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">

        <div className="mb-8">

          <Link
            to="/student-dashboard"
            className="text-blue-900 font-semibold"
          >
            ← Back to Dashboard
          </Link>

          <h1 className="text-3xl font-bold text-blue-900 mt-5">
            My Assignment Submissions
          </h1>

          <p className="text-gray-600 mt-2">
            View your submitted assignments, grades and lecturer feedback.
          </p>

        </div>

        {submissions.length === 0 ? (

          <div className="bg-white rounded-xl shadow p-10 text-center">

            <div className="text-5xl mb-4">
              📄
            </div>

            <h2 className="text-xl font-bold text-gray-700">
              No submissions yet
            </h2>

            <p className="text-gray-500 mt-2">
              You have not submitted any assignments yet.
            </p>

            <Link
              to="/student-assignments"
              className="inline-block mt-6 bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800"
            >
              View Assignments
            </Link>

          </div>

        ) : (

          <div className="space-y-6">

            {submissions.map((item) => (

              <div
                key={item.id}
                className="bg-white rounded-xl shadow p-6"
              >

                <div className="flex justify-between items-start gap-4">

                  <div>

                    <p className="text-sm font-bold text-blue-700">
                      {item.assignment?.course_code ||
                        "Course"}
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 mt-1">
                      {item.assignment?.title ||
                        "Assignment"}
                    </h2>

                  </div>

                  {item.grade !== null &&
                  item.grade !== undefined ? (

                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                      Graded
                    </span>

                  ) : (

                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold">
                      Pending
                    </span>

                  )}

                </div>

                <div className="mt-5 grid md:grid-cols-2 gap-4">

                  <div className="bg-gray-50 rounded-lg p-4">

                    <p className="text-sm text-gray-500">
                      Submitted
                    </p>

                    <p className="font-semibold mt-1">
                      {formatDate(
                        item.submitted_at
                      )}
                    </p>

                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">

                    <p className="text-sm text-gray-500">
                      Due Date
                    </p>

                    <p className="font-semibold mt-1">
                      {formatDate(
                        item.assignment?.due_date
                      )}
                    </p>

                  </div>

                </div>

                <div className="mt-5">

                  <button
                    type="button"
                    onClick={() =>
                      openSubmission(
                        item.file_url
                      )
                    }
                    className="bg-blue-900 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-800"
                  >
                    Open Submitted File
                  </button>

                </div>

                <div className="mt-5 bg-blue-50 border border-blue-200 rounded-lg p-5">

                  <p className="text-sm text-blue-700 font-semibold">
                    Grade
                  </p>

                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {item.grade !== null &&
                    item.grade !== undefined
                      ? item.grade
                      : "Not graded"}
                  </p>

                </div>

                <div className="mt-4 bg-gray-50 rounded-lg p-5">

                  <p className="font-semibold text-gray-700">
                    Lecturer Feedback
                  </p>

                  <p className="text-gray-600 mt-2 whitespace-pre-wrap">
                    {item.feedback ||
                      "No feedback yet."}
                  </p>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>
    </div>
  )
}

export default StudentSubmissions

