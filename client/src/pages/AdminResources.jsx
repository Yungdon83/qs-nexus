import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { openResourceFile } from "../utils/resourceStorage"
 
function AdminResources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    getResources()
  }, [])

  async function openResource(resource) {
    try {
      await openResourceFile(resource.file_url)
    } catch (openError) {
      console.error("RESOURCE FILE ERROR:", openError)
      alert("This file is currently unavailable. Please try again later.")
    }
  }

  async function getResources() {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      alert(error.message)
      return
    }

    setResources(data || [])
    setLoading(false)
  }





  async function deleteResource(id) {


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
      return

    }



    getResources()


  }





  const filteredResources = resources.filter((resource)=>

    resource.title
      ?.toLowerCase()
      .includes(search.toLowerCase())

    ||

    resource.description
      ?.toLowerCase()
      .includes(search.toLowerCase())

  )





  if (loading) {

    return (

      <div className="p-10 font-bold text-xl">

        Loading resources...

      </div>

    )

  }





  return (

    <div className="min-h-screen bg-gray-100 p-8">


      <div className="max-w-7xl mx-auto">


        <h1 className="text-3xl font-bold text-blue-900 mb-6">

          Manage Resources

        </h1>





        <input

          type="text"

          placeholder="Search resources..."

          value={search}

          onChange={(e)=>setSearch(e.target.value)}

          className="border rounded-lg p-3 w-full md:w-96 mb-6"

        />






        <div className="grid md:grid-cols-2 gap-6">



          {filteredResources.length === 0 ? (

            <p>
              No resources available.
            </p>

          ) : (


            filteredResources.map((resource)=>(


              <div

                key={resource.id}

                className="bg-white rounded-xl shadow p-6"

              >


                <h2 className="text-xl font-bold text-blue-900">

                  {resource.title}

                </h2>




                <p className="text-gray-600 mt-3">

                  {resource.description}

                </p>




                <p className="mt-3 text-sm">

                  Course: {resource.course_code || "N/A"}

                </p>




                <p className="text-sm text-gray-500">

                  Uploaded: {new Date(resource.created_at).toLocaleDateString()}

                </p>





                <a

                  href={resource.file_url}

                  target="_blank"

                  rel="noreferrer"

                  className="inline-block mt-4 text-blue-700 font-semibold"

                >

                  Open File →

                </a>





                <button

                  onClick={()=>deleteResource(resource.id)}

                  className="block mt-5 bg-red-600 text-white px-4 py-2 rounded-lg"

                >

                  Delete Resource

                </button>



              </div>


            ))


          )}



        </div>



      </div>


    </div>

  )

}


export default AdminResources