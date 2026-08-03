import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"


function AdminAnnouncements() {

  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")


  useEffect(() => {

    getAnnouncements()

  }, [])



  async function getAnnouncements() {

    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false })


    if (error) {

      alert(error.message)
      return

    }


    setAnnouncements(data || [])

    setLoading(false)

  }





  async function deleteAnnouncement(id) {


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
      return

    }



    getAnnouncements()


  }





  const filteredAnnouncements = announcements.filter((item)=>

    item.title
      ?.toLowerCase()
      .includes(search.toLowerCase())

    ||

    item.content
      ?.toLowerCase()
      .includes(search.toLowerCase())

  )





  if (loading) {

    return (

      <div className="p-10 font-bold text-xl">

        Loading announcements...

      </div>

    )

  }





  return (

    <div className="min-h-screen bg-gray-100 p-8">


      <div className="max-w-7xl mx-auto">


        <h1 className="text-3xl font-bold text-blue-900 mb-6">

          Manage Announcements

        </h1>





        <input

          type="text"

          placeholder="Search announcements..."

          value={search}

          onChange={(e)=>setSearch(e.target.value)}

          className="border rounded-lg p-3 w-full md:w-96 mb-6"

        />







        <div className="grid md:grid-cols-2 gap-6">



          {filteredAnnouncements.length === 0 ? (

            <p>
              No announcements found.
            </p>

          ) : (


            filteredAnnouncements.map((announcement)=>(


              <div

                key={announcement.id}

                className="bg-white rounded-xl shadow p-6"

              >


                <h2 className="text-xl font-bold text-blue-900">

                  {announcement.title}

                </h2>




                <p className="mt-3 text-gray-700">

                  {announcement.content}

                </p>




                <p className="mt-4 text-sm text-gray-500">

                  Audience: {announcement.audience}

                </p>



                <p className="text-sm text-gray-500">

                  Posted: {new Date(
                    announcement.created_at
                  ).toLocaleDateString()}

                </p>





                <button

                  onClick={()=>deleteAnnouncement(announcement.id)}

                  className="mt-5 bg-red-600 text-white px-4 py-2 rounded-lg"

                >

                  Delete Announcement

                </button>



              </div>


            ))


          )}



        </div>



      </div>


    </div>

  )

}


export default AdminAnnouncements