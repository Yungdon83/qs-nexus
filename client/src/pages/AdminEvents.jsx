import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../lib/supabase"

function AdminEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    getEvents()
  }, [])

  async function getEvents(showRefresh = false) {
    if (showRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true })

    if (error) {
      alert(error.message)
      setLoading(false)
      setRefreshing(false)
      return
    }

    setEvents(data || [])
    setLoading(false)
    setRefreshing(false)
  }

  async function deleteEvent(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    )

    if (!confirmDelete) return

    setDeletingId(id)

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id)

    if (error) {
      alert(error.message)
      setDeletingId(null)
      return
    }

    setEvents((current) => current.filter((event) => event.id !== id))
    setDeletingId(null)
  }

  const today = new Date()

  const isUpcoming = (date) => {
    if (!date) return false
    return new Date(date) >= today
  }

  const formatDate = (date) => {
    if (!date) return "Date not set"

    return new Date(date).toLocaleDateString("en-NG", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const searchText = search.toLowerCase()

      const matchesSearch =
        event.title?.toLowerCase().includes(searchText) ||
        event.location?.toLowerCase().includes(searchText) ||
        event.description?.toLowerCase().includes(searchText)

      const upcoming = isUpcoming(event.event_date)

      const matchesFilter =
        filter === "all" ||
        (filter === "upcoming" && upcoming) ||
        (filter === "past" && !upcoming)

      return matchesSearch && matchesFilter
    })
  }, [events, search, filter])

  const upcomingCount = events.filter((event) =>
    isUpcoming(event.event_date)
  ).length

  const pastCount = events.length - upcomingCount

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-8">
        <div className="max-w-7xl mx-auto animate-pulse">
          <div className="h-9 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg mb-3" />
          <div className="h-5 w-96 max-w-full bg-gray-200 dark:bg-gray-800 rounded mb-8" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-28 bg-white dark:bg-gray-900 rounded-2xl"
              />
            ))}
          </div>

          <div className="h-12 bg-white dark:bg-gray-900 rounded-xl mb-6" />

          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-64 bg-white dark:bg-gray-900 rounded-2xl"
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

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-600 flex items-center justify-center shadow-lg">
                <span className="text-2xl">📅</span>
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  Manage Events
                </h1>

                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Create, manage and monitor department events.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => getEvents(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold shadow-md transition"
          >
            <span className={refreshing ? "animate-spin" : ""}>↻</span>
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Events
                </p>

                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {events.length}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl">
                📅
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Upcoming
                </p>

                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {upcomingCount}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-2xl">
                🟢
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Past Events
                </p>

                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {pastCount}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl">
                🕘
              </div>
            </div>
          </div>

        </div>

        {/* Search & Filters */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 md:p-5 shadow-sm mb-8">

          <div className="flex flex-col lg:flex-row gap-4">

            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                🔎
              </span>

              <input
                type="text"
                placeholder="Search by event, location or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div className="flex gap-2 flex-wrap">

              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-3 rounded-xl font-semibold transition ${
                  filter === "all"
                    ? "bg-blue-900 text-white shadow"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                }`}
              >
                All
              </button>

              <button
                onClick={() => setFilter("upcoming")}
                className={`px-4 py-3 rounded-xl font-semibold transition ${
                  filter === "upcoming"
                    ? "bg-green-600 text-white shadow"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                }`}
              >
                Upcoming
              </button>

              <button
                onClick={() => setFilter("past")}
                className={`px-4 py-3 rounded-xl font-semibold transition ${
                  filter === "past"
                    ? "bg-gray-700 text-white shadow"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                }`}
              >
                Past
              </button>

            </div>

          </div>

          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Showing{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {filteredEvents.length}
            </span>{" "}
            of {events.length} events
          </div>

        </div>

        {/* Events */}
        {filteredEvents.length === 0 ? (

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-12 text-center shadow-sm">

            <div className="text-5xl mb-4">📅</div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No events found
            </h2>

            <p className="text-gray-500 dark:text-gray-400">
              {search
                ? "Try adjusting your search or filters."
                : "There are no events available yet."}
            </p>

          </div>

        ) : (

          <div className="grid md:grid-cols-2 gap-6">

            {filteredEvents.map((event) => {

              const upcoming = isUpcoming(event.event_date)

              return (
                <div
                  key={event.id}
                  className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >

                  {/* Event top */}
                  <div className="bg-gradient-to-r from-blue-900 to-indigo-700 p-6 text-white">

                    <div className="flex items-start justify-between gap-4">

                      <div>
                        <p className="text-blue-200 text-sm font-medium mb-2">
                          DEPARTMENT EVENT
                        </p>

                        <h2 className="text-xl md:text-2xl font-bold leading-tight">
                          {event.title}
                        </h2>
                      </div>

                      <span
                        className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${
                          upcoming
                            ? "bg-green-400/20 text-green-100 border border-green-300/30"
                            : "bg-white/10 text-blue-100 border border-white/20"
                        }`}
                      >
                        {upcoming ? "Upcoming" : "Past"}
                      </span>

                    </div>

                  </div>

                  {/* Event body */}
                  <div className="p-6">

                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3 min-h-[72px]">
                      {event.description || "No description provided."}
                    </p>

                    <div className="mt-6 space-y-3">

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                          📅
                        </div>

                        <div>
                          <p className="text-xs text-gray-400 uppercase font-semibold">
                            Date
                          </p>

                          <p className="font-semibold text-gray-800 dark:text-gray-200">
                            {formatDate(event.event_date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                          📍
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs text-gray-400 uppercase font-semibold">
                            Location
                          </p>

                          <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                            {event.location || "Location not specified"}
                          </p>
                        </div>
                      </div>

                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-7 pt-5 border-t border-gray-100 dark:border-gray-800">

                      <Link
                        to={`/edit-event/${event.id}`}
                        className="flex-1 text-center px-4 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold transition shadow-sm"
                      >
                        ✏️ Edit
                      </Link>

                      <button
                        onClick={() => deleteEvent(event.id)}
                        disabled={deletingId === event.id}
                        className="flex-1 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 font-semibold transition"
                      >
                        {deletingId === event.id
                          ? "Deleting..."
                          : "🗑️ Delete"}
                      </button>

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

export default AdminEvents