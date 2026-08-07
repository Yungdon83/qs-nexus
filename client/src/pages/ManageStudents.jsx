import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"



function ManageStudents(){


const [students,setStudents] = useState([])

const [loading,setLoading] = useState(true)

const [search,setSearch] = useState("")





useEffect(()=>{

getStudents()

},[])






async function getStudents(){


setLoading(true)


const {data,error}=await supabase

.from("profiles")

.select("*")

.eq("role","student")

.order("full_name",{ascending:true})




if(error){

alert(error.message)

setLoading(false)

return

}



setStudents(data || [])

setLoading(false)


}








const filteredStudents = students.filter(student=>


student.full_name
?.toLowerCase()
.includes(search.toLowerCase())


||

student.email
?.toLowerCase()
.includes(search.toLowerCase())

)








if(loading){

return(

<div className="p-10 text-xl font-bold">

Loading students...

</div>

)

}








return(


<div className="min-h-screen bg-gray-100 p-8">


<div className="max-w-7xl mx-auto">



<div className="flex justify-between items-center mb-6">


<h1 className="text-3xl font-bold text-blue-900">

Manage Students

</h1>



<button

onClick={getStudents}

className="bg-blue-900 text-white px-5 py-2 rounded-lg"

>

Refresh

</button>



</div>







<input

type="text"

placeholder="Search students..."

value={search}

onChange={(e)=>setSearch(e.target.value)}

className="w-full md:w-96 border rounded-lg p-3 mb-6"

/>









<div className="bg-white rounded-xl shadow overflow-hidden">


<table className="w-full">



<thead className="bg-blue-900 text-white">


<tr>


<th className="p-4 text-left">
Name
</th>


<th className="p-4 text-left">
Email
</th>


<th className="p-4 text-left">
Department
</th>


<th className="p-4 text-left">
Level
</th>


<th className="p-4 text-left">
Role
</th>


</tr>


</thead>







<tbody>


{
filteredStudents.length === 0 ?


<tr>

<td
colSpan="5"
className="p-6 text-center"
>

No students found.

</td>

</tr>


:


filteredStudents.map(student=>(


<tr

key={student.id}

className="border-b hover:bg-gray-50"

>


<td className="p-4 font-semibold">

{student.full_name || "No name"}

</td>




<td className="p-4">

{student.email}

</td>




<td className="p-4">

{student.department}

</td>




<td className="p-4">

{student.level}

</td>




<td className="p-4">

<span className="bg-blue-100 px-3 py-1 rounded">

{student.role}

</span>

</td>




</tr>


))


}



</tbody>


</table>


</div>



</div>


</div>


)

}




export default ManageStudents