
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { supabase } from "../lib/supabase"

function SubmitAssignment() {
  const { id } = useParams()

  const [assignment, setAssignment] = useState(null)
  const [submission, setSubmission] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadPage()
  }, [id])

  async function loadPage() {
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("Please log in first.")
        setLoading(false)
        return
      }

      const { data: assignmentData, error: assignmentError } =
        await supabase
          .from("assignments")
          .select("*")
          .eq("id", id)
          .maybeSingle()

      if (assignmentError) {
        console.error("Assignment error:", assignmentError)
        alert(assignmentError.message)
        setLoading(false)
        return
      }

      if (!assignmentData) {
        setAssignment(null)
        setLoading(false)
        return
      }

      setAssignment(assignmentData)

      const { data: submissionData, error: submissionError } =
        await supabase
          .from("submissions")
          .select("*")
          .eq("assignment_id", id)
          .eq("student_id", user.id)
          .maybeSingle()

      if (submissionError) {
        console.error("Submission error:", submissionError)
      }

      setSubmission(submissionData || null)
    } catch (error) {
      console.error(error)
      alert("Something went wrong.")
    }

    setLoading(false)
  }

  function formatDate(value) {
    if (!value) {
      return "Not available"
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return "Not available"
    }

    return date.toLocaleString()
  }

  function assignmentIsOverdue() {
    if (!assignment || !assignment.due_date) {
      return false
    }

    return new Date(assignment.due_date) < new Date()
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!selectedFile) {
      alert("Please select a file.")
      return
    }

    if (assignmentIsOverdue()) {
      alert("This assignment is overdue.")
      return
    }

    setUploading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("Please log in first.")
        setUploading(false)
        return
      }

      const extension = selectedFile.name.includes(".")
        ? selectedFile.name.split(".").pop()
        : "file"

      const fileName =
        user.id +
        "/" +
        assignment.id +
        "-" +
        Date.now() +
        "." +
        extension

      const { error: uploadError } = await supabase.storage
        .from("assignments")
        .upload(fileName, selectedFile, {
          upsert: false,
        })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        alert(uploadError.message)
        setUploading(false)
        return
      }

      const submittedAt = new Date().toISOString()

      const { data: newSubmission, error: insertError } =
        await supabase
          .from("submissions")
          .insert({
            assignment_id: assignment.id,
            student_id: user.id,
            file_url: fileName,
            submitted_at: submittedAt,
            grade: null,
            feedback: null,
          })
          .select("*")
          .single()

      if (insertError) {
        console.error("Database error:", insertError)

        await supabase.storage
          .from("assignments")
          .remove([fileName])

        alert(insertError.message)
        setUploading(false)
        return
      }

      setSubmission(newSubmission)
      setSelectedFile(null)

      alert("Assignment submitted successfully.")
    } catch (error) {
      console.error(error)
      alert("Something went wrong while submitting.")
    }

    setUploading(false)
  }

  async function openSubmission() {
    if (!submission || !submission.file_url) {
      alert("Submission file not found.")
      return
    }

    const { data, error } = await supabase.storage
      .from("assignments")
      .createSignedUrl(submission.file_url, 600)

    if (error) {
      console.error("Signed URL error:", error)
      alert(error.message)
      return
    }

    if (!data || !data.signedUrl) {
      alert("Unable to open the submission.")
      return
    }

    window.open(data.signedUrl, "_blank")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow p-8">
          <p className="text-xl font-semibold">
            Loading assignment...
          </p>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow p-8 text-center">

            <h1 className="text-2xl font-bold text-red-700">
              Assignment not found
            </h1>

            <Link
              to="/student-assignments"
              className="inline-block mt-6 bg-blue-900 text-white px-5 py-3 rounded-lg"
            >
              Back to Assignments
            </Link>

          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-3xl mx-auto">

        <Link
          to="/student-assignments"
          className="text-blue-900 font-semibold"
        >
          ← Back to Assignments
        </Link>

        <div className="bg-white rounded-xl shadow p-8 mt-5">

          <p className="text-blue-700 font-bold">
            {assignment.course_code || "Course"}
          </p>

          <h1 className="text-3xl font-bold text-blue-900 mt-2">
            {assignment.title}
          </h1>

          <div className="mt-6">

            <h2 className="text-lg font-bold">
              Instructions
            </h2>

            <p className="text-gray-700 mt-2 whitespace-pre-wrap">
              {assignment.description ||
                "No instructions provided."}
            </p>

          </div>

          <div className="mt-6 bg-gray-50 rounded-lg p-4">

            <p className="text-gray-500 text-sm">
              Due Date
            </p>

            <p className="font-semibold mt-1">
              {formatDate(assignment.due_date)}
            </p>

          </div>

          {submission ? (

            <div className="mt-8">

              <div className="bg-green-50 border border-green-200 rounded-xl p-6">

                <h2 className="text-xl font-bold text-green-800">
                  Assignment Submitted
                </h2>

                <p className="text-green-700 mt-2">
                  Your submission has been recorded successfully.
                </p>

                <div className="mt-4">

                  <p className="text-sm text-gray-500">
                    Submitted
                  </p>

                  <p className="font-semibold text-gray-800">
                    {formatDate(submission.submitted_at)}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={openSubmission}
                  className="mt-5 bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-lg font-semibold"
                >
                  Open My Submission
                </button>

              </div>

              {submission.grade !== null &&
              submission.grade !== undefined ? (

                <div className="mt-5 bg-blue-50 border border-blue-200 rounded-xl p-6">

                  <h2 className="text-xl font-bold text-blue-900">
                    Grade
                  </h2>

                  <p className="text-4xl font-bold text-blue-900 mt-3">
                    {submission.grade}
                  </p>

                  {submission.feedback && (
                    <div className="mt-5">

                      <p className="font-bold">
                        Lecturer Feedback
                      </p>

                      <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                        {submission.feedback}
                      </p>

                    </div>
                  )}

                </div>

              ) : (

                <div className="mt-5 bg-yellow-50 border border-yellow-200 rounded-xl p-5">

                  <p className="text-yellow-800 font-semibold">
                    Your submission has not been graded yet.
                  </p>

                </div>

              )}

            </div>

          ) : (

            <div className="mt-8">

              {assignmentIsOverdue() ? (

                <div className="bg-red-50 border border-red-200 rounded-xl p-5">

                  <h2 className="font-bold text-red-800">
                    Assignment Closed
                  </h2>

                  <p className="text-red-700 mt-2">
                    The due date has passed, so this assignment
                    can no longer be submitted.
                  </p>

                </div>

              ) : (

                <form onSubmit={handleSubmit}>

                  <label className="block font-bold mb-2">
                    Upload Your Assignment
                  </label>

                  <input
                    type="file"
                    required
                    onChange={(event) => {
                      setSelectedFile(
                        event.target.files &&
                        event.target.files.length > 0
                          ? event.target.files[0]
                          : null
                      )
                    }}
                    className="w-full border border-gray-300 rounded-lg p-3 bg-white"
                  />

                  {selectedFile && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected file: {selectedFile.name}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full mt-5 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-400 text-white p-3 rounded-lg font-semibold"
                  >
                    {uploading
                      ? "Submitting..."
                      : "Submit Assignment"}
                  </button>

                </form>

              )}

            </div>

          )}

        </div>
      </div>
    </div>
  )
}

export default SubmitAssignment

