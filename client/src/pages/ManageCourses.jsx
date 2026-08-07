import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"


function ManageCourses() {


  const [courses,setCourses] = useState([])

  const [lecturers,setLecturers] = useState([])

  const [loading,setLoading] = useState(true)

  const [search,setSearch] = useState("")



  const [form,setForm] = useState({

    course_code:"",
    course_title:"",
    description:"",
    level:"",
    unit:"",
    lecturer_id:""

  })







  useEffect(()=>{

    getCourses()
    getLecturers()

  },[])







  async function getCourses(){


    const {data,error}=await supabase

      .from("courses")

      .select(`
        *,
        profiles:lecturer_id(
          full_name
        )
      `)

      .order("course_code",{ascending:true})



    if(error){

      alert(error.message)
      return

    }


    setCourses(data || [])

    setLoading(false)

  }








  async function getLecturers(){


    const {data,error}=await supabase

      .from("profiles")

      .select("*")

      .eq("role","lecturer")

      .order("full_name",{ascending:true})



    if(error){

      alert(error.message)
      return

    }


    setLecturers(data || [])


  }








  function handleChange(e){


    setForm({

      ...form,

      [e.target.name]:e.target.value

    })


  }









  async function addCourse(e){


    e.preventDefault()



    const {error}=await supabase

      .from("courses")

      .insert({

        course_code:form.course_code,

        course_title:form.course_title,

        description:form.description,

        level:form.level,

        unit:form.unit,

        lecturer_id:form.lecturer_id

      })



    if(error){

      alert(error.message)
      return

    }



    alert("Course added successfully")



    setForm({

      course_code:"",
      course_title:"",
      description:"",
      level:"",
      unit:"",
      lecturer_id:""

    })



    getCourses()


  }









  async function deleteCourse(id){


    const confirmDelete = window.confirm(
      "Delete this course?"
    )


    if(!confirmDelete) return



    const {error}=await supabase

      .from("courses")

      .delete()

      .eq("id",id)



    if(error){

      alert(error.message)
      return

    }



    getCourses()


  }








  const filteredCourses = courses.filter(course=>

    course.course_code
    ?.toLowerCase()
    .includes(search.toLowerCase())

    ||

    course.course_title
    ?.toLowerCase()
    .includes(search.toLowerCase())

  )








  if(loading){

    return(

      <div className="p-10 font-bold text-xl">

        Loading courses...

      </div>

    )

  }







  return(


<div className="min-h-screen bg-gray-100 p-8">


<div className="max-w-7xl mx-auto">



<h1 className="text-3xl font-bold text-blue-900 mb-6">

Manage Courses

</h1>







<div className="bg-white rounded-xl shadow p-6 mb-8">


<h2 className="text-2xl font-bold mb-5">

Add New Course

</h2>




<form
onSubmit={addCourse}
className="grid md:grid-cols-2 gap-4"
>



<input

name="course_code"

value={form.course_code}

onChange={handleChange}

placeholder="Course Code"

className="border p-3 rounded-lg"

required

/>





<input

name="course_title"

value={form.course_title}

onChange={handleChange}

placeholder="Course Title"

className="border p-3 rounded-lg"

required

/>






<input

name="level"

value={form.level}

onChange={handleChange}

placeholder="Level e.g 100L"

className="border p-3 rounded-lg"

/>





<input

name="unit"

value={form.unit}

onChange={handleChange}

placeholder="Unit"

className="border p-3 rounded-lg"

/>







<select

name="lecturer_id"

value={form.lecturer_id}

onChange={handleChange}

className="border p-3 rounded-lg md:col-span-2"

required

>


<option value="">

Select Lecturer

</option>


{

lecturers.map(lecturer=>(

<option

key={lecturer.id}

value={lecturer.id}

>

{lecturer.full_name}

</option>

))

}



</select>







<textarea

name="description"

value={form.description}

onChange={handleChange}

placeholder="Description"

className="border p-3 rounded-lg md:col-span-2"

/>






<button

className="bg-blue-900 text-white p-3 rounded-lg md:col-span-2"

>

Add Course

</button>



</form>


</div>









<input

placeholder="Search courses..."

value={search}

onChange={(e)=>setSearch(e.target.value)}

className="border rounded-lg p-3 w-full md:w-96 mb-6"

/>









<div className="grid md:grid-cols-2 gap-6">



{

filteredCourses.map(course=>(


<div

key={course.id}

className="bg-white rounded-xl shadow p-6"

>


<h2 className="text-xl font-bold text-blue-900">

{course.course_code}

</h2>



<p className="font-semibold mt-2">

{course.course_title}

</p>



<p className="text-gray-600">

{course.description}

</p>



<p className="mt-3">

Level: {course.level}

</p>


<p>

Unit: {course.unit}

</p>



<p className="mt-3 font-semibold text-green-700">

Lecturer: {course.profiles?.full_name || "Not Assigned"}

</p>






<button

onClick={()=>deleteCourse(course.id)}

className="bg-red-600 text-white px-4 py-2 rounded-lg mt-5"

>

Delete

</button>



</div>


))

}



</div>



</div>


</div>


  )


}


export default ManageCourses