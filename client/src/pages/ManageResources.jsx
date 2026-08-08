
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

function ManageResources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    fetchResources()
  }, [])

  async function fetchResources() {
    setLoading(true)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.log(userError.message)
      alert(userError.message)
      setLoading(false)
      return
    }

    if (!user) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("uploaded_by", user.id)
      .order("created_at", {
        ascending: false,
      })

    if (error) {
      console.log(error.message)
      alert(error.message)
    } else {
      setResources(data || [])
    }

    setLoading(false)
  }

  function getFileName(fileUrl) {
    if (!fileUrl) {
      return null
    }

    try {
      const url = new URL(fileUrl)

      const marker =
        "/storage/v1/object/public/resources/"

      const position = url.pathname.indexOf(marker)

      if (position === -1) {
        return null
      }

      return decodeURIComponent(
        url.pathname.substring(
          position + marker.length
        )
      )
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async function deleteResource(resource) {
    const confirmed = window.confirm(
      "Delete this resource permanently?"
    )

    if (!confirmed) {
      return
    }

    setDeletingId(resource.id)

    const fileName = getFileName(
      resource.file_url
    )

    if (fileName) {
      const { error: storageError } =
        await supabase.storage
          .from("resources")
          .remove([fileName])

      if (storageError) {
        console.log(storageError.message)

        alert(
          "Could not delete the Storage file: " +
            storageError.message
        )

        setDeletingId(null)
        return
      }
    }

    const { error: databaseError } =
      await supabase
        .from("resources")
        .delete()
        .eq("id", resource.id)

    if (databaseError) {
      console.log(databaseError.message)

      alert(
        "Could not delete the resource: " +
          databaseError.message
      )

      setDeletingId(null)
      return
    }

    setResources((current) =>
      current.filter(
        (item) => item.id !== resource.id
      )
    )

    setDeletingId(null)

    alert("Resource deleted successfully.")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl font-bold text-blue-900">
          Loading resources...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold text-blue-900 mb-8">
          My Uploaded Resources
        </h1>

        {resources.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8">
            <p className="text-gray-600">
              You have not uploaded any resources yet.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">

            {resources.map((resource) => (
              <div
                key={resource.id}
                className="bg-white rounded-xl shadow p-6"
              >

                <h2 className="text-xl font-bold text-blue-900">
                  {resource.title}
                </h2>

                <p className="mt-2 text-gray-600">
                  {resource.description ||
                    "No description provided."}
                </p>

                <p className="mt-3 text-sm text-gray-500">
                  Course:{" "}
                  {resource.course_code || "N/A"}
                </p>

                <p className="text-sm text-gray-500">
                  Level:{" "}
                  {resource.level || "N/A"}
                </p>

                <p className="text-sm text-gray-500">
                  Type:{" "}
                  {resource.resource_type || "Resource"}
                </p>

                <div className="flex gap-3 mt-5">

                  <a
                    href={resource.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-blue-900 text-white px-4 py-2 rounded-lg"
                  >
                    Open File
                  </a>

                  <button
                    onClick={() =>
                      deleteResource(resource)
                    }
                    disabled={
                      deletingId === resource.id
                    }
                    className="bg-red-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
                  >
                    {deletingId === resource.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  )
}

export default ManageResources

