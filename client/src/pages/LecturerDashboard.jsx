import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../lib/supabase"
import LogoutButton from "../components/LogoutButton"


function LecturerDashboard() {


  const [stats,setStats] = useState({

    courses:0,
    resources:0,
    announcements:0,
    events:0

  })


  const [timetable,setTimetable] = useState([])





  useEffect(()=>{

    getStats()
    getTimetable()

  },[])







  async function getStats(){


    const {count:courses}=await supabase
      .from("courses")
      .select("*",{count:"exact",head:true})



    const {count:resources}=await supabase
      .from("resources")
      .select("*",{count:"exact",head:true})



    const {count:announcements}=await supabase
      .from("announcements")
      .select("*",{count:"exact",head:true})



    const {count:events}=await supabase
      .from("events")
      .select("*",{count:"exact",head:true})




    setStats({

      courses:courses||0,
      resources:resources||0,
      announcements:announcements||0,
      events:events||0

    })

  }









  async function getTimetable(){


    const {data,error}=await supabase
      .from("timetable")
      .select("*")
      .order("day",{ascending:true})



    if(error){

      console.log(error.message)
      return

    }



    setTimetable(data || [])


  }








  return (

    <div className="min-h-screen bg-gray-100">



      <div className="bg-blue-900 text-white px-8 py-6 flex justify-between items-center">


        <div>

          <h1 className="text-3xl font-bold">

            QS Nexus Lecturer Portal

          </h1>


          <p className="text-blue-200 mt-2">

            Welcome back, Lecturer

          </p>


        </div>


        <LogoutButton />


      </div>







      <div className="max-w-7xl mx-auto p-8">





        <div className="grid md:grid-cols-4 gap-6">



          <Card title="Courses" value={stats.courses}/>

          <Card title="Resources" value={stats.resources}/>

          <Card title="Announcements" value={stats.announcements}/>

          <Card title="Events" value={stats.events}/>


        </div>









        <div className="bg-white rounded-xl shadow p-6 mt-8">


          <h2 className="text-2xl font-bold text-blue-900 mb-5">

            My Teaching Schedule

          </h2>




          {
            timetable.length===0 ? (

              <p>
                No timetable available.
              </p>

            )

            :

            timetable.map(item=>(


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

                  🎓 Level: {item.level}

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



        </div>









        <div className="grid md:grid-cols-3 gap-6 mt-8">



          <DashboardLink
            to="/upload-resource"
            title="Upload Resource"
            text="Upload lecture notes and materials."
            color="bg-blue-900"
          />



          <DashboardLink
            to="/manage-resources"
            title="Manage Resources"
            text="Manage uploaded materials."
            color="bg-green-700"
          />



          <DashboardLink
            to="/create-announcement"
            title="Post Announcement"
            text="Send updates to students."
            color="bg-white text-blue-900"
          />



          <DashboardLink
            to="/manage-announcements"
            title="Manage Announcements"
            text="Edit and delete announcements."
            color="bg-orange-600"
          />



          <DashboardLink
            to="/create-event"
            title="Create Event"
            text="Add seminars and department events."
            color="bg-purple-700"
          />



          <DashboardLink
            to="/manage-events"
            title="Manage Events"
            text="Edit and delete events."
            color="bg-gray-800"
          />
          <Link
  to="/timetable"
  className="bg-indigo-700 text-white rounded-xl p-8 shadow hover:bg-indigo-800"
>

  <h2 className="text-2xl font-bold">
    Teaching Schedule
  </h2>

  <p className="mt-3">
    View department timetable and class schedules.
  </p>

</Link>


        </div>




      </div>



    </div>

  )

}







function Card({title,value}){

return(

<div className="bg-white rounded-xl shadow p-6">

<p className="text-gray-500">

{title}

</p>


<h2 className="text-4xl font-bold text-blue-900 mt-3">

{value}

</h2>


</div>

)

}







function DashboardLink({to,title,text,color}){


return(

<Link

to={to}

className={`${color} rounded-xl p-8 shadow`}

>


<h2 className="text-2xl font-bold">

{title}

</h2>


<p className="mt-3">

{text}

</p>


</Link>

)


}






export default LecturerDashboard