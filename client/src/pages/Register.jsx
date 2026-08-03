import { useState } from "react"
import { supabase } from "../lib/supabase"
import { useNavigate } from "react-router-dom"


function Register() {

  const navigate = useNavigate()


  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    level: ""
  })


  const [message, setMessage] = useState("")


  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })

  }



  const handleSubmit = async (e) => {

    e.preventDefault()

    setMessage("Creating account...")


    // Create authentication account

    const { data, error } = await supabase.auth.signUp({

      email: formData.email,

      password: formData.password

    })


    if (error) {

      setMessage(error.message)

      return

    }



    // Create profile

    const { error: profileError } = await supabase
      .from("profiles")
      .insert([

        {
          id: data.user.id,
          full_name: formData.full_name,
          email: formData.email,
          role: "student",
          level: formData.level,
          department: "Quantity Surveying"
        }

      ])



    if (profileError) {

      setMessage(profileError.message)

      return

    }



    setMessage("Account created successfully!")


    setTimeout(() => {

      navigate("/login")

    }, 2000)


  }




  return (

    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">


      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">


        <h1 className="text-3xl font-bold text-blue-900 text-center">
          Create Account
        </h1>


        <p className="text-gray-600 text-center mt-2">
          Join QS Nexus student portal
        </p>



        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >


          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            value={formData.full_name}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />



          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />



          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />



          <select
            name="level"
            value={formData.level}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          >

            <option value="">
              Select Level
            </option>

            <option value="100L">
              100L
            </option>

            <option value="200L">
              200L
            </option>

            <option value="300L">
              300L
            </option>

            <option value="400L">
              400L
            </option>

            <option value="500L">
              500L
            </option>

          </select>




          <button
            className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold"
          >
            Register
          </button>


        </form>


        <p className="text-center mt-4 text-gray-600">
          {message}
        </p>


      </div>


    </div>

  )

}


export default Register