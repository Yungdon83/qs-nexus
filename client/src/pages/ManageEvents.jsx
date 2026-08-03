import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../lib/supabase"

function ManageEvents() {

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEvents()
  }, [])

  async function getEvents() {

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("created_by", user.id)
      .order("event_date", { ascending: true })

    if (error) {
      alert(error.message)
    } else {
      setEvents(data || [])
    }

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

    setEvents(events.filter((event) => event.id !== id))
  }

  if (loading) {
    return (
      <div className="p-10 text-xl">
        Loading events...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold text-blue-900 mb-8">
          Manage Events
        </h1>

        {events.length === 0 ? (

          <div className="bg-white rounded-xl shadow p-8">
            No events created yet.
          </div>

        ) : (

          <div className="grid md:grid-cols-2 gap-6">

            {events.map((event) => (

              <div
                key={event.id}
                className="bg-white rounded-xl shadow p-6"
              >

                <h2 className="text-2xl font-bold text-blue-900">
                  {event.title}
                </h2>

                <p className="mt-3 text-gray-700">
                  {event.description}
                </p>

                <p className="mt-4">
                  <strong>Date:</strong> {event.event_date}
                </p>

                <p>
                  <strong>Location:</strong> {event.location}
                </p>

                <div className="flex gap-3 mt-6">

                  <Link
                    to={`/edit-event/${event.id}`}
                    className="bg-blue-900 text-white px-5 py-2 rounded-lg"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => deleteEvent(event.id)}
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

export default ManageEvents