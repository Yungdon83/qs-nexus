import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../lib/supabase"

function ManageEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState("all")

  useEffect(() => {
    getEvents()
  }, [])

  async function getEvents(showRefresh = false) {
    if (showRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      setRefreshing(false)
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

    setEvents((prev) =>
      prev.filter((event) => event.id !== id)
    )

    setDeletingId(null)
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingCount = events.filter((event) => {
    if (!event.event_date) return false

    const date = new Date(event.event_date)
    date.setHours(0, 0, 0, 0)

    return date >= today
  }).length

  const pastCount = events.length - upcomingCount

  const filteredEvents = useMemo(() => {
    const searchTerm = search.toLowerCase().trim()

    return events
      .filter((event) => {
        const matchesSearch =
          !searchTerm ||
          event.title?.toLowerCase().includes(searchTerm) ||
          event.description?.toLowerCase().includes(searchTerm) ||
          event.location?.toLowerCase().includes(searchTerm)

        let matchesDate = true

        if (dateFilter !== "all" && event.event_date) {
          const eventDate = new Date(event.event_date)
          eventDate.setHours(0, 0, 0, 0)

          if (dateFilter === "upcoming") {
            matchesDate = eventDate >= today
          }

          if (dateFilter === "past") {
            matchesDate = eventDate < today
          }
        }

        return matchesSearch && matchesDate
      })
      .sort(
        (a, b) =>
          new Date(a.event_date) -
          new Date(b.event_date)
      )
  }, [events, search, dateFilter])

  function formatDate(date) {
    if (!date) return "Date not set"

    return new Date(date).toLocaleDateString(
      "en-NG",
      {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    )
  }

  function isUpcoming(date) {
    if (!date) return false

    const eventDate = new Date(date)
    eventDate.setHours(0, 0, 0, 0)

    return eventDate >= today
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-6 md:p-8">
        <div className="max-w-7xl mx-auto animate-pulse">

          <div className="h-10 w-56 bg-gray-200 dark:bg-gray-800 rounded-lg mb-3" />

          <div className="h-5 w-96 max-w-full bg-gray-200 dark:bg-gray-800 rounded mb-8" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 bg-white dark:bg-gray-900 rounded-2xl"
              />
            ))}
          </div>

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 transition-colors duration-300 p-4 md:p-8">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-1">
              ADMINISTRATION
            </p>

            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
              Manage Events
            </h1>

            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Create, monitor and manage departmental events.
            </p>
          </div>

          <button
            onClick={() => getEvents(true)}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-900 text-white font-semibold hover:bg-blue-800 disabled:opacity-60 transition"
          >
            <span className={refreshing ? "animate-spin" : ""}>
              ↻
            </span>

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

        </div>


        {/* STATS */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Events
            </p>

            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
              {events.length}
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              Events you created
            </p>
          </div>


          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Upcoming
            </p>

            <h2 className="text-3xl font-extrabold text-blue-700 dark:text-blue-400 mt-2">
              {upcomingCount}
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              Future events
            </p>
          </div>


          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Past Events
            </p>

            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
              {pastCount}
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              Completed events
            </p>
          </div>


          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing
            </p>

            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
              {filteredEvents.length}
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              Matching your filters
            </p>
          </div>

        </div>


        {/* SEARCH & FILTER */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 mb-6">

          <div className="grid md:grid-cols-3 gap-4">

            <div className="md:col-span-2">

              <label className="field-label">
                Search Events
              </label>

              <div className="relative">

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, description or location..."
                  className="field-input pl-10"
                />

                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  🔎
                </span>

              </div>

            </div>


            <div>

              <label className="field-label">
                Filter Events
              </label>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="field-input"
              >
                <option value="all">
                  All Events
                </option>

                <option value="upcoming">
                  Upcoming Events
                </option>

                <option value="past">
                  Past Events
                </option>
              </select>

            </div>

          </div>

        </div>


        {/* EVENTS */}
        {filteredEvents.length === 0 ? (

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center">

            <div className="text-5xl mb-4">
              📅
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              No events found
            </h2>

            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {events.length === 0
                ? "No events have been created yet."
                : "Try changing your search or filter."}
            </p>

          </div>

        ) : (

          <div className="grid md:grid-cols-2 gap-6">

            {filteredEvents.map((event) => (

              <div
                key={event.id}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-800 p-6 transition-all duration-300"
              >

                {/* EVENT HEADER */}
                <div className="flex items-start justify-between gap-4">

                  <div className="flex-1">

                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        isUpcoming(event.event_date)
                          ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {isUpcoming(event.event_date)
                        ? "Upcoming"
                        : "Past"}
                    </span>

                    <h2 className="text-2xl font-extrabold text-blue-900 dark:text-blue-400 mt-3">
                      {event.title}
                    </h2>

                  </div>

                  <span className="text-3xl">
                    🎉
                  </span>

                </div>


                {/* DESCRIPTION */}
                <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                  {event.description || "No description provided."}
                </p>


                {/* DETAILS */}
                <div className="mt-6 space-y-4">

                  <div className="flex gap-3">

                    <span className="text-lg">
                      📅
                    </span>

                    <div>
                      <p className="text-xs text-gray-400">
                        Date
                      </p>

                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {formatDate(event.event_date)}
                      </p>
                    </div>

                  </div>


                  <div className="flex gap-3">

                    <span className="text-lg">
                      📍
                    </span>

                    <div>
                      <p className="text-xs text-gray-400">
                        Location
                      </p>

                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {event.location || "Location not set"}
                      </p>
                    </div>

                  </div>

                </div>


                {/* ACTIONS */}
                <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">

                  <Link
                    to={`/edit-event/${event.id}`}
                    className="flex-1 text-center bg-blue-900 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl font-semibold transition"
                  >
                    Edit Event
                  </Link>


                  <button
                    onClick={() => deleteEvent(event.id)}
                    disabled={deletingId === event.id}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-4 py-2.5 rounded-xl font-semibold transition"
                  >
                    {deletingId === event.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

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

export default ManageEvents