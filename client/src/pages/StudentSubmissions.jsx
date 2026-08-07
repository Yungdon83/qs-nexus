import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"



function StudentSubmissions(){


const [submissions,setSubmissions] = useState([])

const [loading,setLoading] = useState(true)





useEffect(()=>{

loadSubmissions()

},[])







async function loadSubmissions(){


const {
data:{user}
}=await supabase.auth.getUser()



if(!user){

setLoading(false)

return

}





const {data,error}=await supabase

.from("submissions")

.select(`

*,

assignments(

title,

course_code,

deadline

)

`)

.eq("student_id",user.id)

.order("submitted_at",{

ascending:false

})





if(error){

console.log(error.message)

}

else{

setSubmissions(data || [])

}



setLoading(false)


}







if(loading){

return(

<div className="p-10 text-xl font-bold">

Loading submissions...

</div>

)

}







return(


<div className="min-h-screen bg-gray-100 p-8">


<div className="max-w-5xl mx-auto">



<h1 className="text-3xl font-bold text-blue-900 mb-8">

My Assignment Submissions

</h1>





{
submissions.length === 0 ?


<div className="bg-white rounded-xl shadow p-6">

No submissions yet.

</div>



:


submissions.map(item=>(


<div

key={item.id}

className="bg-white rounded-xl shadow p-6 mb-5"

>


<h2 className="text-xl font-bold">

{item.assignments?.title}

</h2>



<p>

Course:

{" "}

{item.assignments?.course_code}

</p>



<a

href={item.file_url}

target="_blank"

rel="noreferrer"

className="text-blue-700 underline"

>

View Submitted File

</a>





<div className="mt-4">


<p>

Grade:

{" "}

<span className="font-bold">

{item.grade || "Not graded"}

</span>

</p>




<p>

Feedback:

{" "}

{item.feedback || "No feedback yet"}

</p>


</div>




</div>


))


}





</div>


</div>


)

}



export default StudentSubmissions