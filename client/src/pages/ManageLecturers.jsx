import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

function ManageLecturers() {

  const [lecturers, setLecturers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    getLecturers()
  }, [])

  async function getLecturers() {

    setLoading(true)

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "lecturer")
      .order("full_name", { ascending: true })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    setLecturers(data || [])
    setLoading(false)
  }

  const filteredLecturers = lecturers.filter((lecturer) =>
    lecturer.full_name
      ?.toLowerCase()
      .includes(search.toLowerCase()) ||

    lecturer.email
      ?.toLowerCase()
      .includes(search.toLowerCase()) ||

    lecturer.department
      ?.toLowerCase()
      .includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="p-10 text-xl font-bold">
        Loading lecturers...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-6">

          <h1 className="text-3xl font-bold text-blue-900">
            Manage Lecturers
          </h1>

          <button
            onClick={getLecturers}
            className="bg-blue-900 text-white px-5 py-2 rounded-lg hover:bg-blue-800"
          >
            Refresh
          </button>

        </div>

        <input
          type="text"
          placeholder="Search lecturers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 border rounded-lg p-3 mb-6"
        />

        <div className="bg-white rounded-xl shadow overflow-hidden">

          <table className="w-full">

            <thead className="bg-blue-900 text-white">

              <tr>

                <th className="p-4 text-left">
                  Name
                </th>

                <th className="p-4 text-left">
                  Email
                </th>

                <th className="p-4 text-left">
                  Department
                </th>

                <th className="p-4 text-left">
                  Role
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredLecturers.length === 0 ? (

                <tr>

                  <td
                    colSpan="4"
                    className="p-6 text-center"
                  >
                    No lecturers found.
                  </td>

                </tr>

              ) : (

                filteredLecturers.map((lecturer) => (

                  <tr
                    key={lecturer.id}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="p-4 font-semibold">
                      {lecturer.full_name || "No name"}
                    </td>

                    <td className="p-4">
                      {lecturer.email || "No email"}
                    </td>

                    <td className="p-4">
                      {lecturer.department || "Not specified"}
                    </td>

                    <td className="p-4">

                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded">

                        {lecturer.role}

                      </span>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  )
}

export default ManageLecturers