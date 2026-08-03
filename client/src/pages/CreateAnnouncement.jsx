import { useState } from "react"
import { supabase } from "../lib/supabase"
import { useNavigate } from "react-router-dom"


function CreateAnnouncement() {

  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: "",
    content: "",
    audience: "students",
  })

  const [loading, setLoading] = useState(false)



  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })

  }



  const handleSubmit = async (e) => {

    e.preventDefault()

    setLoading(true)


    const {
      data: { user },
    } = await supabase.auth.getUser()



    if (!user) {

      alert("You must be logged in")

      setLoading(false)

      return

    }



    const { error } = await supabase
      .from("announcements")
      .insert({

        title: form.title,

        content: form.content,

        audience: form.audience,

        posted_by: user.id,

      })



    if (error) {

      alert(error.message)

      setLoading(false)

      return

    }



    alert("Announcement posted successfully!")

    navigate("/lecturer-dashboard")

  }




  return (

    <div className="min-h-screen bg-gray-100 p-8">


      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8">


        <h1 className="text-3xl font-bold text-blue-900 mb-6">

          Create Announcement

        </h1>




        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >



          <input

            type="text"

            name="title"

            placeholder="Announcement title"

            value={form.title}

            onChange={handleChange}

            className="w-full border rounded-lg p-3"

            required

          />




          <textarea

            name="content"

            placeholder="Write announcement message"

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

            disabled={loading}

            className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800"

          >

            {loading ? "Posting..." : "Post Announcement"}

          </button>



        </form>



      </div>


    </div>

  )

}


export default CreateAnnouncement