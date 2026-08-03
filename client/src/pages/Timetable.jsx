import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"


function Timetable() {

  const [timetable, setTimetable] = useState([])
  const [loading, setLoading] = useState(true)
  const [level, setLevel] = useState("")



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






  const filteredTimetable = level

    ? timetable.filter(
        (item)=> item.level === level
      )

    : timetable






  if(loading){

    return(

      <div className="p-10 font-bold text-xl">

        Loading timetable...

      </div>

    )

  }






  return (

    <div className="min-h-screen bg-gray-100 p-8">


      <div className="max-w-7xl mx-auto">



        <h1 className="text-3xl font-bold text-blue-900 mb-6">

          Department Timetable

        </h1>






        <select

          value={level}

          onChange={(e)=>setLevel(e.target.value)}

          className="border p-3 rounded-lg mb-6"

        >

          <option value="">
            All Levels
          </option>

          <option value="100L">
            100 Level
          </option>

          <option value="200L">
            200 Level
          </option>

          <option value="300L">
            300 Level
          </option>

          <option value="400L">
            400 Level
          </option>

          <option value="500L">
            500 Level
          </option>


        </select>







        <div className="grid md:grid-cols-2 gap-6">



          {
            filteredTimetable.length === 0 ? (

              <p>
                No timetable available.
              </p>

            ) : (


              filteredTimetable.map((item)=>(


                <div

                  key={item.id}

                  className="bg-white rounded-xl shadow p-6"

                >



                  <h2 className="text-xl font-bold text-blue-900">

                    {item.course_code}

                  </h2>




                  <p className="font-semibold mt-2">

                    {item.course_title}

                  </p>




                  <p>

                    👨‍🏫 Lecturer: {item.lecturer}

                  </p>




                  <p>

                    🎓 Level: {item.level}

                  </p>




                  <p className="mt-3">

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

            )
          }



        </div>



      </div>


    </div>

  )

}


export default Timetable