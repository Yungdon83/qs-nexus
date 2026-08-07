import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"


function ManageCourses() {

  const [courses, setCourses] = useState([])
  const [lecturers, setLecturers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLecturers, setSelectedLecturers] = useState({})


  useEffect(() => {

    fetchCourses()
    fetchLecturers()

  }, [])



  async function fetchCourses(){

    const { data, error } = await supabase
      .from("courses")
      .select(`
        *,
        lecturer:profiles(
          id,
          full_name
        )
      `)
      .order("course_code")


    if(error){

      alert(error.message)
      return

    }


    setCourses(data || [])
    setLoading(false)

  }





  async function fetchLecturers(){

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role","lecturer")
      .order("full_name")


    if(error){

      alert(error.message)
      return

    }


    setLecturers(data || [])

  }






  function handleLecturerChange(courseId, lecturerId){

    setSelectedLecturers({

      ...selectedLecturers,

      [courseId]: lecturerId

    })

  }







  async function assignLecturer(courseId){


    const lecturerId =
      selectedLecturers[courseId]


    if(!lecturerId){

      alert("Please select a lecturer")
      return

    }



    const { error } = await supabase
      .from("courses")
      .update({

        lecturer_id: lecturerId

      })
      .eq("id",courseId)



    if(error){

      alert(error.message)
      return

    }


    alert("Lecturer assigned successfully")


    fetchCourses()

  }







  if(loading){

    return (

      <div className="p-10 text-xl font-bold">

        Loading courses...

      </div>

    )

  }






  return (

    <div className="min-h-screen bg-gray-100 p-8">


      <div className="max-w-7xl mx-auto">


        <h1 className="text-3xl font-bold text-blue-900 mb-8">

          Manage Courses

        </h1>





        <div className="bg-white rounded-xl shadow overflow-hidden">


          <table className="w-full">


            <thead className="bg-blue-900 text-white">

              <tr>

                <th className="p-4 text-left">
                  Code
                </th>


                <th className="p-4 text-left">
                  Course
                </th>


                <th className="p-4 text-left">
                  Level
                </th>


                <th className="p-4 text-left">
                  Lecturer
                </th>


                <th className="p-4 text-left">
                  Assign
                </th>


              </tr>


            </thead>






            <tbody>


            {

              courses.map(course=>(


                <tr
                  key={course.id}
                  className="border-b"
                >


                  <td className="p-4 font-bold">

                    {course.course_code}

                  </td>




                  <td className="p-4">

                    {course.course_title}

                  </td>





                  <td className="p-4">

                    {course.level}

                  </td>





                  <td className="p-4">

                    {
                      course.lecturer?.full_name
                      ||
                      "Not assigned"
                    }

                  </td>





                  <td className="p-4">


                    <select

                      className="border rounded p-2"

                      value={
                        selectedLecturers[course.id]
                        ||
                        course.lecturer_id
                        ||
                        ""
                      }

                      onChange={(e)=>
                        handleLecturerChange(
                          course.id,
                          e.target.value
                        )
                      }

                    >


                      <option value="">

                        Select lecturer

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



                    <button

                      onClick={()=>
                        assignLecturer(course.id)
                      }

                      className="ml-2 bg-blue-900 text-white px-3 py-2 rounded"

                    >

                      Save

                    </button>


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


export default ManageCourses