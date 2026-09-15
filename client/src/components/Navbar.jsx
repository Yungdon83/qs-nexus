import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import NotificationBell from "./NotificationBell"
import { useTheme } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"

function Navbar() {
  const { darkMode, toggleTheme } = useTheme()
  const { user, profile, logout } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const logoUrl = `${import.meta.env.BASE_URL}qs-nexus-logo.svg`

  const role = profile?.role
  const mobileLinks = role === "student"
    ? [
        ["/student-dashboard", "Home", "⌂"],
        ["/courses", "Courses", "▦"],
        ["/library", "Library", "▤"],
        ["/student-assignments", "Tasks", "✓"],
      ]
    : role === "lecturer"
      ? [
          ["/lecturer-dashboard", "Home", "⌂"],
          ["/manage-assignments", "Tasks", "✓"],
          ["/library", "Library", "▤"],
          ["/grade-submissions", "Grade", "□"],
        ]
      : [
          ["/admin-dashboard", "Home", "⌂"],
          ["/manage-students", "Students", "♙"],
          ["/manage-courses", "Courses", "▦"],
          ["/library", "Library", "▤"],
        ]

  const links = [
    ["/", "Home"],
    ["/about", "About"],
    ["/courses", "Courses"],
    ["/library", "Library"],
    ["/resources", "Resources"],
    ["/timetable", "Timetable"],
  ]

  function isActive(path) {
    return path === "/" ? location.pathname === path : location.pathname.startsWith(path)
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/90 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">

        <Link
          to="/"
          className="flex items-center gap-2 sm:gap-3 min-w-0"
        >
          <img src={logoUrl} alt="QS Nexus" className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl shadow-lg shadow-blue-900/20" />

          <div className="min-w-0">
            <h1 className="font-bold text-base sm:text-xl text-blue-900 dark:text-blue-400 leading-tight">
              QS Nexus
            </h1>

            <p className="hidden sm:block text-[11px] text-gray-500 dark:text-gray-400">
              Quantity Surveying Portal
            </p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1 rounded-full bg-slate-100/80 p-1 dark:bg-slate-800/80">
          {links.map(([path, label]) => (
            <Link
              key={path}
              to={path}
              className={`rounded-full px-3 py-2 text-sm font-semibold transition ${isActive(path) ? "bg-white text-blue-900 shadow-sm dark:bg-slate-700 dark:text-yellow-300" : "text-gray-600 hover:text-blue-900 dark:text-gray-300 dark:hover:text-yellow-300"}`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">

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
            className="hidden sm:inline-flex qs-button bg-blue-900 text-white px-5 py-2 hover:bg-blue-800"
          >
            Login
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="md:hidden w-10 h-10 rounded-xl bg-slate-100 text-blue-900 dark:bg-slate-800 dark:text-white"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {menuOpen ? "×" : "☰"}
          </button>

        </div>

      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-slate-200/70 bg-white px-4 py-3 dark:border-slate-700/70 dark:bg-slate-900 qs-stagger">
          {links.map(([path, label]) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMenuOpen(false)}
              className={`block rounded-xl px-4 py-3 font-semibold ${isActive(path) ? "bg-blue-50 text-blue-900 dark:bg-slate-800 dark:text-yellow-300" : "text-gray-700 dark:text-gray-200"}`}
            >
              {label}
            </Link>
          ))}
          <Link to="/login" onClick={() => setMenuOpen(false)} className="mt-2 block rounded-xl bg-blue-900 px-4 py-3 text-center font-semibold text-white">Login</Link>
          {user && (
            <button type="button" onClick={() => { setMenuOpen(false); void logout() }} className="mt-2 block w-full rounded-xl border border-red-200 px-4 py-3 text-center font-semibold text-red-700 dark:border-red-900 dark:text-red-300">Log out</button>
          )}
        </div>
      )}

      {user && role && (
        <nav className="qs-mobile-nav md:hidden" aria-label="Mobile navigation">
          {mobileLinks.map(([path, label, icon]) => (
            <Link key={path} to={path} className={isActive(path) ? "qs-mobile-nav-link active" : "qs-mobile-nav-link"} aria-current={isActive(path) ? "page" : undefined}>
              <span className="qs-mobile-nav-icon" aria-hidden="true">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
          <button type="button" className="qs-mobile-nav-link" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen}>
            <span className="qs-mobile-nav-icon" aria-hidden="true">•••</span>
            <span>More</span>
          </button>
        </nav>
      )}
    </nav>
  )
}

export default Navbar