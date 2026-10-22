import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

function Register() {
  const navigate = useNavigate()
  const logoUrl = `${import.meta.env.BASE_URL}qs-nexus-logo.svg`
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    department: "Quantity Surveying",
    level: "100L",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError("")

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          full_name: form.full_name.trim(),
          department: form.department,
          level: form.level,
          role: "student",
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setError("We could not create your account. Please try again.")
      setLoading(false)
      return
    }

    navigate("/login", { state: { email: form.email.trim() } })
  }

  return (
    <main className="min-h-screen qs-page bg-gray-100 dark:bg-slate-950 flex items-center justify-center px-4 py-6 sm:p-8">
      <div className="qs-card p-5 sm:p-8 w-full max-w-md">
        <img src={logoUrl} alt="QS Nexus" className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl mb-4" />
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-300 mb-2">Create Account</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-5 sm:mb-6">Register as a QS Nexus student.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
          <input type="text" name="full_name" placeholder="Full Name" value={form.full_name} onChange={handleChange} className="qs-input w-full border p-3 rounded-lg bg-transparent text-sm sm:text-base" required />
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="qs-input w-full border p-3 rounded-lg bg-transparent text-sm sm:text-base" required />
          <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} minLength={6} className="qs-input w-full border p-3 rounded-lg bg-transparent text-sm sm:text-base" required />
          <select name="level" value={form.level} onChange={handleChange} className="qs-input w-full border p-3 rounded-lg bg-transparent text-sm sm:text-base" aria-label="Level">
            {['100L', '200L', '300L', '400L', '500L'].map((level) => <option key={level}>{level}</option>)}
          </select>
          <button type="submit" disabled={loading} className="qs-button w-full bg-blue-900 text-white py-3 disabled:opacity-60 text-sm sm:text-base">
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="text-center mt-5 text-sm text-gray-600 dark:text-gray-400">
          Already have an account? <Link to="/login" className="text-blue-900 dark:text-blue-300 font-bold hover:underline">Login</Link>
        </p>
      </div>
    </main>
  )
}

export default Register
