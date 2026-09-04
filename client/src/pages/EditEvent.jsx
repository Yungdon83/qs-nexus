import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { supabase } from "../lib/supabase"

function EditEvent() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
  })

  useEffect(() => {
    getEvent()
  }, [id])

  async function getEvent() {
    setLoading(true)

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      alert(error.message)
      navigate("/manage-events")
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

    if (!form.title.trim()) {
      alert("Please enter an event title.")
      return
    }

    if (!form.description.trim()) {
      alert("Please enter an event description.")
      return
    }

    if (!form.event_date) {
      alert("Please select an event date.")
      return
    }

    if (!form.location.trim()) {
      alert("Please enter the event location.")
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from("events")
      .update({
        title: form.title.trim(),
        description: form.description.trim(),
        event_date: form.event_date,
        location: form.location.trim(),
      })
      .eq("id", id)

    if (error) {
      alert(error.message)
      setSaving(false)
      return
    }

    alert("Event updated successfully!")

    navigate("/manage-events")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-6 md:p-8">
        <div className="max-w-3xl mx-auto animate-pulse">

          <div className="h-10 w-52 bg-gray-200 dark:bg-gray-800 rounded-lg mb-3" />

          <div className="h-5 w-80 bg-gray-200 dark:bg-gray-800 rounded mb-8" />

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 space-y-5">

            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl" />

          </div>

        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 transition-colors duration-300 p-4 md:p-8">

      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

          <div>
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-1">
              EVENT MANAGEMENT
            </p>

            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
              Edit Event
            </h1>

            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Update the details of this departmental event.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/manage-events")}
            className="px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            ← Back
          </button>

        </div>


        {/* FORM */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 md:p-8">

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* TITLE */}
            <div>
              <label className="field-label">
                Event Title
              </label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter event title"
                className="field-input"
                required
              />
            </div>


            {/* DESCRIPTION */}
            <div>
              <label className="field-label">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="6"
                placeholder="Describe the event..."
                className="field-input resize-none"
                required
              />
            </div>


            {/* DATE */}
            <div>
              <label className="field-label">
                Event Date
              </label>

              <input
                type="date"
                name="event_date"
                value={form.event_date}
                onChange={handleChange}
                className="field-input"
                required
              />
            </div>


            {/* LOCATION */}
            <div>
              <label className="field-label">
                Location
              </label>

              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Faculty Auditorium"
                className="field-input"
                required
              />
            </div>


            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3">

              <button
                type="button"
                onClick={() => navigate("/manage-events")}
                className="sm:flex-1 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-3.5 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="sm:flex-1 bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold transition"
              >
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>

            </div>

          </form>

        </div>

      </div>


      {/* LOCAL STYLES */}
      <style>{`
        .field-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 0.4rem;
        }

        .dark .field-label {
          color: #9ca3af;
        }

        .field-input {
          width: 100%;
          padding: 0.75rem 0.9rem;
          border-radius: 0.75rem;
          border: 1px solid #d1d5db;
          background: white;
          color: #111827;
          outline: none;
          transition: all 0.2s;
        }

        .field-input:focus {
          border-color: #1e3a8a;
          box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.12);
        }

        .dark .field-input {
          background: #111827;
          border-color: #374151;
          color: white;
        }

        .dark .field-input::placeholder {
          color: #6b7280;
        }

        .dark .field-input:focus {
          border-color: #60a5fa;
        }
      `}</style>

    </div>
  )
}

export default EditEvent