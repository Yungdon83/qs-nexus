import { useState } from "react"
import { supabase } from "../lib/supabase"
import { useNavigate, Link } from "react-router-dom"

function Login() {
  const navigate = useNavigate()
  const logoUrl = `${import.meta.env.BASE_URL}qs-nexus-logo.svg`

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [message, setMessage] = useState("")

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setMessage("Logging in...")

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email.trim(),
      password: formData.password,
    })

    if (error) {
      setMessage(error.message || "Login failed. Please try again.")
      return
    }

    if (!data.user) {
      setMessage("Login failed. Please try again.")
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
    } else if (profile.role === "lecturer") {
      navigate("/lecturer-dashboard")
    } else if (profile.role === "admin") {
      navigate("/admin-dashboard")
    } else {
      setMessage("Unknown user role")
    }
  }

  return (
    <div className="min-h-screen qs-page bg-gray-100 dark:bg-slate-950 flex items-center justify-center px-4 py-6 sm:p-6">
      <div className="qs-card p-5 sm:p-8 w-full max-w-md">
        <img
          src={logoUrl}
          alt="QS Nexus"
          className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl mb-4"
        />

        <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 text-center dark:text-blue-300">
          Login
        </h1>

        <p className="text-sm sm:text-base text-gray-600 text-center mt-2 dark:text-gray-400">
          Access your QS Nexus account
        </p>

        {message && (
          <p
            role="alert"
            className="mt-4 text-center text-sm text-red-700 dark:text-red-300"
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 sm:space-y-5">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="qs-input w-full border rounded-lg p-3 bg-transparent text-sm sm:text-base"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="qs-input w-full border rounded-lg p-3 bg-transparent text-sm sm:text-base"
            required
          />

          <button
            type="submit"
            className="qs-button w-full bg-blue-900 text-white py-3 font-semibold hover:bg-blue-800 text-sm sm:text-base"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-5 text-sm text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="text-blue-900 dark:text-blue-300 font-bold hover:underline"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login