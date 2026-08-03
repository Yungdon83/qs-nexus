import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

function CreateEvent() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
  })

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert("Please login first.")
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from("events")
      .insert({
        title: form.title,
        description: form.description,
        event_date: form.event_date,
        location: form.location,
        created_by: user.id,
      })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    alert("Event created successfully!")

    navigate("/lecturer-dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-8">

      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-8">

        <h1 className="text-3xl font-bold text-blue-900 mb-6">
          Create Department Event
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <input
            type="text"
            name="title"
            placeholder="Event Title"
            value={form.title}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          <textarea
            name="description"
            placeholder="Event Description"
            rows="4"
            value={form.description}
            onChange={handleChange}
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
            placeholder="Event Location"
            value={form.location}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800"
          >
            {loading ? "Creating..." : "Create Event"}
          </button>

        </form>

      </div>

    </div>
  )
}

export default CreateEvent