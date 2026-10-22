import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    getEvents()
  }, [])

  async function getEvents() {
    setLoading(true)

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    setEvents(data || [])
    setLoading(false)
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(`${event.event_date}T00:00:00`)
    const matchesSearch =
      event.title?.toLowerCase().includes(search.toLowerCase()) ||
      event.description?.toLowerCase().includes(search.toLowerCase()) ||
      event.location?.toLowerCase().includes(search.toLowerCase())

    const isUpcoming = eventDate >= today

    if (!matchesSearch) return false
    if (filter === "upcoming") return isUpcoming
    if (filter === "past") return !isUpcoming

    return true
  })

  const upcomingCount = events.filter((event) => {
    const eventDate = new Date(`${event.event_date}T00:00:00`)
    return eventDate >= today
  }).length

  const pastCount = events.length - upcomingCount

  function formatDate(date) {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-NG", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mb-3" />
          <div className="h-5 w-96 max-w-full bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mb-8" />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-64 bg-white dark:bg-gray-900 rounded-2xl shadow-sm animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-6 md:p-8">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-600 flex items-center justify-center shadow-lg">
                <span className="text-2xl">📅</span>
              </div>

              <div>
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                  Department Events
                </p>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  Events
                </h1>
              </div>
            </div>

            <p className="text-gray-500 dark:text-gray-400 mt-3">
              Stay updated with upcoming Quantity Surveying department events.
            </p>
          </div>

          <button
            onClick={getEvents}
            className="self-start lg:self-auto px-5 py-3 rounded-xl bg-blue-900 text-white font-semibold hover:bg-blue-800 transition shadow-lg"
          >
            🔄 Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Events
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {events.length}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Upcoming
            </p>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-400 mt-1">
              {upcomingCount}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Past Events
            </p>
            <p className="text-3xl font-bold text-gray-500 dark:text-gray-400 mt-1">
              {pastCount}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search events by title, location or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-3 rounded-xl font-semibold transition ${
                filter === "all"
                  ? "bg-blue-900 text-white"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              }`}
            >
              All
            </button>

            <button
              onClick={() => setFilter("upcoming")}
              className={`px-4 py-3 rounded-xl font-semibold transition ${
                filter === "upcoming"
                  ? "bg-blue-900 text-white"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              }`}
            >
              Upcoming
            </button>

            <button
              onClick={() => setFilter("past")}
              className={`px-4 py-3 rounded-xl font-semibold transition ${
                filter === "past"
                  ? "bg-blue-900 text-white"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              }`}
            >
              Past
            </button>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-12 text-center shadow-sm">
            <div className="text-5xl mb-4">📅</div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              No events found
            </h2>

            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {search
                ? "Try a different search term."
                : "There are no events available at the moment."}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const eventDate = new Date(`${event.event_date}T00:00:00`)
              const isUpcoming = eventDate >= today

              return (
                <div
                  key={event.id}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="h-2 bg-gradient-to-r from-blue-900 to-indigo-600" />

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {event.title}
                      </h2>

                      <span
                        className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full ${
                          isUpcoming
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {isUpcoming ? "Upcoming" : "Past"}
                      </span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-6 line-clamp-4">
                      {event.description}
                    </p>

                    <div className="mt-5 space-y-3">
                      <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <span>📅</span>
                        <span>{formatDate(event.event_date)}</span>
                      </div>

                      <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <span>📍</span>
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Events