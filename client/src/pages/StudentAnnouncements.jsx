
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnnouncements()
  }, [])

  async function loadAnnouncements() {
    setLoading(true)

    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .in("audience", ["students", "all"])
      .order("created_at", {
        ascending: false,
      })

    if (error) {
      console.log(error.message)
      alert(error.message)
    } else {
      setAnnouncements(data || [])
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl font-bold text-blue-900">
          Loading announcements...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold text-blue-900 mb-8">
          Latest Announcements
        </h1>

        {announcements.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">

            <h2 className="text-xl font-bold text-gray-700">
              No announcements available.
            </h2>

            <p className="text-gray-500 mt-2">
              There are currently no announcements for students.
            </p>

          </div>
        ) : (
          <div className="space-y-5">

            {announcements.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow p-6"
              >

                <h2 className="text-2xl font-bold text-blue-900">
                  {item.title}
                </h2>

                <p className="mt-3 text-gray-700 whitespace-pre-wrap">
                  {item.content}
                </p>

                <p className="mt-4 text-sm text-gray-500">
                  Posted:{" "}
                  {new Date(
                    item.created_at
                  ).toLocaleDateString()}
                </p>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  )
}

export default StudentAnnouncements

