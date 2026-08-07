import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"


function UploadResource(){

  const [courses,setCourses] = useState([])

  const [file,setFile] = useState(null)

  const [loading,setLoading] = useState(false)


  const [form,setForm] = useState({

    title:"",
    description:"",
    resource_type:"Lecture Note",
    course_code:"",
    level:"",
    department:"Quantity Surveying"

  })



  useEffect(()=>{

    getCourses()

  },[])



  async function getCourses(){


    const {
      data:{user}
    } = await supabase.auth.getUser()



    if(!user)
      return



    const {data,error}=await supabase

      .from("courses")

      .select(`
        course_code,
        course_title,
        level
      `)

      .eq(
        "lecturer_id",
        user.id
      )

      .order("course_code")



    if(error){

      alert(error.message)
      return

    }


    setCourses(data || [])


  }





  function handleChange(e){

    setForm({

      ...form,

      [e.target.name]:e.target.value

    })

  }





  async function uploadResource(e){

    e.preventDefault()



    if(!file){

      alert("Select a file first")
      return

    }



    setLoading(true)



    const {
      data:{user}
    } = await supabase.auth.getUser()





    const fileName =
      `${Date.now()}-${file.name}`





    const {
      error:uploadError
    } = await supabase.storage

      .from("resources")

      .upload(
        fileName,
        file
      )



    if(uploadError){

      alert(uploadError.message)

      setLoading(false)

      return

    }





    const {
      data:urlData
    } =
    supabase.storage

    .from("resources")

    .getPublicUrl(fileName)





    const selectedCourse =
      courses.find(
        course =>
        course.course_code === form.course_code
      )






    const {error:dbError}=await supabase

      .from("resources")

      .insert({

        title:form.title,

        description:form.description,

        resource_type:form.resource_type,

        course_code:form.course_code,

        file_url:urlData.publicUrl,

        level:selectedCourse?.level,

        department:form.department,

        uploaded_by:user.id

      })




    if(dbError){

      alert(dbError.message)

      setLoading(false)

      return

    }



    alert("Resource uploaded successfully")



    setForm({

      title:"",
      description:"",
      resource_type:"Lecture Note",
      course_code:"",
      level:"",
      department:"Quantity Surveying"

    })


    setFile(null)

    setLoading(false)


  }






  return (

    <div className="min-h-screen bg-gray-100 p-8">


      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">


        <h1 className="text-3xl font-bold text-blue-900 mb-6">

          Upload Resource

        </h1>




        <form
          onSubmit={uploadResource}
          className="space-y-4"
        >



          <input

            name="title"

            value={form.title}

            onChange={handleChange}

            placeholder="Resource title"

            className="w-full border p-3 rounded"

            required

          />





          <textarea

            name="description"

            value={form.description}

            onChange={handleChange}

            placeholder="Description"

            className="w-full border p-3 rounded"

          />





          <select

            name="resource_type"

            value={form.resource_type}

            onChange={handleChange}

            className="w-full border p-3 rounded"

          >

            <option>
              Lecture Note
            </option>

            <option>
              Past Question
            </option>

            <option>
              Assignment
            </option>

            <option>
              Other
            </option>


          </select>






          <select

            name="course_code"

            value={form.course_code}

            onChange={handleChange}

            className="w-full border p-3 rounded"

            required

          >

            <option value="">

              Select Course

            </option>


            {
              courses.map(course=>(

                <option
                  key={course.course_code}
                  value={course.course_code}
                >

                  {course.course_code}
                  -
                  {course.course_title}

                </option>

              ))

            }


          </select>






          <input

            type="file"

            onChange={
              e=>setFile(e.target.files[0])
            }

            className="w-full"

            required

          />






          <button

            disabled={loading}

            className="w-full bg-blue-900 text-white p-3 rounded"

          >

            {
              loading
              ?
              "Uploading..."
              :
              "Upload Resource"
            }


          </button>




        </form>


      </div>


    </div>

  )

}


export default UploadResource