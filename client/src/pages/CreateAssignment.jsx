import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import useAssignments from "../hooks/useAssignments"


function CreateAssignment() {

  const navigate = useNavigate()

  const { user } = useAuth()

  const {
    createAssignment,
    loading
  } = useAssignments()



  const [form, setForm] = useState({

    title: "",

    description: "",

    course_code: "",

    level: "",

    due_date: ""

  })



  function handleChange(e) {

    setForm({

      ...form,

      [e.target.name]: e.target.value

    })

  }




  async function handleSubmit(e) {

    e.preventDefault()


    if (!user) {

      alert("Please login first")

      return

    }



    try {


      await createAssignment({

        ...form,

        created_by: user.id

      })



      alert("Assignment created successfully")

      navigate("/manage-assignments")



    } catch (error) {

      alert(error.message)

    }

  }




  return (

    <div className="min-h-screen bg-gray-100 p-8">


      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8">


        <h1 className="text-3xl font-bold text-blue-900 mb-6">

          Create Assignment

        </h1>



        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >


          <input

            type="text"

            name="title"

            placeholder="Assignment title"

            value={form.title}

            onChange={handleChange}

            className="w-full border rounded-lg p-3"

            required

          />




          <textarea

            name="description"

            placeholder="Assignment description"

            value={form.description}

            onChange={handleChange}

            rows="5"

            className="w-full border rounded-lg p-3"

            required

          />




          <input

            type="text"

            name="course_code"

            placeholder="Course Code"

            value={form.course_code}

            onChange={handleChange}

            className="w-full border rounded-lg p-3"

            required

          />




          <input

            type="text"

            name="level"

            placeholder="Level (100L, 200L...)"

            value={form.level}

            onChange={handleChange}

            className="w-full border rounded-lg p-3"

            required

          />




          <label className="block font-semibold">

            Due Date

          </label>


          <input

            type="date"

            name="due_date"

            value={form.due_date}

            onChange={handleChange}

            className="w-full border rounded-lg p-3"

            required

          />




          <button

            type="submit"

            disabled={loading}

            className="w-full bg-blue-900 text-white py-3 rounded-lg"

          >

            {loading ? "Creating..." : "Create Assignment"}

          </button>



        </form>


      </div>


    </div>

  )

}


export default CreateAssignment