
import { supabase } from "../lib/supabase"
import { useNavigate } from "react-router-dom"

function LogoutButton() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()

    navigate("/login")
  }

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
    >
      Logout
    </button>
  )
}

export default LogoutButton

