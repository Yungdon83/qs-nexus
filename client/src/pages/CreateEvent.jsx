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
        title: form.title.trim(),
        description: form.description.trim(),
        event_date: form.event_date,
        location: form.location.trim(),
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 py-8 md:px-8 md:py-10">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-600 flex items-center justify-center shadow-lg">
              <span className="text-2xl">📅</span>
            </div>

            <div>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                Event Management
              </p>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Create Event
              </h1>

              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Create a new department event for students.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            ← Back
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">

          <div className="bg-gradient-to-r from-blue-900 to-indigo-700 px-6 py-6 md:px-8">
            <h2 className="text-xl font-bold text-white">
              Event Details
            </h2>

            <p className="text-blue-100 text-sm mt-1">
              Provide the information students need to know about this event.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Event Title
              </label>

              <input
                type="text"
                name="title"
                placeholder="e.g. Quantity Surveying Career Seminar"
                value={form.title}
                onChange={handleChange}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Event Description
              </label>

              <textarea
                name="description"
                placeholder="Describe the event and provide any important information..."
                rows="6"
                value={form.description}
                onChange={handleChange}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Event Date
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    📅
                  </span>

                  <input
                    type="date"
                    name="event_date"
                    value={form.event_date}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Event Location
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    📍
                  </span>

                  <input
                    type="text"
                    name="location"
                    placeholder="e.g. EDM Lecture Theatre"
                    value={form.location}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>
              </div>

            </div>

            <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/70 border border-gray-100 dark:border-gray-700 p-5">

              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">👀</span>

                <h3 className="font-bold text-gray-900 dark:text-white">
                  Quick Preview
                </h3>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-5">

                <h4 className="text-lg font-bold text-blue-900 dark:text-blue-400">
                  {form.title.trim() || "Your event title"}
                </h4>

                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  {form.description.trim() || "Your event description will appear here."}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mt-4 text-sm text-gray-600 dark:text-gray-300">
                  <span>
                    📅{" "}
                    {form.event_date
                      ? new Date(`${form.event_date}T00:00:00`).toLocaleDateString(
                          "en-NG",
                          {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "Event date"}
                  </span>

                  <span>
                    📍 {form.location.trim() || "Event location"}
                  </span>
                </div>

              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">

              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-700 hover:from-blue-800 hover:to-indigo-600 disabled:opacity-60 text-white font-bold shadow-lg shadow-blue-900/20 transition"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Creating Event...
                  </span>
                ) : (
                  "📅 Create Department Event"
                )}
              </button>

            </div>

          </form>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 p-4">
          <span className="text-lg">💡</span>

          <p className="text-sm text-blue-800 dark:text-blue-200">
            <span className="font-bold">Tip:</span> Make sure the event
            information is accurate before publishing. Students will use the
            date and location details to plan ahead.
          </p>
        </div>

      </div>
    </div>
  )
}

export default CreateEvent