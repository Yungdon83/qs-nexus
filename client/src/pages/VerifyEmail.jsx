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
  const [status, setStatus] = useState(getVerificationError() ? "error" : "pending")
  const [message, setMessage] = useState(getVerificationError())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    function showVerified(user) {
      if (!mounted || !user || (!user.email_confirmed_at && !user.confirmed_at)) return

      setEmail(user.email || "")
      setStatus("verified")
      setMessage("Your email has been verified. You can now continue to QS Nexus.")
    }

    async function checkVerification() {
      const { data: { user } } = await supabase.auth.getUser()
      showVerified(user)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      showVerified(session?.user)
    })

    void checkVerification()
    return () => {
      mounted = false
      subscription.unsubscribe()
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
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    })

    if (error) {
      const isRateLimited = error.status === 429 || error.message?.toLowerCase().includes("rate")
      setStatus("error")
      setMessage(isRateLimited ? "Too many requests. Please wait a few minutes before trying again." : "We could not resend the verification email. Please try again later.")
    } else {
      setStatus("pending")
      setMessage("A new verification email has been sent. Check your inbox and spam folder.")
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen qs-page bg-gray-100 dark:bg-slate-950 flex items-center justify-center p-6">
      <section className="qs-card p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-300">
          {status === "verified" ? "Email verified" : "Verify your email"}
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          {message || "We've sent a verification link to your email address. Please verify your email before continuing to QS Nexus."}
        </p>

        {status !== "verified" && (
          <label className="block text-left mt-6">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email address</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="qs-input w-full border rounded-lg p-3 mt-2 bg-transparent" autoComplete="email" />
          </label>
        )}

        {status === "verified" ? (
          <button type="button" onClick={() => navigate("/login")} className="qs-button mt-6 w-full bg-blue-900 text-white py-3">Continue to login</button>
        ) : (
          <button type="button" onClick={resendVerification} disabled={loading} className="qs-button mt-6 w-full bg-blue-900 text-white py-3 disabled:opacity-60">
            {loading ? "Sending..." : "Resend verification email"}
          </button>
        )}

        <Link to="/login" className="block mt-4 text-blue-700 dark:text-blue-300 hover:underline">Back to login</Link>
      </section>
    </main>
  )
}

export default VerifyEmail
