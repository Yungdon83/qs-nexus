import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    loadNotifications()
  }, [])

  async function loadNotifications() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    if (error) {
      console.log("NOTIFICATION ERROR:", error.message)
      return
    }

    setNotifications(data || [])
  }

  async function markRead(id) {
    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("id", id)

    if (error) {
      console.log("MARK READ ERROR:", error.message)
      return
    }

    loadNotifications()
  }

  const unread = notifications.filter(
    (item) => !item.is_read
  ).length

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative text-2xl"
      >
        🔔

        {unread > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white text-black rounded-xl shadow-xl z-50 p-4">
          <h3 className="font-bold text-lg mb-3">
            Notifications
          </h3>

          {notifications.length === 0 ? (
            <p className="text-gray-500">
              No notifications
            </p>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => markRead(item.id)}
                className={`border-b py-3 cursor-pointer ${
                  item.is_read
                    ? "bg-white"
                    : "bg-blue-50"
                }`}
              >
                <h4 className="font-bold">
                  {item.title}
                </h4>

                <p className="text-sm text-gray-600">
                  {item.message}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell