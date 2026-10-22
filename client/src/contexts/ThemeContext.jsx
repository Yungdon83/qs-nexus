import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("qs-nexus-theme")

    return savedTheme === "dark"
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("qs-nexus-theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("qs-nexus-theme", "light")
    }
  }, [darkMode])

  function toggleTheme() {
    setDarkMode((current) => !current)
  }

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}