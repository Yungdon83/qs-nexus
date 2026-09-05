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
  const [verificationEmail, setVerificationEmail] = useState("")



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
      const isUnverified = error.code === "email_not_confirmed" || error.message?.toLowerCase().includes("confirm")
      setVerificationEmail(isUnverified ? formData.email : "")
      setMessage(isUnverified ? "Please verify your email before logging in." : error.message)

      return


    if (!data.user.email_confirmed_at && !data.user.confirmed_at) {
      await supabase.auth.signOut()
      setVerificationEmail(formData.email)
      setMessage("Please verify your email before logging in.")
      return
    }
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

    <div className="min-h-screen qs-page bg-gray-100 dark:bg-slate-950 flex items-center justify-center p-6">


      <div className="qs-card p-8 w-full max-w-md">

        <img src="/qs-nexus-logo.svg" alt="QS Nexus" className="w-16 h-16 mx-auto rounded-2xl mb-4" />



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

            className="qs-input w-full border rounded-lg p-3 bg-transparent"

            required

          />





          <input

            type="password"

            name="password"

            placeholder="Password"

            value={formData.password}

            onChange={handleChange}

            className="qs-input w-full border rounded-lg p-3 bg-transparent"

            required

          />





          <button

            type="submit"

            className="qs-button w-full bg-blue-900 text-white py-3 font-semibold hover:bg-blue-800"

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

        {verificationEmail && (
          <Link
            to="/verify-email"
            state={{ email: verificationEmail }}
            className="block text-center mt-3 text-blue-700 hover:underline"
          >
            Verify your email or resend the verification link
          </Link>
        )}




      </div>


    </div>

  )

}


export default Login