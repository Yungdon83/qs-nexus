import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"


function Resources(){

  const [resources,setResources] = useState([])
  const [loading,setLoading] = useState(true)
  const [profile,setProfile] = useState(null)



  useEffect(()=>{

    loadResources()

  },[])




  async function loadResources(){


    const {
      data:{user}
    } = await supabase.auth.getUser()



    if(!user){

      setLoading(false)
      return

    }




    const {
      data:profileData,
      error:profileError
    } =
    await supabase

    .from("profiles")

    .select(
      "level, department"
    )

    .eq(
      "id",
      user.id
    )

    .maybeSingle()



    if(profileError){

      console.log(profileError.message)

    }



    setProfile(profileData)






    if(!profileData){

      setLoading(false)
      return

    }







    const {
      data:resourceData,
      error:resourceError
    }
    =
    await supabase

    .from("resources")

    .select("*")

    .eq(
      "level",
      profileData.level
    )

    .eq(
      "department",
      profileData.department
    )

    .order(
      "created_at",
      {
        ascending:false
      }
    )





    if(resourceError){

      console.log(resourceError.message)

    }


    setResources(
      resourceData || []
    )


    setLoading(false)


  }






  if(loading){

    return(

      <div className="p-10 text-xl font-bold">

        Loading resources...

      </div>

    )

  }






  return (

    <div className="min-h-screen bg-gray-100 p-8">


      <div className="max-w-6xl mx-auto">


        <h1 className="text-3xl font-bold text-blue-900 mb-6">

          Learning Resources

        </h1>



        <p className="mb-6 text-gray-600">

          Showing resources for:

          {" "}

          {profile?.level}

          {" - "}

          {profile?.department}

        </p>






        {
          resources.length === 0 ?

          (

            <div className="bg-white p-6 rounded-xl shadow">

              No resources available yet.

            </div>

          )

          :

          (

            resources.map(resource=>(


              <div

                key={resource.id}

                className="bg-white rounded-xl shadow p-6 mb-5"

              >


                <h2 className="text-xl font-bold text-blue-900">

                  {resource.title}

                </h2>



                <p className="mt-2">

                  {resource.description}

                </p>



                <p className="mt-3 text-sm text-gray-600">

                  Course:

                  {" "}

                  {resource.course_code}

                </p>



                <p className="text-sm text-gray-600">

                  Type:

                  {" "}

                  {resource.resource_type}

                </p>




                <a

                  href={resource.file_url}

                  target="_blank"

                  rel="noreferrer"

                  className="inline-block mt-4 text-blue-700 font-bold"

                >

                  Open Resource →

                </a>



              </div>


            ))

          )

        }



      </div>


    </div>

  )


}


export default Resources