import { Link } from "react-router-dom"
import NotificationBell from "./NotificationBell"
import { useTheme } from "../contexts/ThemeContext"

function Navbar() {
  const { darkMode, toggleTheme } = useTheme()

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 shadow-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        <Link
          to="/"
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center">
            <span className="text-yellow-400 font-bold text-xl">
              QS
            </span>
          </div>

          <div>
            <h1 className="font-bold text-xl text-blue-900 dark:text-blue-400">
              QS Nexus
            </h1>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Quantity Surveying Portal
            </p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">

          <Link
            to="/"
            className="text-gray-700 dark:text-gray-200 hover:text-blue-900 dark:hover:text-blue-400 font-medium"
          >
            Home
          </Link>

          <Link
            to="/about"
            className="text-gray-700 dark:text-gray-200 hover:text-blue-900 dark:hover:text-blue-400 font-medium"
          >
            About
          </Link>

          <Link
            to="/courses"
            className="text-gray-700 dark:text-gray-200 hover:text-blue-900 dark:hover:text-blue-400 font-medium"
          >
            Courses
          </Link>

          <Link
            to="/resources"
            className="text-gray-700 dark:text-gray-200 hover:text-blue-900 dark:hover:text-blue-400 font-medium"
          >
            Resources
          </Link>

          <Link
            to="/timetable"
            className="text-gray-700 dark:text-gray-200 hover:text-blue-900 dark:hover:text-blue-400 font-medium"
          >
            Timetable
          </Link>

        </div>

        <div className="flex items-center gap-4">

          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-xl hover:scale-105 transition"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          <NotificationBell />

          <Link
            to="/login"
            className="bg-blue-900 text-white px-5 py-2 rounded-xl hover:bg-blue-800"
          >
            Login
          </Link>

        </div>

      </div>
    </nav>
  )
}

export default Navbar