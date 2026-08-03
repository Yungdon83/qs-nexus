import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"


function AdminEvents() {

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")


  useEffect(() => {

    getEvents()

  }, [])



  async function getEvents() {


    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true })



    if (error) {

      alert(error.message)
      return

    }


    setEvents(data || [])

    setLoading(false)

  }





  async function deleteEvent(id) {


    const confirmDelete = window.confirm(
      "Delete this event?"
    )


    if (!confirmDelete) return



    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id)



    if (error) {

      alert(error.message)
      return

    }



    getEvents()

  }





  const filteredEvents = events.filter((event)=>

    event.title
      ?.toLowerCase()
      .includes(search.toLowerCase())

    ||

    event.location
      ?.toLowerCase()
      .includes(search.toLowerCase())

  )





  if (loading) {

    return (

      <div className="p-10 font-bold text-xl">

        Loading events...

      </div>

    )

  }





  return (

    <div className="min-h-screen bg-gray-100 p-8">


      <div className="max-w-7xl mx-auto">


        <h1 className="text-3xl font-bold text-blue-900 mb-6">

          Manage Events

        </h1>





        <input

          type="text"

          placeholder="Search events..."

          value={search}

          onChange={(e)=>setSearch(e.target.value)}

          className="border rounded-lg p-3 w-full md:w-96 mb-6"

        />







        <div className="grid md:grid-cols-2 gap-6">



          {filteredEvents.length === 0 ? (

            <p>
              No events found.
            </p>

          ) : (


            filteredEvents.map((event)=>(


              <div

                key={event.id}

                className="bg-white rounded-xl shadow p-6"

              >


                <h2 className="text-xl font-bold text-purple-800">

                  {event.title}

                </h2>




                <p className="mt-3 text-gray-700">

                  {event.description}

                </p>




                <p className="mt-3">

                  📅 {event.event_date}

                </p>




                <p>

                  📍 {event.location}

                </p>




                <button

                  onClick={()=>deleteEvent(event.id)}

                  className="mt-5 bg-red-600 text-white px-4 py-2 rounded-lg"

                >

                  Delete Event

                </button>



              </div>


            ))


          )}



        </div>



      </div>


    </div>

  )

}


export default AdminEvents