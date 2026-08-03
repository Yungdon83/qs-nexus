import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import LogoutButton from "../components/LogoutButton"


function StudentDashboard() {

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





  const loadDashboard = async () => {


    const {
      data:{ user }
    } = await supabase.auth.getUser()



    if(!user){

      setLoading(false)
      return

    }





    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()



    setProfile(profileData)





    const { data:coursesData } = await supabase
      .from("courses")
      .select("*")


    if(coursesData)
      setCourses(coursesData)






    const { data:resourcesData } = await supabase
      .from("resources")
      .select("*")


    if(resourcesData)
      setResources(resourcesData)







    const { data:announcementsData } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at",{ascending:false})


    if(announcementsData)
      setAnnouncements(announcementsData)








    const { data:eventsData } = await supabase
      .from("events")
      .select("*")
      .order("event_date",{ascending:true})


    if(eventsData)
      setEvents(eventsData)








    const { data:timetableData } = await supabase
      .from("timetable")
      .select("*")
      .order("day",{ascending:true})


    if(timetableData)
      setTimetable(timetableData)





    setLoading(false)

  }





  const myTimetable = timetable.filter(

    (item)=> item.level === profile?.level

  )






  if(loading){

    return(

      <div className="min-h-screen flex items-center justify-center text-2xl font-bold">

        Loading Dashboard...

      </div>

    )

  }





  return (

    <div className="min-h-screen bg-gray-100">



      <div className="bg-blue-900 text-white px-10 py-6 flex justify-between items-center">


        <div>

          <h1 className="text-3xl font-bold">

            QS Nexus Student Dashboard

          </h1>


          <p className="text-blue-100 mt-2">

            Welcome, {profile?.full_name}

          </p>


        </div>


        <LogoutButton />


      </div>





      <div className="max-w-7xl mx-auto p-8">





        <div className="grid md:grid-cols-6 gap-6">



          <Card title="Department" value={profile?.department}/>

          <Card title="Level" value={profile?.level}/>

          <Card title="Courses" value={courses.length}/>

          <Card title="Resources" value={resources.length}/>

          <Card title="Events" value={events.length}/>

          <Card title="Classes" value={myTimetable.length}/>


        </div>









        <Section title="My Courses">

          {
            courses.length === 0 ?

            <p>No courses available.</p>

            :

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


                <p className="text-sm">

                  Unit: {course.unit}

                </p>


              </div>

            ))

          }

        </Section>









        <Section title="My Timetable">


          {
            myTimetable.length === 0 ?

            <p>No timetable available for your level.</p>

            :

            myTimetable.map(item=>(


              <div
                key={item.id}
                className="border rounded-lg p-5 mb-4 bg-gray-50"
              >


                <h3 className="font-bold text-blue-900 text-lg">

                  {item.course_code}

                </h3>


                <p>

                  {item.course_title}

                </p>


                <p>
                  👨‍🏫 {item.lecturer}
                </p>


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









        <Section title="Learning Resources">


          {
            resources.map(resource=>(


              <div
                key={resource.id}
                className="border rounded-lg p-4 mb-4"
              >


                <h3 className="font-bold">

                  {resource.title}

                </h3>


                <p>

                  {resource.description}

                </p>


                <a
                  href={resource.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-700 font-semibold"
                >

                  Open Resource →

                </a>


              </div>


            ))

          }


        </Section>









        <Section title="Upcoming Events">


          {
            events.map(event=>(


              <div
                key={event.id}
                className="border rounded-lg p-4 mb-4"
              >

                <h3 className="font-bold text-purple-800">

                  {event.title}

                </h3>


                <p>

                  {event.description}

                </p>


                <p>
                  📅 {event.event_date}
                </p>


                <p>
                  📍 {event.location}
                </p>


              </div>


            ))

          }


        </Section>









        <Section title="Latest Announcements">


          {
            announcements.map(item=>(


              <div
                key={item.id}
                className="border-l-4 border-blue-900 bg-gray-50 p-4 mb-4"
              >

                <h3 className="font-bold">

                  {item.title}

                </h3>


                <p>

                  {item.content}

                </p>


              </div>


            ))

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




export default StudentDashboard