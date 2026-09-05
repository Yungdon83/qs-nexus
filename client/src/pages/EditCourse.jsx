import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { supabase } from "../lib/supabase"


function EditCourse() {


  const { id } = useParams()

  const navigate = useNavigate()


  const [form, setForm] = useState({

    course_code: "",
    course_title: "",
    description: "",
    level: "",
    unit: ""

  })


  const [loading, setLoading] = useState(true)



  useEffect(() => {

    getCourse()

  }, [])





  async function getCourse() {


    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .single()



    if(error){

      alert(error.message)
      return

    }



    setForm({

      course_code: data.course_code || "",
      course_title: data.course_title || "",
      description: data.description || "",
      level: data.level || "",
      unit: data.unit || ""

    })


    setLoading(false)


  }







  function handleChange(e){

    setForm({

      ...form,

      [e.target.name]: e.target.value

    })

  }








  async function updateCourse(e){

    e.preventDefault()


    const { error } = await supabase
      .from("courses")
      .update({
        course_code: form.course_code,
        course_title: form.course_title,
        description: form.description,
        level: form.level,
        unit: form.unit,
      })
      .eq("id", id)



    if(error){

      alert(error.message)
      return

    }



    alert("Course updated successfully")


    navigate("/manage-courses")


  }







  if(loading){

    return(

      <div className="p-10 font-bold text-xl">

        Loading course...

      </div>

    )

  }







  return (

    <div className="min-h-screen bg-gray-100 p-8">


      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">


        <h1 className="text-3xl font-bold text-blue-900 mb-6">

          Edit Course

        </h1>





        <form
          onSubmit={updateCourse}
          className="space-y-5"
        >



          <input

            name="course_code"

            value={form.course_code}

            onChange={handleChange}

            placeholder="Course Code"

            className="w-full border p-3 rounded-lg"

            required

          />




          <input

            name="course_title"

            value={form.course_title}

            onChange={handleChange}

            placeholder="Course Title"

            className="w-full border p-3 rounded-lg"

            required

          />





          <input

            name="level"

            value={form.level}

            onChange={handleChange}

            placeholder="Level"

            className="w-full border p-3 rounded-lg"

          />





          <input

            name="unit"

            value={form.unit}

            onChange={handleChange}

            placeholder="Unit"

            className="w-full border p-3 rounded-lg"

          />





          <textarea

            name="description"

            value={form.description}

            onChange={handleChange}

            placeholder="Description"

            className="w-full border p-3 rounded-lg"

          />






          <button

            className="w-full bg-blue-900 text-white p-3 rounded-lg font-semibold"

          >

            Update Course

          </button>




        </form>



      </div>


    </div>

  )

}


export default EditCourse