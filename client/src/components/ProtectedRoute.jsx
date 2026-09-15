import { Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

function ProtectedRoute({ children, role }) {
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    let mounted = true

    async function checkUser() {
      try {
        setLoading(true)
        setAllowed(false)

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Session error:", sessionError)
          return
        }

        if (!session?.user) {
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle()

        if (profileError) {
          console.error("Profile error:", profileError)
          return
        }

        const allowedRoles = Array.isArray(role) ? role : [role]

        if (allowedRoles.includes(profile?.role) && mounted) {
          setAllowed(true)
        }
      } catch (error) {
        console.error("Protected route error:", error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    checkUser()

    return () => {
      mounted = false
    }
  }, [role])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 px-4">
        <p className="font-bold text-blue-900 dark:text-blue-400 text-sm sm:text-base">
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