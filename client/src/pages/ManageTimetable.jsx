import { useEffect, useMemo, useState } from "react"
import { supabase } from "../lib/supabase"
import { Link } from "react-router-dom"

function ManageTimetable() {
  const [timetable, setTimetable] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const [search, setSearch] = useState("")
  const [levelFilter, setLevelFilter] = useState("all")
  const [dayFilter, setDayFilter] = useState("all")

  const [form, setForm] = useState({
    course_code: "",
    course_title: "",
    lecturer: "",
    level: "",
    day: "",
    start_time: "",
    end_time: "",
    venue: "",
  })

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]

  useEffect(() => {
    getTimetable()
  }, [])

  async function getTimetable(showRefresh = false) {
    if (showRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    const { data, error } = await supabase
      .from("timetable")
      .select("*")

    if (error) {
      alert(error.message)
      setLoading(false)
      setRefreshing(false)
      return
    }

    setTimetable(data || [])
    setLoading(false)
    setRefreshing(false)
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  async function addTimetable(e) {
    e.preventDefault()

    if (!form.start_time || !form.end_time) {
      alert("Please provide both start and end times")
      return
    }

    if (form.start_time >= form.end_time) {
      alert("End time must be later than start time")
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from("timetable")
      .insert(form)

    if (error) {
      alert(error.message)
      setSaving(false)
      return
    }

    alert("Timetable added successfully")

    setForm({
      course_code: "",
      course_title: "",
      lecturer: "",
      level: "",
      day: "",
      start_time: "",
      end_time: "",
      venue: "",
    })

    setSaving(false)
    getTimetable()
  }

  async function deleteTimetable(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this timetable entry?"
    )

    if (!confirmDelete) return

    setDeletingId(id)

    const { error } = await supabase
      .from("timetable")
      .delete()
      .eq("id", id)

    if (error) {
      alert(error.message)
      setDeletingId(null)
      return
    }

    setTimetable((prev) =>
      prev.filter((item) => item.id !== id)
    )

    setDeletingId(null)
  }

  const levels = useMemo(() => {
    return [
      ...new Set(
        timetable
          .map((item) => item.level)
          .filter(Boolean)
      ),
    ].sort()
  }, [timetable])

  const filteredTimetable = useMemo(() => {
    const searchTerm = search.toLowerCase().trim()

    return timetable
      .filter((item) => {
        const matchesSearch =
          !searchTerm ||
          item.course_code?.toLowerCase().includes(searchTerm) ||
          item.course_title?.toLowerCase().includes(searchTerm) ||
          item.lecturer?.toLowerCase().includes(searchTerm) ||
          item.venue?.toLowerCase().includes(searchTerm) ||
          item.level?.toLowerCase().includes(searchTerm)

        const matchesLevel =
          levelFilter === "all" ||
          item.level === levelFilter

        const matchesDay =
          dayFilter === "all" ||
          item.day === dayFilter

        return (
          matchesSearch &&
          matchesLevel &&
          matchesDay
        )
      })
      .sort((a, b) => {
        const dayA = days.indexOf(a.day)
        const dayB = days.indexOf(b.day)

        if (dayA !== dayB) {
          return dayA - dayB
        }

        return (a.start_time || "").localeCompare(
          b.start_time || ""
        )
      })
  }, [timetable, search, levelFilter, dayFilter])

  const assignedDays = new Set(
    timetable.map((item) => item.day)
  ).size

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-6 md:p-8">
        <div className="max-w-7xl mx-auto animate-pulse">

          <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg mb-3" />

          <div className="h-5 w-96 max-w-full bg-gray-200 dark:bg-gray-800 rounded mb-8" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 bg-white dark:bg-gray-900 rounded-2xl"
              />
            ))}
          </div>

          <div className="h-72 bg-white dark:bg-gray-900 rounded-2xl" />

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
              Manage Timetable
            </h1>

            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Create, organize and manage departmental class schedules.
            </p>
          </div>

          <button
            onClick={() => getTimetable(true)}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-900 text-white font-semibold hover:bg-blue-800 disabled:opacity-60 transition"
          >
            <span className={refreshing ? "animate-spin" : ""}>
              ↻
            </span>

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

        </div>


        {/* STAT CARDS */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Entries
            </p>

            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
              {timetable.length}
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              All timetable records
            </p>
          </div>


          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing
            </p>

            <h2 className="text-3xl font-extrabold text-blue-700 dark:text-blue-400 mt-2">
              {filteredTimetable.length}
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              Matching your filters
            </p>
          </div>


          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Levels
            </p>

            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
              {levels.length}
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              Academic levels covered
            </p>
          </div>


          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Active Days
            </p>

            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
              {assignedDays}
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              Days with classes
            </p>
          </div>

        </div>


        {/* ADD FORM */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 md:p-7 mb-8">

          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Add Timetable Entry
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Enter the details of the class schedule below.
            </p>
          </div>


          <form
            onSubmit={addTimetable}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >

            <div>
              <label className="field-label">
                Course Code
              </label>

              <input
                name="course_code"
                value={form.course_code}
                onChange={handleChange}
                placeholder="e.g. QTS 101"
                className="field-input"
                required
              />
            </div>


            <div className="sm:col-span-2">
              <label className="field-label">
                Course Title
              </label>

              <input
                name="course_title"
                value={form.course_title}
                onChange={handleChange}
                placeholder="Enter course title"
                className="field-input"
                required
              />
            </div>


            <div>
              <label className="field-label">
                Lecturer
              </label>

              <input
                name="lecturer"
                value={form.lecturer}
                onChange={handleChange}
                placeholder="Lecturer name"
                className="field-input"
                required
              />
            </div>


            <div>
              <label className="field-label">
                Level
              </label>

              <input
                name="level"
                value={form.level}
                onChange={handleChange}
                placeholder="e.g. 100L"
                className="field-input"
                required
              />
            </div>


            <div>
              <label className="field-label">
                Day
              </label>

              <select
                name="day"
                value={form.day}
                onChange={handleChange}
                className="field-input"
                required
              >
                <option value="">
                  Select day
                </option>

                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>


            <div>
              <label className="field-label">
                Start Time
              </label>

              <input
                type="time"
                name="start_time"
                value={form.start_time}
                onChange={handleChange}
                className="field-input"
                required
              />
            </div>


            <div>
              <label className="field-label">
                End Time
              </label>

              <input
                type="time"
                name="end_time"
                value={form.end_time}
                onChange={handleChange}
                className="field-input"
                required
              />
            </div>


            <div>
              <label className="field-label">
                Venue
              </label>

              <input
                name="venue"
                value={form.venue}
                onChange={handleChange}
                placeholder="e.g. EDM Lecture Theatre"
                className="field-input"
                required
              />
            </div>


            <button
              type="submit"
              disabled={saving}
              className="sm:col-span-2 lg:col-span-4 bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white p-3.5 rounded-xl font-bold transition"
            >
              {saving ? "Adding Timetable..." : "+ Add Timetable Entry"}
            </button>

          </form>

        </div>


        {/* SEARCH + FILTERS */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 mb-6">

          <div className="grid md:grid-cols-3 gap-4">

            <div className="md:col-span-1">
              <label className="field-label">
                Search Timetable
              </label>

              <div className="relative">

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Course, lecturer, venue..."
                  className="field-input pl-10"
                />

                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  🔎
                </span>

              </div>
            </div>


            <div>
              <label className="field-label">
                Filter by Level
              </label>

              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="field-input"
              >
                <option value="all">
                  All Levels
                </option>

                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>


            <div>
              <label className="field-label">
                Filter by Day
              </label>

              <select
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
                className="field-input"
              >
                <option value="all">
                  All Days
                </option>

                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

          </div>

        </div>


        {/* TIMETABLE */}
        {filteredTimetable.length === 0 ? (

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center">

            <div className="text-5xl mb-4">
              📅
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              No timetable entries found
            </h2>

            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {timetable.length === 0
                ? "Add your first timetable entry using the form above."
                : "Try changing your search or filters."}
            </p>

          </div>

        ) : (

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

            {filteredTimetable.map((item) => (

              <div
                key={item.id}
                className="group bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-800 p-5 transition-all duration-300"
              >

                {/* COURSE HEADER */}
                <div className="flex items-start justify-between gap-3">

                  <div>

                    <span className="inline-block px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-bold">
                      {item.level}
                    </span>

                    <h2 className="text-xl font-extrabold text-blue-900 dark:text-blue-400 mt-3">
                      {item.course_code}
                    </h2>

                  </div>

                  <span className="text-2xl">
                    📚
                  </span>

                </div>


                <h3 className="font-bold text-gray-900 dark:text-white mt-2">
                  {item.course_title}
                </h3>


                {/* DETAILS */}
                <div className="mt-5 space-y-3">

                  <div className="flex gap-3">
                    <span>👨‍🏫</span>

                    <div>
                      <p className="text-xs text-gray-400">
                        Lecturer
                      </p>

                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        {item.lecturer}
                      </p>
                    </div>
                  </div>


                  <div className="flex gap-3">
                    <span>📅</span>

                    <div>
                      <p className="text-xs text-gray-400">
                        Day
                      </p>

                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        {item.day}
                      </p>
                    </div>
                  </div>


                  <div className="flex gap-3">
                    <span>⏰</span>

                    <div>
                      <p className="text-xs text-gray-400">
                        Time
                      </p>

                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        {item.start_time} - {item.end_time}
                      </p>
                    </div>
                  </div>


                  <div className="flex gap-3">
                    <span>📍</span>

                    <div>
                      <p className="text-xs text-gray-400">
                        Venue
                      </p>

                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        {item.venue}
                      </p>
                    </div>
                  </div>

                </div>


                {/* ACTIONS */}
                <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">

                  <Link
                    to={`/edit-timetable/${item.id}`}
                    className="flex-1 text-center bg-blue-900 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl font-semibold transition"
                  >
                    Edit
                  </Link>


                  <button
                    onClick={() => deleteTimetable(item.id)}
                    disabled={deletingId === item.id}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-4 py-2.5 rounded-xl font-semibold transition"
                  >
                    {deletingId === item.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>


      {/* LOCAL FORM STYLES */}
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

export default ManageTimetable