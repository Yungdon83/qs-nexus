
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../lib/supabase"
import LogoutButton from "../components/LogoutButton"

function LecturerDashboard() {
  const [profile, setProfile] = useState(null)

  const [courses, setCourses] = useState([])
  const [resources, setResources] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [events, setEvents] = useState([])
  const [timetable, setTimetable] = useState([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.log(userError.message)
      }

      if (!user) {
        setLoading(false)
        return
      }

      // PROFILE
      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) {
        console.log(
          "PROFILE ERROR:",
          profileError.message
        )
      }

      setProfile(profileData)

      // ASSIGNED COURSES
      const {
        data: coursesData,
        error: coursesError,
      } = await supabase
        .from("courses")
        .select(`
          id,
          course_code,
          course_title,
          unit,
          level,
          semester,
          department
        `)
        .eq("lecturer_id", user.id)
        .order("course_code", {
          ascending: true,
        })

      if (coursesError) {
        console.log(
          "COURSE ERROR:",
          coursesError.message
        )
      }

      setCourses(coursesData || [])

      // RESOURCES
      const {
        data: resourcesData,
        error: resourcesError,
      } = await supabase
        .from("resources")
        .select("*")
        .eq("uploaded_by", user.id)
        .order("created_at", {
          ascending: false,
        })

      if (resourcesError) {
        console.log(
          "RESOURCE ERROR:",
          resourcesError.message
        )
      }

      setResources(resourcesData || [])

      // ANNOUNCEMENTS
      const {
        data: announcementData,
        error: announcementError,
      } = await supabase
        .from("announcements")
        .select("*")
        .eq("posted_by", user.id)
        .order("created_at", {
          ascending: false,
        })

      if (announcementError) {
        console.log(
          "ANNOUNCEMENT ERROR:",
          announcementError.message
        )
      }

      setAnnouncements(announcementData || [])

      // EVENTS
      const {
        data: eventData,
        error: eventError,
      } = await supabase
        .from("events")
        .select("*")
        .eq("created_by", user.id)
        .order("event_date", {
          ascending: true,
        })

      if (eventError) {
        console.log(
          "EVENT ERROR:",
          eventError.message
        )
      }

      setEvents(eventData || [])

      // TIMETABLE
      const {
        data: timetableData,
        error: timetableError,
      } = await supabase
        .from("timetable")
        .select("*")
        .eq("lecturer", profileData?.full_name)

      if (timetableError) {
        console.log(
          "TIMETABLE ERROR:",
          timetableError.message
        )
      }

      setTimetable(timetableData || [])
    } catch (error) {
      console.log(
        "DASHBOARD ERROR:",
        error.message
      )
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="p-10 text-xl font-bold text-blue-900">
          Loading lecturer dashboard...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <div className="bg-blue-900 text-white px-6 md:px-10 py-6 flex flex-col md:flex-row justify-between gap-5">

        <div>
          <h1 className="text-3xl font-bold">
            QS Nexus Lecturer Portal
          </h1>

          <p className="text-blue-200 mt-2">
            Welcome, {profile?.full_name || "Lecturer"}
          </p>

          <p className="text-blue-300 text-sm mt-1">
            {profile?.department || "Quantity Surveying"}
          </p>
        </div>

        <div className="flex items-center">
          <LogoutButton />
        </div>

      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-8">

        {/* STATISTICS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

          <Card
            title="My Courses"
            value={courses.length}
          />

          <Card
            title="Resources"
            value={resources.length}
          />

          <Card
            title="Announcements"
            value={announcements.length}
          />

          <Card
            title="Events"
            value={events.length}
          />

          <Card
            title="Classes"
            value={timetable.length}
          />

        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-white rounded-xl shadow p-6 mt-8">

          <h2 className="text-2xl font-bold text-gray-900 mb-5">
            Lecturer Tools
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <ActionCard
              to="/create-assignment"
              title="Create Assignment"
              description="Give students new assignments"
            />

            <ActionCard
              to="/manage-assignments"
              title="Manage Assignments"
              description="View and manage your assignments"
            />

            <ActionCard
              to="/grade-submissions"
              title="Grade Submissions"
              description="Review and grade student work"
            />

            <ActionCard
              to="/upload-resource"
              title="Upload Resource"
              description="Upload slides, PDFs and materials"
            />

            <ActionCard
              to="/manage-resources"
              title="Manage Resources"
              description="Manage your uploaded materials"
            />

            <ActionCard
              to="/create-announcement"
              title="Create Announcement"
              description="Send information to students"
            />

            <ActionCard
              to="/manage-announcements"
              title="Manage Announcements"
              description="Edit or manage announcements"
            />

            <ActionCard
              to="/create-event"
              title="Create Event"
              description="Create a department event"
            />

            <ActionCard
              to="/manage-events"
              title="Manage Events"
              description="Manage your department events"
            />

            <ActionCard
              to="/timetable"
              title="View Timetable"
              description="View the department timetable"
            />

          </div>

        </div>

        {/* ASSIGNED COURSES */}
        <Section title="My Assigned Courses">

          {courses.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-500">
                No courses assigned yet.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">

              {courses.map((course) => (
                <div
                  key={course.id}
                  className="border rounded-lg p-5 hover:shadow-md transition"
                >

                  <h3 className="font-bold text-blue-900 text-lg">
                    {course.course_code}
                  </h3>

                  <p className="text-gray-800 mt-1">
                    {course.course_title}
                  </p>

                  <div className="text-sm text-gray-500 mt-3 space-y-1">
                    <p>
                      Unit: {course.unit}
                    </p>

                    <p>
                      Level: {course.level}
                    </p>

                    <p>
                      Semester: {course.semester}
                    </p>
                  </div>

                </div>
              ))}

            </div>
          )}

        </Section>

      </div>

    </div>
  )
}

function Card({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-5">

      <p className="text-gray-500 text-sm">
        {title}
      </p>

      <h2 className="text-2xl font-bold text-blue-900 mt-1">
        {value}
      </h2>

    </div>
  )
}

function ActionCard({
  to,
  title,
  description,
}) {
  return (
    <Link
      to={to}
      className="border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition bg-gray-50"
    >

      <h3 className="font-bold text-blue-900">
        {title}
      </h3>

      <p className="text-sm text-gray-600 mt-2">
        {description}
      </p>

      <p className="text-sm text-blue-700 font-semibold mt-4">
        Open →
      </p>

    </Link>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8">

      <h2 className="text-2xl font-bold mb-5">
        {title}
      </h2>

      {children}

    </div>
  )
}

export default LecturerDashboard

