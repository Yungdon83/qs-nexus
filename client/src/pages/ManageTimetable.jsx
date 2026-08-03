import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { Link } from "react-router-dom"

function ManageTimetable() {

  const [timetable, setTimetable] = useState([])
  const [loading, setLoading] = useState(true)


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




  useEffect(() => {

    getTimetable()

  }, [])





  async function getTimetable() {


    const { data, error } = await supabase
      .from("timetable")
      .select("*")
      .order("day", { ascending: true })



    if(error){

      alert(error.message)
      return

    }


    setTimetable(data || [])

    setLoading(false)

  }






  function handleChange(e){

    setForm({

      ...form,

      [e.target.name]: e.target.value

    })

  }






  async function addTimetable(e){

    e.preventDefault()



    const { error } = await supabase
      .from("timetable")
      .insert(form)



    if(error){

      alert(error.message)
      return

    }



    alert("Timetable added successfully")



    setForm({

      course_code:"",
      course_title:"",
      lecturer:"",
      level:"",
      day:"",
      start_time:"",
      end_time:"",
      venue:""

    })



    getTimetable()

  }








  async function deleteTimetable(id){


    const confirmDelete = window.confirm(
      "Delete this timetable entry?"
    )


    if(!confirmDelete) return



    const { error } = await supabase
      .from("timetable")
      .delete()
      .eq("id", id)



    if(error){

      alert(error.message)
      return

    }



    getTimetable()

  }








  if(loading){

    return(

      <div className="p-10 font-bold text-xl">

        Loading timetable...

      </div>

    )

  }






  return(

    <div className="min-h-screen bg-gray-100 p-8">


      <div className="max-w-7xl mx-auto">



        <h1 className="text-3xl font-bold text-blue-900 mb-6">

          Manage Timetable

        </h1>







        <div className="bg-white rounded-xl shadow p-6 mb-8">


          <h2 className="text-2xl font-bold mb-5">

            Add Timetable Entry

          </h2>





          <form
            onSubmit={addTimetable}
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

              Add Timetable

            </button>



          </form>


        </div>







        <div className="grid md:grid-cols-2 gap-6">



          {
            timetable.map((item)=>(


              <div

                key={item.id}

                className="bg-white rounded-xl shadow p-6"

              >



                <h2 className="text-xl font-bold text-blue-900">

                  {item.course_code}

                </h2>



                <p className="font-semibold">

                  {item.course_title}

                </p>



                <p>

                  Lecturer: {item.lecturer}

                </p>



                <p>

                  Level: {item.level}

                </p>



                <p className="mt-2">

                  📅 {item.day}

                </p>



                <p>

                  ⏰ {item.start_time} - {item.end_time}

                </p>



                <p>

                  📍 {item.venue}

                </p>





                <div className="flex gap-3 mt-5">

  <Link

    to={`/edit-timetable/${item.id}`}

    className="bg-blue-900 text-white px-4 py-2 rounded-lg"

  >

    Edit

  </Link>



  <button

    onClick={()=>deleteTimetable(item.id)}

    className="bg-red-600 text-white px-4 py-2 rounded-lg"

  >

    Delete

  </button>

</div>



              </div>


            ))
          }



        </div>




      </div>


    </div>


  )

}


export default ManageTimetable