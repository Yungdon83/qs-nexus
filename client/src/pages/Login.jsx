import { useState } from "react"
import { supabase } from "../lib/supabase"
import { useNavigate, Link } from "react-router-dom"


function Login() {

  const navigate = useNavigate()


  const [formData, setFormData] = useState({
    email: "",
    password: ""
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

    setMessage("Logging in...")



    const { data, error } = await supabase.auth.signInWithPassword({

      email: formData.email,

      password: formData.password

    })



    if (error) {

      setMessage(error.message)

      return

    }





    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single()



    if (profileError) {

      setMessage(profileError.message)

      return

    }





    if (profile.role === "student") {

      navigate("/student-dashboard")

    }


    else if (profile.role === "lecturer") {

      navigate("/lecturer-dashboard")

    }


    else if (profile.role === "admin") {

      navigate("/admin-dashboard")

    }


    else {

      setMessage("Unknown user role")

    }


  }







  return (

    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">


      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">



        <h1 className="text-3xl font-bold text-blue-900 text-center">

          Login

        </h1>



        <p className="text-gray-600 text-center mt-2">

          Access your QS Nexus account

        </p>





        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >



          <input

            type="email"

            name="email"

            placeholder="Email"

            value={formData.email}

            onChange={handleChange}

            className="w-full border rounded-lg p-3"

            required

          />





          <input

            type="password"

            name="password"

            placeholder="Password"

            value={formData.password}

            onChange={handleChange}

            className="w-full border rounded-lg p-3"

            required

          />





          <button

            type="submit"

            className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800"

          >

            Login

          </button>



        </form>





        <p className="text-center mt-5 text-gray-600">

          Don't have an account?{" "}

          <Link

            to="/register"

            className="text-blue-900 font-bold hover:underline"

          >

            Create Account

          </Link>

        </p>





        <p className="text-center mt-4 text-gray-600">

          {message}

        </p>




      </div>


    </div>

  )

}


export default Login