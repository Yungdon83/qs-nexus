import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { supabase } from "../lib/supabase"


function EditTimetable() {

  const { id } = useParams()
  const navigate = useNavigate()


  const [form, setForm] = useState({

    course_code: "",
    course_title: "",
    lecturer: "",
    level: "",
    day: "",
    start_time: "",
    end_time: "",
    venue: "",

  })


  const [loading, setLoading] = useState(true)





  useEffect(()=>{

    getTimetable()

  },[])







  async function getTimetable(){


    const { data, error } = await supabase
      .from("timetable")
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
      lecturer: data.lecturer || "",
      level: data.level || "",
      day: data.day || "",
      start_time: data.start_time || "",
      end_time: data.end_time || "",
      venue: data.venue || "",

    })



    setLoading(false)


  }







  function handleChange(e){

    setForm({

      ...form,

      [e.target.name]: e.target.value

    })

  }







  async function updateTimetable(e){

    e.preventDefault()



    const { error } = await supabase
      .from("timetable")
      .update(form)
      .eq("id", id)



    if(error){

      alert(error.message)
      return

    }



    alert("Timetable updated successfully")

    navigate("/manage-timetable")


  }








  if(loading){

    return(

      <div className="p-10 font-bold">

        Loading timetable...

      </div>

    )

  }







  return(

    <div className="min-h-screen bg-gray-100 p-8">


      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">


        <h1 className="text-3xl font-bold text-blue-900 mb-6">

          Edit Timetable

        </h1>





        <form
          onSubmit={updateTimetable}
          className="grid md:grid-cols-2 gap-4"
        >



          {
            Object.keys(form).map((field)=>(


              <input

                key={field}

                name={field}

                value={form[field]}

                onChange={handleChange}

                placeholder={
                  field.replace("_"," ").toUpperCase()
                }

                className="border p-3 rounded-lg"

                required

              />


            ))
          }





          <button

            className="bg-blue-900 text-white p-3 rounded-lg md:col-span-2"

          >

            Update Timetable

          </button>




        </form>



      </div>


    </div>

  )


}


export default EditTimetable