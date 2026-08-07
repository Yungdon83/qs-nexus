import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"


function StudentAnnouncements(){


const [announcements,setAnnouncements] = useState([])

const [loading,setLoading] = useState(true)





useEffect(()=>{

loadAnnouncements()

},[])





async function loadAnnouncements(){


const {data,error}=await supabase

.from("announcements")

.select("*")

.order("created_at",{

ascending:false

})





if(error){

console.log(error.message)

}

else{

setAnnouncements(data || [])

}



setLoading(false)


}







if(loading){

return(

<div className="p-10 text-xl font-bold">

Loading announcements...

</div>

)

}






return(


<div className="min-h-screen bg-gray-100 p-8">


<div className="max-w-5xl mx-auto">


<h1 className="text-3xl font-bold text-blue-900 mb-8">

Latest Announcements

</h1>





{
announcements.length === 0 ?


<div className="bg-white rounded-xl shadow p-6">

No announcements available.

</div>


:


announcements.map(item=>(


<div

key={item.id}

className="bg-white rounded-xl shadow p-6 mb-5"

>


<h2 className="text-xl font-bold text-blue-900">

{item.title}

</h2>



<p className="mt-3">

{item.content}

</p>



<p className="text-sm text-gray-500 mt-4">

Posted: {new Date(item.created_at).toLocaleDateString()}

</p>


</div>


))


}





</div>


</div>


)

}



export default StudentAnnouncements