import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../lib/supabase"

function StudentAssignments() {
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    loadAssignments()
  }, [])

  async function loadAssignments() {
    setLoading(true)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error(userError)
        alert(userError.message)
        setLoading(false)
        return
      }

      if (!user) {
        alert("You must be logged in.")
        setLoading(false)
        return
      }

      // ==========================================
      // STUDENT PROFILE
      // ==========================================

      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select(
          "id, full_name, level, department"
        )
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) {
        console.error(profileError)
        alert(profileError.message)
        setLoading(false)
        return
      }

      if (!profileData) {
        alert("Student profile not found.")
        setLoading(false)
        return
      }

      setProfile(profileData)

      // ==========================================
      // ASSIGNMENTS
      // ==========================================

      const {
        data: assignmentData,
        error: assignmentError,
      } = await supabase
        .from("assignments")
        .select(
          "id, created_at, title, description, course_code, level, due_date, created_by"
        )
        .eq("level", profileData.level)
        .order("due_date", {
          ascending: true,
          nullsFirst: false,
        })

      if (assignmentError) {
        console.error(assignmentError)
        alert(assignmentError.message)
        setLoading(false)
        return
      }

      setAssignments(assignmentData || [])

      // ==========================================
      // STUDENT SUBMISSIONS
      // ==========================================

      const {
        data: submissionData,
        error: submissionError,
      } = await supabase
        .from("submissions")
        .select(
          "id, assignment_id, student_id, file_url, submitted_at, grade, feedback"
        )
        .eq("student_id", user.id)

      if (submissionError) {
        console.error(
          "SUBMISSIONS ERROR:",
          submissionError
        )

        setSubmissions([])
      } else {
        setSubmissions(
          submissionData || []
        )
      }
    } catch (error) {
      console.error(
        "ASSIGNMENTS ERROR:",
        error
      )

      alert(
        error instanceof Error
          ? error.message
          : "Unable to load assignments."
      )
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // CHECK SUBMISSION
  // ==========================================

  function getSubmission(assignmentId) {
    return submissions.find(
      (submission) =>
        String(
          submission.assignment_id
        ) === String(assignmentId)
    )
  }

  // ==========================================
  // OVERDUE
  // ==========================================

  function isOverdue(dueDate) {
    if (!dueDate) {
      return false
    }

    return new Date(dueDate) < new Date()
  }

  // ==========================================
  // FORMAT DATE
  // ==========================================

  function formatDate(date) {
    if (!date) {
      return "No due date"
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
  // SUBMISSION STATUS
  // ==========================================

  function getSubmissionStatus(
    assignment,
    submission
  ) {
    if (submission) {
      return {
        text: "Submitted",
        className:
          "bg-blue-100 text-blue-700",
      }
    }

    if (isOverdue(assignment.due_date)) {
      return {
        text: "Overdue",
        className:
          "bg-red-100 text-red-700",
      }
    }

    return {
      text: "Pending",
      className:
        "bg-yellow-100 text-yellow-700",
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-950 flex items-center justify-center">

        <div className="text-center">

          <div className="text-5xl mb-4">
            📚
          </div>

          <p className="text-xl font-bold text-blue-900 dark:text-blue-400">
            Loading assignments...
          </p>

        </div>

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 text-gray-800 dark:text-gray-100 p-8">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-400">
            My Assignments
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Assignments for{" "}
            {profile?.level ||
              "your level"}{" "}
            -{" "}
            {profile?.department ||
              "your department"}
          </p>

        </div>

        {/* SUMMARY */}

        <div className="grid sm:grid-cols-3 gap-5 mb-8">

          <SummaryCard
            title="Total Assignments"
            value={assignments.length}
            icon="📚"
          />

          <SummaryCard
            title="Submitted"
            value={
              assignments.filter(
                (assignment) =>
                  getSubmission(
                    assignment.id
                  )
              ).length
            }
            icon="✅"
          />

          <SummaryCard
            title="Pending"
            value={
              assignments.filter(
                (assignment) =>
                  !getSubmission(
                    assignment.id
                  ) &&
                  !isOverdue(
                    assignment.due_date
                  )
              ).length
            }
            icon="⏳"
          />

        </div>

        {/* ASSIGNMENTS */}

        {assignments.length === 0 ? (

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-8 text-center">

            <div className="text-5xl mb-4">
              📚
            </div>

            <h2 className="text-xl font-bold text-gray-700 dark:text-white">
              No assignments available
            </h2>

            <p className="text-gray-500 dark:text-gray-400 mt-2">
              There are currently no assignments for your level.
            </p>

          </div>

        ) : (

          <div className="grid md:grid-cols-2 gap-6">

            {assignments.map(
              (assignment) => {

                const submission =
                  getSubmission(
                    assignment.id
                  )

                const status =
                  getSubmissionStatus(
                    assignment,
                    submission
                  )

                return (

                  <div
                    key={assignment.id}
                    className="bg-white dark:bg-slate-900 rounded-xl shadow p-6"
                  >

                    {/* TOP */}

                    <div className="flex justify-between items-start gap-4">

                      <div>

                        <p className="text-sm font-bold text-blue-700 dark:text-blue-400">
                          {assignment.course_code ||
                            "Course"}
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                          {assignment.title}
                        </h2>

                      </div>

                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${status.className}`}
                      >
                        {status.text}
                      </span>

                    </div>

                    {/* DESCRIPTION */}

                    <p className="text-gray-600 dark:text-gray-300 mt-4 whitespace-pre-wrap">
                      {assignment.description ||
                        "No description provided."}
                    </p>

                    {/* DUE DATE */}

                    <div className="mt-5 bg-gray-50 dark:bg-slate-800 rounded-lg p-4">

                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Due Date
                      </p>

                      <p className="font-semibold">
                        {formatDate(
                          assignment.due_date
                        )}
                      </p>

                    </div>

                    {/* SUBMISSION INFO */}

                    {submission && (

                      <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">

                        <p className="font-semibold text-blue-900 dark:text-blue-400">
                          ✅ Assignment Submitted
                        </p>

                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Submitted on{" "}
                          {formatDate(
                            submission.submitted_at
                          )}
                        </p>

                        {submission.grade && (

                          <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-2">
                            Grade:{" "}
                            {submission.grade}
                          </p>

                        )}

                        {submission.feedback && (

                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                            Feedback:{" "}
                            {submission.feedback}
                          </p>

                        )}

                      </div>

                    )}

                    {/* ACTION */}

                    {submission ? (

                      <Link
                        to={
                          "/submit-assignment/" +
                          assignment.id
                        }
                        className="block text-center mt-5 w-full p-3 rounded-lg font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/60"
                      >
                        View Submission
                      </Link>

                    ) : isOverdue(
                        assignment.due_date
                      ) ? (

                      <Link
                        to={
                          "/submit-assignment/" +
                          assignment.id
                        }
                        className="block text-center mt-5 w-full p-3 rounded-lg font-semibold bg-gray-400 text-white hover:bg-gray-500"
                      >
                        View Assignment
                      </Link>

                    ) : (

                      <Link
                        to={
                          "/submit-assignment/" +
                          assignment.id
                        }
                        className="block text-center mt-5 w-full p-3 rounded-lg font-semibold bg-blue-900 text-white hover:bg-blue-800"
                      >
                        Submit Assignment
                      </Link>

                    )}

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
// SUMMARY CARD
// ==========================================

function SummaryCard({
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

export default StudentAssignments