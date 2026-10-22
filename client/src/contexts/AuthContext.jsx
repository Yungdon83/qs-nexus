
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { supabase } from "../lib/supabase"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const profileRequestRef = useRef(0)

  useEffect(() => {
    let mounted = true

    async function getSession() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Session error:", error)
          return
        }

        const currentUser = session?.user || null

        if (!mounted) return

        setUser(currentUser)

        if (currentUser) {
          await getProfile(currentUser.id)
        } else {
          setProfile(null)
        }
      } catch (error) {
        console.error("Authentication error:", error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return

        const currentUser = session?.user || null

        setUser(currentUser)

        if (!currentUser) {
          profileRequestRef.current += 1
          setProfile(null)
          setLoading(false)
          return
        }

        setProfile(null)
        setLoading(true)

        window.setTimeout(() => {
          if (!mounted) return

          void getProfile(currentUser.id).finally(() => {
            if (mounted) setLoading(false)
          })
        }, 0)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function getProfile(userId) {
    const requestId = profileRequestRef.current + 1
    profileRequestRef.current = requestId

    if (!userId) {
      setProfile(null)
      return
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    if (error) {
      console.error("Profile error:", error)
      if (profileRequestRef.current === requestId) {
        setProfile(null)
      }
      return
    }

    if (profileRequestRef.current === requestId) {
      setProfile(data || null)
    }
  }

  async function logout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Logout error:", error)
      return
    }

    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

