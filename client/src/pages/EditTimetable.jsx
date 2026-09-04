import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { supabase } from "../lib/supabase"

function EditTimetable() {
  const { id } = useParams()
  const navigate = useNavigate()

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

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
  }, [id])

  async function getTimetable() {
    setLoading(true)

    const { data, error } = await supabase
      .from("timetable")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      alert(error.message)
      navigate("/manage-timetable")
      return
    }

    setForm({
      course_code: data.course_code || "",
      course_title: data.course_title || "",
      lecturer: data.lecturer || "",
      level: data.level || "",
      day: data.day || "",
      start_time: data.start_time || "",
      end_time: data.end_time || "",
      venue: data.venue || "",
    })

    setLoading(false)
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  async function updateTimetable(e) {
    e.preventDefault()

    if (form.start_time >= form.end_time) {
      alert("End time must be later than start time.")
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from("timetable")
      .update(form)
      .eq("id", id)

    if (error) {
      alert(error.message)
      setSaving(false)
      return
    }

    alert("Timetable updated successfully")

    navigate("/manage-timetable")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-6 md:p-8">
        <div className="max-w-3xl mx-auto animate-pulse">

          <div className="h-10 w-56 bg-gray-200 dark:bg-gray-800 rounded-lg mb-3" />

          <div className="h-5 w-80 max-w-full bg-gray-200 dark:bg-gray-800 rounded mb-8" />

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 space-y-5">

            <div className="grid md:grid-cols-2 gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div
                  key={item}
                  className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl"
                />
              ))}
            </div>

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
              TIMETABLE MANAGEMENT
            </p>

            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
              Edit Timetable
            </h1>

            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Update the details of this class schedule.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/manage-timetable")}
            className="px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            ← Back
          </button>

        </div>


        {/* FORM */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 md:p-8">

          <form
            onSubmit={updateTimetable}
            className="grid md:grid-cols-2 gap-5"
          >

            {/* COURSE CODE */}
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


            {/* COURSE TITLE */}
            <div className="md:col-span-1">
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


            {/* LECTURER */}
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


            {/* LEVEL */}
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


            {/* DAY */}
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


            {/* START TIME */}
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


            {/* END TIME */}
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


            {/* VENUE */}
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


            {/* ACTIONS */}
            <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 pt-4">

              <button
                type="button"
                onClick={() => navigate("/manage-timetable")}
                className="sm:flex-1 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 p-3.5 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="sm:flex-1 bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white p-3.5 rounded-xl font-bold transition"
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

export default EditTimetable