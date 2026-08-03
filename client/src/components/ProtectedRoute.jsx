import { Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"


function ProtectedRoute({ children, allowedRole }) {

  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)


  useEffect(() => {

    checkUser()

  }, [])



  async function checkUser() {

    const {
      data: { user },
    } = await supabase.auth.getUser()



    if (!user) {

      setLoading(false)
      return

    }



    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()



    if (
      profile &&
      profile.role === allowedRole
    ) {

      setAuthorized(true)

    }



    setLoading(false)

  }





  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center text-xl font-bold">

        Checking access...

      </div>

    )

  }





  if (!authorized) {

    return <Navigate to="/login" />

  }





  return children

}


export default ProtectedRoute