import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { supabase } from "../lib/supabase"


function EditAnnouncement() {

  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: "",
    content: "",
    audience: "",
  })

  const [loading, setLoading] = useState(true)



  useEffect(() => {

    fetchAnnouncement()

  }, [])



  const fetchAnnouncement = async () => {

    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("id", id)
      .maybesingle()



    if (error) {

      alert(error.message)

      return

    }


    setForm({

      title: data.title,

      content: data.content,

      audience: data.audience,

    })


    setLoading(false)

  }





  const handleChange = (e) => {

    setForm({

      ...form,

      [e.target.name]: e.target.value,

    })

  }





  const updateAnnouncement = async (e) => {

    e.preventDefault()


    const { error } = await supabase
      .from("announcements")
      .update({

        title: form.title,

        content: form.content,

        audience: form.audience,

      })
      .eq("id", id)



    if (error) {

      alert(error.message)

      return

    }



    alert("Announcement updated successfully!")

    navigate("/manage-announcements")


  }





  if (loading) {

    return (

      <div className="p-10 text-xl">

        Loading...

      </div>

    )

  }





  return (

    <div className="min-h-screen bg-gray-100 p-8">


      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8">


        <h1 className="text-3xl font-bold text-blue-900 mb-6">

          Edit Announcement

        </h1>




        <form
          onSubmit={updateAnnouncement}
          className="space-y-5"
        >



          <input

            type="text"

            name="title"

            value={form.title}

            onChange={handleChange}

            className="w-full border rounded-lg p-3"

            required

          />





          <textarea

            name="content"

            value={form.content}

            onChange={handleChange}

            rows="5"

            className="w-full border rounded-lg p-3"

            required

          />





          <select

            name="audience"

            value={form.audience}

            onChange={handleChange}

            className="w-full border rounded-lg p-3"

          >

            <option value="students">
              Students
            </option>

            <option value="all">
              Everyone
            </option>

          </select>





          <button

            type="submit"

            className="w-full bg-blue-900 text-white py-3 rounded-lg"

          >

            Update Announcement

          </button>




        </form>


      </div>


    </div>

  )

}


export default EditAnnouncement