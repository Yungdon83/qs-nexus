import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

function getVerificationError() {
  const query = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""))
  const code = query.get("error_code") || hash.get("error_code")
  const description = query.get("error_description") || hash.get("error_description")

  if (!code && !description) return ""
  if (code === "otp_expired" || description?.toLowerCase().includes("expired")) {
    return "This verification link has expired. Request a new verification email below."
  }
  return "This verification link is invalid or has already been used. Request a new verification email below."
}

function VerifyEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState(location.state?.email || "")
  const [status, setStatus] = useState(getVerificationError() ? "error" : "info")
  const [message, setMessage] = useState(getVerificationError() || "Email verification is not required to use QS Nexus. You can continue to your account immediately.")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!mounted || !user) return

      setEmail(user.email || "")
      setStatus("info")
      setMessage("Email verification is not required to use QS Nexus. You can continue to your account immediately.")
    }

    void checkUser()
    return () => {
      mounted = false
    }
  }, [])

  async function resendVerification() {
    if (!email.trim()) {
      setStatus("error")
      setMessage("Enter the email address used to register.")
      return
    }

    setLoading(true)
    setMessage("")

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
    })

    if (error) {
      const isRateLimited = error.status === 429 || error.message?.toLowerCase().includes("rate")
      setStatus("error")
      setMessage(isRateLimited ? "Too many requests. Please wait a few minutes before trying again." : "We could not send a verification email right now. You can still sign in and use QS Nexus.")
    } else {
      setStatus("info")
      setMessage("A verification email was requested. If your Supabase project requires email confirmation, it may still be enforced in the dashboard settings.")
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen qs-page bg-gray-100 dark:bg-slate-950 flex items-center justify-center px-4 py-6 sm:p-6">
      <section className="qs-card p-5 sm:p-8 w-full max-w-md text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-300">
          {status === "error" ? "Verification notice" : "QS Nexus access"}
        </h1>
        <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          {message}
        </p>

        <label className="block text-left mt-6">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email address</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="qs-input w-full border rounded-lg p-3 mt-2 bg-transparent text-sm sm:text-base" autoComplete="email" />
        </label>

        <button type="button" onClick={resendVerification} disabled={loading} className="qs-button mt-6 w-full bg-blue-900 text-white py-3 disabled:opacity-60 text-sm sm:text-base">
          {loading ? "Sending..." : "Request email verification"}
        </button>

        <button type="button" onClick={() => navigate("/login")} className="qs-button mt-3 w-full border border-blue-200 bg-white text-blue-900 py-3 text-sm sm:text-base dark:border-slate-700 dark:bg-slate-900 dark:text-blue-300">
          Continue to login
        </button>

        <Link to="/login" className="block mt-4 text-sm text-blue-700 dark:text-blue-300 hover:underline">Back to login</Link>
      </section>
    </main>
  )
}

export default VerifyEmail
