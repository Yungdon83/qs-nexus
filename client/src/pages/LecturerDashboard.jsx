import { useEffect, useState } from "react"
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




  async function loadDashboard(){

    try {


      const {
        data:{ user },
        error:userError
      } = await supabase.auth.getUser()



      if(userError){

        console.log(userError.message)

      }



      if(!user){

        setLoading(false)

        return

      }




      // PROFILE

      const {
        data:profileData,
        error:profileError
      } =
      await supabase

      .from("profiles")

      .select("*")

      .eq("id", user.id)

      .maybeSingle()



      if(profileError){

        console.log(
          "PROFILE ERROR:",
          profileError.message
        )

      }


      setProfile(profileData)







      // ASSIGNED COURSES ONLY

      const {
        data:coursesData,
        error:coursesError
      } =
      await supabase

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

      .eq(
        "lecturer_id",
        user.id
      )

      .order(
        "course_code",
        {
          ascending:true
        }
      )



      if(coursesError){

        console.log(
          "COURSE ERROR:",
          coursesError.message
        )

      }


      setCourses(
        coursesData || []
      )







      // RESOURCES

      const {
        data:resourcesData,
        error:resourcesError
      } =
      await supabase

      .from("resources")

      .select("*")

      .eq(
        "uploaded_by",
        user.id
      )

      .order(
        "created_at",
        {
          ascending:false
        }
      )



      if(resourcesError){

        console.log(
          "RESOURCE ERROR:",
          resourcesError.message
        )

      }


      setResources(
        resourcesData || []
      )









      // ANNOUNCEMENTS

      const {
        data:announcementData,
        error:announcementError
      }
      =
      await supabase

      .from("announcements")

      .select("*")

      .eq(
        "posted_by",
        user.id
      )

      .order(
        "created_at",
        {
          ascending:false
        }
      )



      if(announcementError){

        console.log(
          "ANNOUNCEMENT ERROR:",
          announcementError.message
        )

      }


      setAnnouncements(
        announcementData || []
      )









      // EVENTS

      const {
        data:eventData,
        error:eventError
      }
      =
      await supabase

      .from("events")

      .select("*")

      .eq(
        "created_by",
        user.id
      )

      .order(
        "event_date",
        {
          ascending:true
        }
      )



      if(eventError){

        console.log(
          "EVENT ERROR:",
          eventError.message
        )

      }


      setEvents(
        eventData || []
      )







      // TIMETABLE

      const {
        data:timetableData,
        error:timetableError
      }
      =
      await supabase

      .from("timetable")

      .select("*")

      .eq(
        "lecturer",
        profileData?.full_name
      )



      if(timetableError){

        console.log(
          "TIMETABLE ERROR:",
          timetableError.message
        )

      }


      setTimetable(
        timetableData || []
      )



    }

    catch(error){

      console.log(
        "DASHBOARD ERROR:",
        error.message
      )

    }


    setLoading(false)

  }






  if(loading){

    return(

      <div className="p-10 text-xl font-bold">

        Loading lecturer dashboard...

      </div>

    )

  }





  return (

    <div className="min-h-screen bg-gray-100">


      <div className="bg-blue-900 text-white px-10 py-6 flex justify-between">


        <div>

          <h1 className="text-3xl font-bold">

            QS Nexus Lecturer Portal

          </h1>


          <p className="text-blue-200 mt-2">

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







        <Section title="My Assigned Courses">


          {
            courses.length === 0 ? (

              <p>
                No courses assigned yet.
              </p>

            ) : (

              courses.map(course=>(

                <div
                  key={course.id}
                  className="border rounded-lg p-4 mb-4"
                >

                  <h3 className="font-bold text-blue-900">

                    {course.course_code}

                  </h3>


                  <p>
                    {course.course_title}
                  </p>


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

              ))

            )
          }


        </Section>



      </div>


    </div>

  )

}





function Card({title,value}){

  return(

    <div className="bg-white rounded-xl shadow p-5">

      <p className="text-gray-500">
        {title}
      </p>


      <h2 className="text-2xl font-bold text-blue-900">
        {value}
      </h2>

    </div>

  )

}





function Section({title,children}){

  return(

    <div className="bg-white rounded-xl shadow p-6 mt-8">

      <h2 className="text-2xl font-bold mb-5">

        {title}

      </h2>


      {children}


    </div>

  )

}


export default LecturerDashboard