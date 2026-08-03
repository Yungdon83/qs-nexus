import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { supabase } from "../lib/supabase"

function EditEvent() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
  })

  useEffect(() => {
    fetchEvent()
  }, [])

  async function fetchEvent() {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    if (!data) {
      alert("Event not found")
      navigate("/manage-events")
      return
    }

    setForm({
      title: data.title || "",
      description: data.description || "",
      event_date: data.event_date || "",
      location: data.location || "",
    })

    setLoading(false)
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const { error } = await supabase
      .from("events")
      .update({
        title: form.title,
        description: form.description,
        event_date: form.event_date,
        location: form.location,
      })
      .eq("id", id)

    if (error) {
      alert(error.message)
      return
    }

    alert("Event updated successfully!")

    navigate("/manage-events")
  }

  if (loading) {
    return (
      <div className="p-10 text-xl">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-8">

      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-8">

        <h1 className="text-3xl font-bold text-blue-900 mb-6">
          Edit Event
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="5"
            className="w-full border rounded-lg p-3"
            required
          />

          <input
            type="date"
            name="event_date"
            value={form.event_date}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800"
          >
            Update Event
          </button>

        </form>

      </div>

    </div>
  )
}

export default EditEvent