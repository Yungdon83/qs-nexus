import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../lib/supabase"


const AuthContext = createContext()



export function AuthProvider({ children }) {

  const [user, setUser] = useState(null)

  const [profile, setProfile] = useState(null)

  const [loading, setLoading] = useState(true)



  useEffect(() => {

    getSession()



    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {

        setUser(session?.user || null)

      }
    )



    return () => {

      subscription.unsubscribe()

    }


  }, [])





  async function getSession() {

    const {
      data: { session },
    } = await supabase.auth.getSession()



    const currentUser = session?.user || null


    setUser(currentUser)



    if (currentUser) {

      await getProfile(currentUser.id)

    }



    setLoading(false)

  }





  async function getProfile(userId) {


    const { data, error } = await supabase

      .from("profiles")

      .select("*")

      .eq("id", userId)

      .maybeSingle()



    if (error) {

      console.log(error.message)

      return

    }



    setProfile(data)


  }





  async function logout() {

    await supabase.auth.signOut()

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