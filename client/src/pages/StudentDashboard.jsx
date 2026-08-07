import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import LogoutButton from "../components/LogoutButton"


function StudentDashboard() {


const navigate = useNavigate()


const [profile,setProfile] = useState(null)
const [courses,setCourses] = useState([])
const [resources,setResources] = useState([])
const [announcements,setAnnouncements] = useState([])
const [events,setEvents] = useState([])
const [timetable,setTimetable] = useState([])
const [loading,setLoading] = useState(true)





useEffect(()=>{

loadDashboard()

},[])






const loadDashboard = async()=>{


const {
data:{user}
}=await supabase.auth.getUser()



if(!user){

setLoading(false)
return

}






const {data:profileData}=await supabase

.from("profiles")

.select("*")

.eq("id",user.id)

.maybeSingle()



setProfile(profileData)







const {data:coursesData}=await supabase

.from("courses")

.select("*")


setCourses(coursesData || [])








const {data:resourcesData}=await supabase

.from("resources")

.select("*")


setResources(resourcesData || [])








const {data:announcementsData}=await supabase

.from("announcements")

.select("*")

.order("created_at",{ascending:false})


setAnnouncements(announcementsData || [])








const {data:eventsData}=await supabase

.from("events")

.select("*")

.order("event_date",{ascending:true})


setEvents(eventsData || [])








const {data:timetableData}=await supabase

.from("timetable")

.select("*")

.order("day",{ascending:true})


setTimetable(timetableData || [])




setLoading(false)


}






const myTimetable = timetable.filter(

(item)=>item.level === profile?.level

)






if(loading){

return(

<div className="min-h-screen flex items-center justify-center text-2xl font-bold">

Loading Dashboard...

</div>

)

}






return(


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


<LogoutButton/>


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







<div className="bg-white rounded-xl shadow p-6 mt-8">


<h2 className="text-2xl font-bold text-blue-900 mb-5">

Student Actions

</h2>



<div className="grid md:grid-cols-4 gap-4">


<ActionButton
title="View Assignments"
click={()=>navigate("/student-assignments")}
/>



<ActionButton
title="My Submissions"
click={()=>navigate("/student-submissions")}
/>



<ActionButton
title="Learning Resources"
click={()=>navigate("/resources")}
/>



<ActionButton
title="Announcements"
click={()=>navigate("/student-announcements")}
/>



</div>


</div>







<Section title="My Courses">


{
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


</div>


))

}


</Section>







<Section title="My Timetable">


{
myTimetable.map(item=>(


<div

key={item.id}

className="border rounded-lg p-5 mb-4"

>


<h3 className="font-bold text-blue-900">

{item.course_code}

</h3>


<p>{item.course_title}</p>

<p>👨‍🏫 {item.lecturer}</p>

<p>📅 {item.day}</p>

<p>⏰ {item.start_time} - {item.end_time}</p>

<p>📍 {item.venue}</p>


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






function ActionButton({title,click}){

return(

<button

onClick={click}

className="bg-blue-900 text-white p-4 rounded-lg hover:bg-blue-700"

>

{title}

</button>

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