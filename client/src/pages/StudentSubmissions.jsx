import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

function StudentSubmissions() {
  const navigate = useNavigate()

  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadSubmissions()
  }, [])

  async function loadSubmissions() {
    setLoading(true)
    setError("")

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        throw userError
      }

      if (!user) {
        setError("You must be logged in.")
        return
      }

      // ==========================================
      // LOAD STUDENT SUBMISSIONS
      // ==========================================

      const {
        data,
        error: submissionError,
      } = await supabase
        .from("submissions")
        .select("*")
        .eq("student_id", user.id)
        .order("submitted_at", {
          ascending: false,
        })

      if (submissionError) {
        throw submissionError
      }

      const submissionData = data || []

      // ==========================================
      // LOAD ASSIGNMENTS
      // ==========================================

      if (submissionData.length === 0) {
        setSubmissions([])
        return
      }

      const assignmentIds =
        submissionData.map(
          (submission) =>
            submission.assignment_id
        )

      const {
        data: assignmentData,
        error: assignmentError,
      } = await supabase
        .from("assignments")
        .select(
          "id, title, description, course_code, level, due_date"
        )
        .in("id", assignmentIds)

      if (assignmentError) {
        throw assignmentError
      }

      // ==========================================
      // COMBINE SUBMISSION + ASSIGNMENT
      // ==========================================

      const assignmentMap = {}

      ;(assignmentData || []).forEach(
        (assignment) => {
          assignmentMap[assignment.id] =
            assignment
        }
      )

      const combinedData =
        submissionData.map(
          (submission) => ({
            ...submission,
            assignment:
              assignmentMap[
                submission.assignment_id
              ] || null,
          })
        )

      setSubmissions(combinedData)
    } catch (err) {
      console.error(
        "STUDENT SUBMISSIONS ERROR:",
        err
      )

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your submissions."
      )
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // DATE FORMAT
  // ==========================================

  function formatDate(date) {
    if (!date) {
      return "Not available"
    }

    const formattedDate =
      new Date(date)

    if (
      Number.isNaN(
        formattedDate.getTime()
      )
    ) {
      return "Invalid date"
    }

    return formattedDate.toLocaleString()
  }

  // ==========================================
  // GRADE STATUS
  // ==========================================

  function getGradeStatus(submission) {
    if (
      submission.grade !== null &&
      submission.grade !== undefined &&
      submission.grade !== ""
    ) {
      return {
        text: "Graded",
        className:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      }
    }

    return {
      text: "Pending Review",
      className:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    }
  }

  // ==========================================
  // STATISTICS
  // ==========================================

  const statistics = useMemo(() => {
    const total = submissions.length

    const graded =
      submissions.filter(
        (submission) =>
          submission.grade !== null &&
          submission.grade !== undefined &&
          submission.grade !== ""
      ).length

    const pending = total - graded

    return {
      total,
      graded,
      pending,
    }
  }, [submissions])

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-950 flex items-center justify-center">

        <div className="text-center">

          <div className="text-5xl mb-4">
            📤
          </div>

          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
            Loading Your Submissions...
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Please wait.
          </p>

        </div>

      </div>
    )
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-950 flex items-center justify-center p-6">

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">

          <div className="text-5xl mb-4">
            ⚠️
          </div>

          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
            Unable to Load Submissions
          </h1>

          <p className="mt-4 text-gray-600 dark:text-gray-300 break-words">
            {error}
          </p>

          <div className="flex justify-center gap-3 mt-6">

            <button
              onClick={loadSubmissions}
              className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-3 rounded-lg font-semibold"
            >
              Try Again
            </button>

            <button
              onClick={() =>
                navigate(
                  "/student-dashboard"
                )
              }
              className="bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 px-5 py-3 rounded-lg font-semibold"
            >
              Dashboard
            </button>

          </div>

        </div>

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 text-gray-800 dark:text-gray-100">

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="bg-blue-900 dark:bg-slate-900 text-white shadow-lg">

        <div className="max-w-7xl mx-auto px-6 py-6">

          <button
            onClick={() =>
              navigate(
                "/student-dashboard"
              )
            }
            className="text-blue-100 hover:text-white mb-5"
          >
            ← Back to Dashboard
          </button>

          <div className="flex items-center gap-4">

            <div className="text-5xl">
              📤
            </div>

            <div>

              <h1 className="text-3xl font-bold">
                My Submissions
              </h1>

              <p className="text-blue-100 mt-1">
                View your submitted assignments and lecturer feedback.
              </p>

            </div>

          </div>

        </div>

      </div>

      <div className="max-w-7xl mx-auto p-6">

        {/* ========================================
            STATISTICS
        ======================================== */}

        <div className="grid sm:grid-cols-3 gap-5">

          <StatCard
            title="Total Submissions"
            value={statistics.total}
            icon="📤"
          />

          <StatCard
            title="Graded"
            value={statistics.graded}
            icon="✅"
          />

          <StatCard
            title="Pending Review"
            value={statistics.pending}
            icon="⏳"
          />

        </div>

        {/* ========================================
            EMPTY STATE
        ======================================== */}

        {submissions.length === 0 ? (

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-10 text-center mt-8">

            <div className="text-6xl mb-5">
              📭
            </div>

            <h2 className="text-2xl font-bold">
              No Submissions Yet
            </h2>

            <p className="mt-3 text-gray-500 dark:text-gray-400">
              You haven't submitted any assignments yet.
            </p>

            <Link
              to="/student-assignments"
              className="inline-block mt-6 bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold"
            >
              View Assignments
            </Link>

          </div>

        ) : (

          /* ========================================
             SUBMISSIONS
          ======================================== */

          <div className="mt-8 space-y-6">

            {submissions.map(
              (submission) => {

                const assignment =
                  submission.assignment

                const status =
                  getGradeStatus(
                    submission
                  )

                return (

                  <div
                    key={submission.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow p-6"
                  >

                    {/* TOP */}

                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

                      <div>

                        <p className="text-sm font-bold text-blue-700 dark:text-blue-400">
                          {assignment?.course_code ||
                            "Course"}
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                          {assignment?.title ||
                            "Assignment"}
                        </h2>

                        {assignment?.description && (

                          <p className="mt-3 text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                            {
                              assignment.description
                            }
                          </p>

                        )}

                      </div>

                      <span
                        className={`inline-flex w-fit px-3 py-1 rounded-full text-xs font-bold ${status.className}`}
                      >
                        {status.text}
                      </span>

                    </div>

                    {/* DETAILS */}

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">

                      <Detail
                        label="Submitted"
                        value={formatDate(
                          submission.submitted_at
                        )}
                      />

                      <Detail
                        label="Due Date"
                        value={formatDate(
                          assignment?.due_date
                        )}
                      />

                      <Detail
                        label="Grade"
                        value={
                          submission.grade !==
                            null &&
                          submission.grade !==
                            undefined &&
                          submission.grade !==
                            ""
                            ? submission.grade
                            : "Not graded"
                        }
                      />

                      <Detail
                        label="Assignment ID"
                        value={
                          submission.assignment_id
                        }
                      />

                    </div>

                    {/* FEEDBACK */}

                    <div className="mt-6">

                      <h3 className="font-bold text-lg">
                        💬 Lecturer Feedback
                      </h3>

                      {submission.feedback ? (

                        <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">

                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {
                              submission.feedback
                            }
                          </p>

                        </div>

                      ) : (

                        <div className="mt-3 bg-gray-50 dark:bg-slate-800 rounded-xl p-5">

                          <p className="text-gray-500 dark:text-gray-400">
                            No feedback has been provided yet.
                          </p>

                        </div>

                      )}

                    </div>

                    {/* FILE */}

                    {submission.file_url && (

                      <div className="mt-6">

                        <button
  type="button"
  onClick={async () => {
    const { data, error } = await supabase.storage
      .from("assignments")
      .createSignedUrl(submission.file_url, 600)

    if (error) {
      console.error("File URL error:", error)
      alert(error.message)
      return
    }

    if (!data?.signedUrl) {
      alert("Unable to open submitted file.")
      return
    }

    window.open(data.signedUrl, "_blank")
  }}
  className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-5 py-3 rounded-lg font-semibold"
>
  📎 Open Submitted File
</button>

                      </div>

                    )}

                    {/* ACTIONS */}

                    <div className="mt-6 pt-5 border-t border-gray-200 dark:border-slate-700 flex flex-wrap gap-3">

                      {assignment?.id && (

                        <Link
                          to={
                            "/submit-assignment/" +
                            assignment.id
                          }
                          className="bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 px-5 py-3 rounded-lg font-semibold"
                        >
                          View Assignment
                        </Link>

                      )}

                      <Link
                        to="/student-assignments"
                        className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-3 rounded-lg font-semibold"
                      >
                        All Assignments
                      </Link>

                    </div>

                  </div>

                )
              }
            )}

          </div>

        )}

      </div>

    </div>
  )
}

// ==========================================
// STAT CARD
// ==========================================

function StatCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-5">

      <div className="flex items-center justify-between">

        <p className="text-gray-500 dark:text-gray-400">
          {title}
        </p>

        <span className="text-2xl">
          {icon}
        </span>

      </div>

      <p className="text-3xl font-bold text-blue-900 dark:text-blue-400 mt-3">
        {value}
      </p>

    </div>
  )
}

// ==========================================
// DETAIL
// ==========================================

function Detail({
  label,
  value,
}) {
  return (
    <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">

      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>

      <p className="font-semibold mt-1 break-words">
        {value}
      </p>

    </div>
  )
}

export default StudentSubmissions