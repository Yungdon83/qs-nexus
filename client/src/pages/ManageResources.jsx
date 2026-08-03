import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"


function ManageResources() {

  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)



  useEffect(() => {

    fetchResources()

  }, [])



  const fetchResources = async () => {


    const {
      data: { user },
    } = await supabase.auth.getUser()



    if (!user) {

      setLoading(false)
      return

    }




    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("uploaded_by", user.id)
      .order("created_at", { ascending: false })



    if (error) {

      console.log(error.message)

    } else {

      setResources(data)

    }


    setLoading(false)

  }





  const deleteResource = async (id) => {


    const confirmDelete = window.confirm(
      "Delete this resource?"
    )


    if (!confirmDelete) return




    const { error } = await supabase
      .from("resources")
      .delete()
      .eq("id", id)



    if (error) {

      alert(error.message)

    } else {

      setResources(
        resources.filter(
          (resource) => resource.id !== id
        )
      )

    }


  }





  if (loading) {

    return (

      <div className="p-10 text-xl">
        Loading resources...
      </div>

    )

  }




  return (

    <div className="min-h-screen bg-gray-100 p-8">


      <div className="max-w-6xl mx-auto">


        <h1 className="text-3xl font-bold text-blue-900 mb-8">

          My Uploaded Resources

        </h1>




        {resources.length === 0 ? (

          <div className="bg-white rounded-xl shadow p-8">

            You have not uploaded any resources yet.

          </div>


        ) : (


          <div className="grid md:grid-cols-2 gap-6">


            {resources.map((resource)=>(


              <div
                key={resource.id}
                className="bg-white rounded-xl shadow p-6"
              >


                <h2 className="text-xl font-bold text-blue-900">

                  {resource.title}

                </h2>



                <p className="mt-2 text-gray-600">

                  {resource.description}

                </p>




                <p className="mt-3 text-sm text-gray-500">

                  Course: {resource.course_code}

                </p>



                <p className="text-sm text-gray-500">

                  Level: {resource.level}

                </p>





                <div className="flex gap-3 mt-5">


                  <a

                    href={resource.file_url}

                    target="_blank"

                    rel="noreferrer"

                    className="bg-blue-900 text-white px-4 py-2 rounded-lg"

                  >

                    Open File

                  </a>




                  <button

                    onClick={() => deleteResource(resource.id)}

                    className="bg-red-600 text-white px-4 py-2 rounded-lg"

                  >

                    Delete

                  </button>



                </div>



              </div>


            ))}


          </div>


        )}



      </div>


    </div>

  )

}


export default ManageResources