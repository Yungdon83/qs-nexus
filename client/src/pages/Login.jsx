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
    setVerificationEmail("")

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email.trim(),
      password: formData.password
    })

    if (error) {
      const isUnverified =
        error.code === "email_not_confirmed" ||
        error.message?.toLowerCase().includes("confirm")

      setVerificationEmail(isUnverified ? formData.email.trim() : "")
      setMessage(
        isUnverified
          ? "Please verify your email before logging in."
          : error.message
      )

      return
    }

    if (!data.user) {
      setMessage("Login failed. Please try again.")
      return
    }

    if (!data.user.email_confirmed_at && !data.user.confirmed_at) {
      await supabase.auth.signOut()
      setVerificationEmail(formData.email.trim())
      setMessage("Please verify your email before logging in.")
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

  const resendVerification = async () => {
    if (!verificationEmail) return

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: verificationEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`
      }
    })

    setMessage(
      error
        ? error.message
        : "A new verification email has been sent."
    )
  }

  return (
    <div className="min-h-screen qs-page bg-gray-100 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="qs-card p-8 w-full max-w-md">

        <img
          src="/qs-nexus-logo.svg"
          alt="QS Nexus"
          className="w-16 h-16 mx-auto rounded-2xl mb-4"
        />

        <h1 className="text-3xl font-bold text-blue-900 text-center">
          Login
        </h1>

        <p className="text-gray-600 text-center mt-2">
          Access your QS Nexus account
        </p>

        {message && (
          <p
            role="alert"
            className="mt-5 text-center text-red-700 dark:text-red-300"
          >
            {message}
          </p>
        )}

        {verificationEmail && (
          <button
            type="button"
            onClick={resendVerification}
            className="mt-3 w-full text-blue-900 dark:text-blue-300 font-semibold hover:underline"
          >
            Resend verification email
          </button>
        )}

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

        <p className="text-center mt-5 text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
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