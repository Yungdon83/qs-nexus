import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import LogoutButton from "../components/LogoutButton"


function LecturerDashboard() {

  const navigate = useNavigate()

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

    const {
      data: { user }
    } = await supabase.auth.getUser()


    if (!user) {

      setLoading(false)
      return

    }



    const { data: profileData } = await supabase

      .from("profiles")

      .select("*")

      .eq("id", user.id)

      .single()



    setProfile(profileData)



    const { data: coursesData } = await supabase

      .from("courses")

      .select("*")

      .eq("lecturer_id", user.id)


    setCourses(coursesData || [])




    const { data: resourcesData } = await supabase

      .from("resources")

      .select("*")

      .eq("uploaded_by", user.id)

      .order("created_at", {
        ascending:false
      })


    setResources(resourcesData || [])




    const { data: announcementData } = await supabase

      .from("announcements")

      .select("*")

      .eq("posted_by", user.id)

      .order("created_at", {
        ascending:false
      })


    setAnnouncements(announcementData || [])




    const { data: eventData } = await supabase

      .from("events")

      .select("*")

      .eq("created_by", user.id)

      .order("event_date", {
        ascending:true
      })


    setEvents(eventData || [])




    const { data: timetableData } = await supabase

      .from("timetable")

      .select("*")

      .eq("lecturer", profileData?.full_name)


    setTimetable(timetableData || [])



    setLoading(false)

  }





  if (loading) {

    return (

      <div className="p-10 text-xl font-bold">

        Loading lecturer dashboard...

      </div>

    )

  }





  return (

    <div className="min-h-screen bg-gray-100">


      <div className="bg-blue-900 text-white px-10 py-6 flex justify-between items-center">


        <div>

          <h1 className="text-3xl font-bold">

            QS Nexus Lecturer Portal

          </h1>


          <p className="mt-2 text-blue-200">

            Welcome {profile?.full_name}

          </p>

        </div>



        <LogoutButton />


      </div>





      <div className="max-w-7xl mx-auto p-8">


        <div className="grid md:grid-cols-5 gap-5">


          <Card title="My Courses" value={courses.length}/>

          <Card title="Resources" value={resources.length}/>

          <Card title="Announcements" value={announcements.length}/>

          <Card title="Events" value={events.length}/>

          <Card title="Classes" value={timetable.length}/>


        </div>





        <div className="mt-8 bg-white rounded-xl shadow p-6">


          <h2 className="text-2xl font-bold text-blue-900 mb-5">

            Lecturer Actions

          </h2>



          <div className="grid md:grid-cols-3 gap-4">


            <ActionButton
              title="Create Assignment"
              click={() => navigate("/create-assignment")}
            />


            <ActionButton
              title="Manage Assignments"
              click={() => navigate("/manage-assignments")}
            />


            <ActionButton
              title="Grade Submissions"
              click={() => navigate("/grade-submissions")}
            />


            <ActionButton
              title="Upload Resource"
              click={() => navigate("/upload-resource")}
            />


            <ActionButton
              title="Create Announcement"
              click={() => navigate("/create-announcement")}
            />


            <ActionButton
              title="Manage Announcements"
              click={() => navigate("/manage-announcements")}
            />


          </div>


        </div>






        <Section title="My Courses">


          {
            courses.map(course => (

              <div
                key={course.id}
                className="bg-white border rounded-lg p-4 mb-4"
              >

                <h3 className="font-bold text-blue-900">

                  {course.course_code}

                </h3>


                <p>

                  {course.course_title}

                </p>


                <p>

                  Level: {course.level}

                </p>


              </div>

            ))
          }


        </Section>







        <Section title="My Teaching Schedule">


          {
            timetable.map(item => (

              <div
                key={item.id}
                className="bg-white border rounded-lg p-4 mb-4"
              >

                <h3 className="font-bold">

                  {item.course_code}

                </h3>


                <p>
                  📅 {item.day}
                </p>


                <p>
                  ⏰ {item.start_time} - {item.end_time}
                </p>


                <p>
                  📍 {item.venue}
                </p>


              </div>

            ))
          }


        </Section>







        <Section title="My Resources">


          {
            resources.map(resource => (

              <div
                key={resource.id}
                className="bg-white border rounded-lg p-4 mb-4"
              >

                <h3 className="font-bold">

                  {resource.title}

                </h3>


                <a
                  href={resource.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-700"
                >

                  Open Resource →

                </a>


              </div>

            ))
          }


        </Section>



      </div>


    </div>

  )

}






function Card({title,value}) {

  return (

    <div className="bg-white rounded-xl shadow p-5">

      <h3 className="font-bold text-gray-600">

        {title}

      </h3>


      <p className="text-3xl font-bold text-blue-900">

        {value}

      </p>


    </div>

  )

}






function ActionButton({title,click}) {

  return (

    <button

      onClick={click}

      className="bg-blue-900 text-white p-4 rounded-lg hover:bg-blue-700"

    >

      {title}

    </button>

  )

}






function Section({title,children}) {

  return (

    <div className="mt-10">


      <h2 className="text-2xl font-bold text-blue-900 mb-5">

        {title}

      </h2>



      <div>

        {children}

      </div>



    </div>

  )

}



export default LecturerDashboard