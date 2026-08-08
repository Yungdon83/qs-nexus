
import { Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

function ProtectedRoute({ children, role }) {
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    checkUser()
  }, [role])

  async function checkUser() {
    setLoading(true)
    setAllowed(false)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("User error:", userError)
        setLoading(false)
        return
      }

      if (!user) {
        setLoading(false)
        return
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) {
        console.error("Profile error:", profileError)
        setLoading(false)
        return
      }

      if (profile?.role === role) {
        setAllowed(true)
      }

    } catch (error) {
      console.error("Protected route error:", error)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="p-10 font-bold text-blue-900">
          Checking access...
        </p>
      </div>
    )
  }

  if (!allowed) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute

