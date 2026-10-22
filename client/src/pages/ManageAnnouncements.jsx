import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../lib/supabase"


function ManageAnnouncements() {

  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)



  useEffect(() => {

    fetchAnnouncements()

  }, [])



  const fetchAnnouncements = async () => {


    const {
      data: { user },
    } = await supabase.auth.getUser()



    if (!user) {

      setLoading(false)
      return

    }



    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("posted_by", user.id)
      .order("created_at", { ascending: false })



    if (error) {

      console.log(error.message)

    } else {

      setAnnouncements(data)

    }


    setLoading(false)

  }





  const deleteAnnouncement = async (id) => {


    const confirmDelete = window.confirm(
      "Delete this announcement?"
    )


    if (!confirmDelete) return




    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id)



    if (error) {

      alert(error.message)

    } else {


      setAnnouncements(

        announcements.filter(
          (announcement) => announcement.id !== id
        )

      )


    }

  }





  if (loading) {

    return (

      <div className="p-10 text-xl">

        Loading announcements...

      </div>

    )

  }





  return (

    <div className="min-h-screen bg-gray-100 p-8">


      <div className="max-w-6xl mx-auto">


        <h1 className="text-3xl font-bold text-blue-900 mb-8">

          My Announcements

        </h1>





        {announcements.length === 0 ? (


          <div className="bg-white rounded-xl shadow p-8">

            No announcements posted yet.

          </div>



        ) : (



          <div className="space-y-6">



            {announcements.map((announcement)=>(



              <div

                key={announcement.id}

                className="bg-white rounded-xl shadow p-6"

              >



                <h2 className="text-2xl font-bold text-blue-900">

                  {announcement.title}

                </h2>



                <p className="mt-3 text-gray-700">

                  {announcement.content}

                </p>



                <p className="mt-3 text-sm text-gray-500">

                  Audience: {announcement.audience}

                </p>





                <div className="flex gap-4 mt-5">


                  <Link

                    to={`/edit-announcement/${announcement.id}`}

                    className="bg-blue-900 text-white px-5 py-2 rounded-lg"

                  >

                    Edit

                  </Link>





                  <button

                    onClick={() => deleteAnnouncement(announcement.id)}

                    className="bg-red-600 text-white px-5 py-2 rounded-lg"

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


export default ManageAnnouncements