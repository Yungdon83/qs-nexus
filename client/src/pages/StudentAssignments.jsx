
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../lib/supabase"

function StudentAssignments() {
  const [assignments, setAssignments] = useState([])
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

      const { data: profileData, error: profileError } =
        await supabase
          .from("profiles")
          .select("id, full_name, level, department")
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

      if (!profileData.level) {
        setAssignments([])
        setLoading(false)
        return
      }

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
    } catch (error) {
      console.error(error)
      alert("Unable to load assignments.")
    }

    setLoading(false)
  }

  function isOverdue(dueDate) {
    if (!dueDate) {
      return false
    }

    return new Date(dueDate) < new Date()
  }

  function formatDate(date) {
    if (!date) {
      return "No due date"
    }

    const formattedDate = new Date(date)

    if (Number.isNaN(formattedDate.getTime())) {
      return "Invalid date"
    }

    return formattedDate.toLocaleString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl font-bold text-blue-900">
          Loading assignments...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-6xl mx-auto">

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-blue-900">
            My Assignments
          </h1>

          <p className="text-gray-600 mt-2">
            Assignments for{" "}
            {profile?.level || "your level"}{" "}
            -{" "}
            {profile?.department || "your department"}
          </p>

        </div>

        {assignments.length === 0 ? (

          <div className="bg-white rounded-xl shadow p-8 text-center">

            <h2 className="text-xl font-bold text-gray-700">
              No assignments available
            </h2>

            <p className="text-gray-500 mt-2">
              There are currently no assignments for your level.
            </p>

          </div>

        ) : (

          <div className="grid md:grid-cols-2 gap-6">

            {assignments.map((assignment) => {

              const overdue = isOverdue(
                assignment.due_date
              )

              return (

                <div
                  key={assignment.id}
                  className="bg-white rounded-xl shadow p-6"
                >

                  <div className="flex justify-between items-start gap-4">

                    <div>

                      <p className="text-sm font-bold text-blue-700">
                        {assignment.course_code || "Course"}
                      </p>

                      <h2 className="text-xl font-bold text-gray-900 mt-1">
                        {assignment.title}
                      </h2>

                    </div>

                    {overdue ? (

                      <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">
                        Overdue
                      </span>

                    ) : (

                      <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                        Open
                      </span>

                    )}

                  </div>

                  <p className="text-gray-600 mt-4 whitespace-pre-wrap">
                    {assignment.description ||
                      "No description provided."}
                  </p>

                  <div className="mt-5 bg-gray-50 rounded-lg p-4">

                    <p className="text-sm text-gray-500">
                      Due Date
                    </p>

                    <p className="font-semibold">
                      {formatDate(
                        assignment.due_date
                      )}
                    </p>

                  </div>

                  <Link
                    to={
                      "/submit-assignment/" +
                      assignment.id
                    }
                    className={
                      overdue
                        ? "block text-center mt-5 w-full p-3 rounded-lg font-semibold bg-gray-400 text-white hover:bg-gray-500"
                        : "block text-center mt-5 w-full p-3 rounded-lg font-semibold bg-blue-900 text-white hover:bg-blue-800"
                    }
                  >
                    {overdue
                      ? "View Assignment"
                      : "Submit Assignment"}
                  </Link>

                </div>

              )
            })}

          </div>

        )}

      </div>

    </div>
  )
}

export default StudentAssignments
